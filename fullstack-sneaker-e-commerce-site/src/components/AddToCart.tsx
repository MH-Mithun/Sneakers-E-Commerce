"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

type Props = {
  product: {
    id: number;
    slug: string;
    name: string;
    image: string;
    priceCents: number;
  };
  sizes: { size: string; stock: number }[];
};

export default function AddToCart({ product, sizes }: Props) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const chosen = sizes.find((s) => s.size === size);
  const soldOut = sizes.every((s) => s.stock === 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <p className="font-black uppercase">Select size (US)</p>
        {chosen && chosen.stock <= 3 && (
          <p className="font-semibold text-red-600">Only {chosen.stock} left!</p>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {sizes.map((s) => (
          <button
            key={s.size}
            disabled={s.stock === 0}
            onClick={() => {
              setSize(s.size);
              setError(false);
            }}
            className={`rounded-lg border py-3 text-sm font-bold transition ${
              s.stock === 0
                ? "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                : size === s.size
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 hover:border-black"
            }`}
          >
            {s.size}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">Please select a size.</p>}
      <button
        disabled={soldOut}
        onClick={() => {
          if (!chosen) return setError(true);
          add({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            priceCents: product.priceCents,
            size: chosen.size,
            maxStock: chosen.stock,
          });
        }}
        className="mt-5 w-full rounded-full bg-black py-4 font-black uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </button>
    </div>
  );
}
