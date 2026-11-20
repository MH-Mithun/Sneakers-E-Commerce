import Image from "next/image";
import Link from "next/link";
import type { ProductWithStock } from "@/db/queries";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ p }: { p: ProductWithStock }) {
  const sale = p.compareAtCents && p.compareAtCents > p.priceCents;
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5 text-[11px] font-bold uppercase">
          {!p.inStock && <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-white">Sold out</span>}
          {p.inStock && p.isNew && <span className="rounded-full bg-[#c6ff00] px-2.5 py-1 text-black">New</span>}
          {p.inStock && sale && <span className="rounded-full bg-red-600 px-2.5 py-1 text-white">Sale</span>}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{p.brand}</p>
          <h3 className="font-bold leading-tight">{p.name}</h3>
          <p className="text-sm text-neutral-500">{p.colorway}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{formatPrice(p.priceCents)}</p>
          {sale && (
            <p className="text-sm text-neutral-400 line-through">{formatPrice(p.compareAtCents!)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
