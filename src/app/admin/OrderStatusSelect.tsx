"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, type OrderStatus } from "@/app/admin/actions";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "paid", "cancelled"];

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [current, setCurrent] = useState<OrderStatus>(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    const previous = current;
    setCurrent(next);
    setError(null);

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (!result.ok) {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <select className="field-input" value={current} onChange={handleChange} disabled={pending}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="cart-summary__note cart-summary__note--error">{error}</p>}
    </div>
  );
}
