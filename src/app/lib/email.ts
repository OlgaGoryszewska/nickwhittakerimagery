import nodemailer from "nodemailer";
import type { CartItem } from "@/app/components/CartContext";
import type { OrderTotals } from "@/app/lib/pricing";

const ORDER_FROM_EMAIL = "Nick Whittaker Imagery <order@nickwhittakerimagery.com>";

// Sends via the order@ Google Workspace mailbox's SMTP, authenticated with
// an App Password (requires 2-Step Verification on that account — see
// myaccount.google.com/apppasswords). Built once per process rather than
// per send since nodemailer transports are meant to be reused.
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD;
  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporter;
}

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export type OrderConfirmationEmailParams = {
  to: string;
  orderId: string;
  customerName: string;
  items: CartItem[];
  totals: OrderTotals;
};

// Best-effort: the order is already recorded in Supabase by the time this
// is called, so a failed/skipped send should never surface as a failed
// checkout — it only logs. The customer already sees their order number
// on-screen regardless of whether this email lands.
export async function sendOrderConfirmationEmail({
  to,
  orderId,
  customerName,
  items,
  totals,
}: OrderConfirmationEmailParams): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("sendOrderConfirmationEmail: GMAIL_SMTP_USER/GMAIL_SMTP_APP_PASSWORD not set, skipping order email to", to);
    return;
  }

  const orderNumber = `#${orderId.slice(0, 8).toUpperCase()}`;

  const itemRows = items
    .map((item) => {
      const framing =
        item.framing === "No Frame" ? "No Frame" : `${item.framing}${item.frameColor ? ` — ${item.frameColor}` : ""}`;
      return `<li>${escapeHtml(item.title)} — ${escapeHtml(item.size)}, ${escapeHtml(framing)} — Qty ${item.qty} — ${formatNzd(item.priceValue * item.qty)}</li>`;
    })
    .join("");

  const html = `
    <p>Hi ${customerName ? escapeHtml(customerName) : "there"},</p>
    <p>Thanks for your order — we&rsquo;ve received your request.</p>
    <p><strong>Order ${orderNumber}</strong></p>
    <ul>${itemRows}</ul>
    <p>
      Subtotal: ${formatNzd(totals.subtotal)}<br/>
      Shipping: ${totals.shipping === 0 ? "Free" : formatNzd(totals.shipping)}<br/>
      ${totals.tax > 0 ? `Includes GST: ${formatNzd(totals.tax)}<br/>` : ""}
      <strong>Total: ${formatNzd(totals.total)}</strong>
    </p>
    <p>We&rsquo;ll be in touch shortly to confirm payment details. Keep your order number handy if you need to reach us about it.</p>
    <p>— Nick Whittaker Imagery</p>
  `;

  try {
    await transport.sendMail({
      from: ORDER_FROM_EMAIL,
      to,
      subject: `Order confirmation ${orderNumber} — Nick Whittaker Imagery`,
      html,
    });
  } catch (err) {
    console.error("sendOrderConfirmationEmail error:", err);
  }
}
