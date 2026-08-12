import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Reveal from "@/app/components/Reveal";
import { createClient, getCurrentUser } from "@/app/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Account — Nick Whittaker Imagery",
  robots: { index: false, follow: false },
};

type OrderItemRow = {
  id: string;
  title: string;
  size: string;
  framing: string;
  frame_color: string | null;
  qty: number;
  line_total: number;
};

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItemRow[];
};

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?returnTo=/account");
  }

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, order_items(id, title, size, framing, frame_color, qty, line_total)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  return (
    <section className="tight">
      <div className="wrap journal-article">
        <Reveal className="section-head">
          <h1>My Account</h1>
          <p className="lede">{user.email}</p>
        </Reveal>

        <div className="journal-body">
          <h2>Order history</h2>
          {!orders || orders.length === 0 ? (
            <p>
              No orders yet — browse the <Link href="/gallery">gallery</Link> to place your first order.
            </p>
          ) : (
            <div className="account-orders-wrap">
              <table className="account-orders">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString("en-NZ")}</td>
                      <td>{order.order_items.map((item) => `${item.title} (${item.size})`).join(", ")}</td>
                      <td>{order.status}</td>
                      <td>{formatNzd(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form action="/auth/signout" method="post" className="trade-links">
          <button type="submit" className="btn-link">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
