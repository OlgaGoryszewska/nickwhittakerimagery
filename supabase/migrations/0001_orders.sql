-- Everything this app needs in Supabase: user profiles (login/sign-up itself
-- needs no SQL — that's handled by Supabase Auth's built-in auth.users
-- table, used directly in src/app/login/page.tsx and
-- src/app/auth/confirm/route.ts) plus orders + order_items.
--
-- ============================================================================
-- Profiles
-- ============================================================================
-- Account-facing data that doesn't belong in auth.users (display name, etc.),
-- auto-provisioned the moment someone signs up via a trigger on auth.users.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Users can only ever see/edit their own profile row — no policy exists for
-- other users' rows, and there's no select/update policy for the anon role
-- at all, so a signed-out visitor can't read profiles through the API.
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policy for anon/authenticated — rows are only ever
-- created by the trigger below (which runs as the table owner, bypassing
-- RLS) and removed automatically via the `on delete cascade` FK when the
-- underlying auth.users row is deleted.

-- Keeps `updated_at` accurate on every profile edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();

-- Auto-creates a profile row the moment a new auth.users row appears, so the
-- app never has to special-case "signed up but no profile yet".
-- `security definer` is required here: this runs in the auth.users insert's
-- transaction, before the new user has any session, so it must run with the
-- function owner's privileges rather than the (nonexistent) caller's.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Orders + order_items
-- ============================================================================
-- All writes happen server-side via the service-role client
-- (src/app/lib/orders.ts), which bypasses RLS entirely — there is no
-- insert/update/delete policy for the anon/authenticated roles, only select
-- policies scoped to the owning user. Guest orders (user_id null) aren't
-- selectable by anyone through the API, only visible via the Supabase
-- dashboard.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text not null,
  name text not null,
  address text not null,
  shipping_region text not null,
  subtotal numeric not null,
  shipping numeric not null,
  tax numeric not null,
  total numeric not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  photo_slug text not null,
  title text not null,
  size text not null,
  framing text not null,
  frame_color text,
  qty int not null,
  unit_price numeric not null,
  line_total numeric not null
);

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can view their own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
