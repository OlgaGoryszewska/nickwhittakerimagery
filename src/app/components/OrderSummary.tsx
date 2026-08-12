import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/app/components/CartContext";

function formatNzd(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, "")} NZD`;
}

// Read-only review of cart contents — used on /checkout. The editable cart
// list on /cart (quantity controls, remove) is structurally different
// enough (an extra grid column of controls) that it stays as its own
// markup there rather than forcing both into one shared component.
export default function OrderSummary({ items }: { items: CartItem[] }) {
  return (
    <ul className="order-summary">
      {items.map((item) => (
        <li key={item.id} className="order-summary__item">
          <Link
            href={`/${item.categorySlug}/${item.photoSlug}`}
            className="order-summary__mat"
            aria-label={`View ${item.title}`}
          >
            <Image src={item.photoSrc} alt={item.title} width={80} height={60} />
          </Link>

          <div className="order-summary__info">
            <h3>{item.title}</h3>
            <p className="order-summary__meta">
              {item.size} —{" "}
              {item.framing === "No Frame"
                ? "No Frame"
                : `${item.framing}${item.frameColor ? ` — ${item.frameColor}` : ""}`}
            </p>
            <p className="order-summary__qty">Qty {item.qty}</p>
          </div>

          <span className="order-summary__line-total">{formatNzd(item.priceValue * item.qty)}</span>
        </li>
      ))}
    </ul>
  );
}
