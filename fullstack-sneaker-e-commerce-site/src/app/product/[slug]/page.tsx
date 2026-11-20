import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, relatedProducts } from "@/db/queries";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.description } : { title: "Not found" };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const related = await relatedProducts(p);
  const sale = p.compareAtCents && p.compareAtCents > p.priceCents;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/shop" className="hover:underline">Shop</Link> /{" "}
        <Link href={`/shop?category=${p.category}`} className="hover:underline">{p.category}</Link> /{" "}
        <span className="text-neutral-900">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-100">
          <Image
            src={p.image}
            alt={p.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">
            {p.brand} · {p.category}
          </p>
          <h1 className="mt-1 text-4xl font-black uppercase leading-none tracking-tighter">{p.name}</h1>
          <p className="mt-1 text-neutral-500">{p.colorway}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-black">{formatPrice(p.priceCents)}</p>
            {sale && (
              <p className="text-lg text-neutral-400 line-through">{formatPrice(p.compareAtCents!)}</p>
            )}
          </div>
          <p className="mt-5 leading-relaxed text-neutral-700">{p.description}</p>
          <div className="mt-7">
            <AddToCart
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                image: p.image,
                priceCents: p.priceCents,
              }}
              sizes={p.sizes}
            />
          </div>
          <ul className="mt-6 space-y-1.5 border-t border-neutral-200 pt-5 text-sm text-neutral-600">
            <li>🚚 Free shipping on orders over $150</li>
            <li>↩️ 30-day free returns</li>
            <li>✅ 100% authentic</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-black uppercase tracking-tighter">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
