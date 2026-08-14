import type { Metadata } from "next";
import { requireAdmin } from "@/app/lib/admin";
import { createAdminClient } from "@/app/lib/supabase/admin";
import OrderStatusSelect from "@/app/admin/OrderStatusSelect";
import type { OrderStatus } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin — Orders",
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
  email: string;
  name: string;
  address: string;
  shipping_region: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items: OrderItemRow[];
};

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

export default async function AdminOrdersPage() {
  await requireAdmin();

  // Uses the service-role client deliberately: Nick needs to see every
  // order (including guest orders with no user_id), which the RLS select
  // policy scoped to auth.uid() = user_id would never return. Safe here
  // only because requireAdmin() has already gated this whole page.
  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, email, name, address, shipping_region, status, total, created_at, order_items(id, title, size, framing, frame_color, qty, line_total)"
    )
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  return (
    <section className="tight">
      <div className="wrap journal-article">
        <div className="section-head">
          <h1>Orders</h1>
          <p className="lede">
            {orders?.length ?? 0} order{orders?.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="journal-body">
          {error && <p>Couldn&rsquo;t load orders: {error.message}</p>}

          {!error && (!orders || orders.length === 0) ? (
            <p>No orders yet.</p>
          ) : (
            <div className="account-orders-wrap">
              <table className="account-orders">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Shipping region</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders!.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.created_at).toLocaleDateString("en-NZ")}</td>
                      <td>
                        {order.name}
                        <br />
                        <a href={`mailto:${order.email}`}>{order.email}</a>
                        <br />
                        {order.address}
                      </td>
                      <td>
                        {order.order_items.map((item) => (
                          <div key={item.id}>
                            {item.title} — {item.size}
                            {item.framing !== "No Frame"
                              ? `, ${item.framing}${item.frame_color ? ` (${item.frame_color})` : ""}`
                              : ""}{" "}
                            × {item.qty}
                          </div>
                        ))}
                      </td>
                      <td>{order.shipping_region}</td>
                      <td>{formatNzd(order.total)}</td>
                      <td>
                        <OrderStatusSelect orderId={order.id} status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
