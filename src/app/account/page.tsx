import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Reveal from "@/app/components/Reveal";
import { customerAccountGraphql } from "@/app/lib/shopify/customer-account/customer-graphql";
import { getCustomerSession, getRefreshToken } from "@/app/lib/shopify/customer-account/session";

export const metadata: Metadata = {
  title: "My Account — Nick Whittaker Imagery",
  robots: { index: false, follow: false },
};

// Field names below follow Shopify's documented Customer Account API schema
// conventions but haven't been verified against a live store yet — the
// Customer Account API isn't reachable until SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID
// is filled in via the Headless channel setup. Confirm against the live
// schema (e.g. via a GraphiQL introspection) the first time login is tested.
const CUSTOMER_QUERY = `
  query CustomerAccount {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

type CustomerAccountData = {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      nodes: {
        id: string;
        name: string;
        processedAt: string;
        financialStatus: string | null;
        fulfillmentStatus: string | null;
        totalPrice: { amount: string; currencyCode: string };
      }[];
    };
  };
};

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    const refreshToken = await getRefreshToken();
    redirect(refreshToken ? "/auth/refresh?returnTo=/account" : "/auth/login?returnTo=/account");
  }

  const { customer } = await customerAccountGraphql<CustomerAccountData>(session.accessToken, CUSTOMER_QUERY);

  return (
    <section className="tight">
      <div className="wrap journal-article">
        <Reveal className="section-head">
          <h1>My Account</h1>
          {customer.firstName && <p className="lede">Welcome back, {customer.firstName}.</p>}
        </Reveal>

        <div className="journal-body">
          {customer.emailAddress && <p>{customer.emailAddress.emailAddress}</p>}

          <h2>Order history</h2>
          {customer.orders.nodes.length === 0 ? (
            <p>
              No orders yet — browse the <Link href="/gallery">gallery</Link> to place your first order.
            </p>
          ) : (
            <div className="account-orders-wrap">
              <table className="account-orders">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Fulfillment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.nodes.map((order) => (
                    <tr key={order.id}>
                      <td>{order.name}</td>
                      <td>{new Date(order.processedAt).toLocaleDateString("en-NZ")}</td>
                      <td>{order.financialStatus ?? "—"}</td>
                      <td>{order.fulfillmentStatus ?? "—"}</td>
                      <td>
                        {order.totalPrice.currencyCode} {order.totalPrice.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form action="/auth/logout" method="post" className="trade-links">
          <button type="submit" className="btn-link">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
