import Image from "next/image";
import type { Order, OrderItem } from "@/db/schema";
import { formatPrice } from "@/lib/format";

export const statusStyle: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderDetails({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Order</p>
          <p className="text-xl font-black">{order.orderNumber}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyle[order.status] ?? ""}`}
        >
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Placed {order.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <ul className="mt-5 divide-y divide-neutral-100">
        {items.map((i) => (
          <li key={i.id} className="flex gap-4 py-3 text-sm">
            <Image src={i.image} alt={i.productName} width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-bold">{i.productName}</p>
              <p className="text-neutral-500">
                US {i.size} · Qty {i.quantity}
              </p>
            </div>
            <p className="font-semibold">{formatPrice(i.unitPriceCents * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}</span>
        </div>
        <div className="flex justify-between text-base font-black">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>
      <div className="mt-5 rounded-lg bg-neutral-100 p-4 text-sm">
        <p className="font-bold">Shipping to</p>
        <p>{order.name}</p>
        <p>{order.address}</p>
        <p>
          {order.city}, {order.postalCode}
        </p>
        <p>{order.country}</p>
      </div>
    </div>
  );
}
