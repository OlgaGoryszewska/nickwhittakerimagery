-- Orders + order_items. All writes happen server-side via the service-role
-- client (src/app/lib/orders.ts), which bypasses RLS entirely — there is no
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
