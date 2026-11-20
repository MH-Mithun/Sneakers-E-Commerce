"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice, shippingFor } from "@/lib/format";

const input =
  "w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black";

export default function CheckoutPage() {
  const { items, subtotalCents, clear, ready } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shipping = shippingFor(subtotalCents);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.get("email"),
          name: f.get("name"),
          address: f.get("address"),
          city: f.get("city"),
          postalCode: f.get("postalCode"),
          country: f.get("country"),
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order.");
        setLoading(false);
        return;
      }
      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-3xl font-black uppercase">Your cart is empty</h1>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-black px-8 py-3 font-bold text-white">
          Browse sneakers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black uppercase tracking-tighter">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-4">
          <h2 className="font-black uppercase">Contact</h2>
          <input name="email" type="email" required placeholder="Email" className={input} />
          <h2 className="pt-4 font-black uppercase">Shipping address</h2>
          <input name="name" required minLength={2} placeholder="Full name" className={input} />
          <input name="address" required placeholder="Street address" className={input} />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" required placeholder="City" className={input} />
            <input name="postalCode" required placeholder="Postal code" className={input} />
          </div>
          <input name="country" required defaultValue="United States" placeholder="Country" className={input} />

          <div className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600">
            💳 <b>Demo store:</b> no payment is collected. Placing the order reserves stock and
            creates an order record in the database.
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
          )}
          <button
            disabled={loading || items.length === 0}
            className="w-full rounded-full bg-black py-4 font-black uppercase text-white transition hover:bg-neutral-800 disabled:bg-neutral-400"
          >
            {loading ? "Placing order…" : `Place order · ${formatPrice(subtotalCents + shipping)}`}
          </button>
        </form>

        <aside className="h-fit rounded-2xl bg-neutral-100 p-6">
          <h2 className="mb-4 font-black uppercase">Order summary</h2>
          <ul className="divide-y divide-neutral-200">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex gap-3 py-3 text-sm">
                <Image
                  src={i.image}
                  alt={i.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold">{i.name}</p>
                  <p className="text-neutral-500">
                    US {i.size} · Qty {i.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(i.priceCents * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-neutral-300 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-black">
              <span>Total</span>
              <span>{formatPrice(subtotalCents + shipping)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
