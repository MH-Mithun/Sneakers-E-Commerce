"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  formatPrice,
  shippingFor,
} from "@/lib/format";

export default function CartDrawer() {
  const { open, setOpen, items, subtotalCents, setQuantity, remove } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const progress = Math.min(100, (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-5">
          <h2 className="text-lg font-black uppercase tracking-tight">Your cart</h2>
          <button onClick={() => setOpen(false)} className="text-2xl leading-none" aria-label="Close cart">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-neutral-500">Your cart is empty.</p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-neutral-200 px-5 py-3 text-sm">
              {remaining > 0 ? (
                <p>
                  Add <b>{formatPrice(remaining)}</b> more for free shipping
                </p>
              ) : (
                <p className="font-semibold">🎉 You&apos;ve unlocked free shipping!</p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full bg-[#c6ff00]" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto px-5">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-4 py-4">
                  <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)}>
                    <Image
                      src={i.image}
                      alt={i.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-lg bg-neutral-100 object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col text-sm">
                    <div className="flex justify-between gap-2">
                      <p className="font-bold">{i.name}</p>
                      <p className="font-semibold">{formatPrice(i.priceCents * i.quantity)}</p>
                    </div>
                    <p className="text-neutral-500">US {i.size}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-neutral-300">
                        <button
                          className="px-3 py-1"
                          onClick={() => setQuantity(i.productId, i.size, i.quantity - 1)}
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{i.quantity}</span>
                        <button
                          className="px-3 py-1 disabled:opacity-30"
                          disabled={i.quantity >= Math.min(i.maxStock, 10)}
                          onClick={() => setQuantity(i.productId, i.size, i.quantity + 1)}
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-xs text-neutral-500 underline"
                        onClick={() => remove(i.productId, i.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-neutral-200 p-5 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping</span>
                <span>
                  {shippingFor(subtotalCents) === 0 ? "Free" : formatPrice(shippingFor(subtotalCents))}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="mt-3 block rounded-full bg-black py-3.5 text-center font-bold text-white hover:bg-neutral-800"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
