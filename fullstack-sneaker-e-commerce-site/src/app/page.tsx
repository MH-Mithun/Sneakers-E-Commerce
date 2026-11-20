import Image from "next/image";
import Link from "next/link";
import { listBrands, listProducts } from "@/db/queries";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const cats = [
  { name: "Running", blurb: "Miles, made lighter" },
  { name: "Basketball", blurb: "Own the court" },
  { name: "Lifestyle", blurb: "Everyday icons" },
  { name: "Skate", blurb: "Built to be beaten up" },
];

export default async function HomePage() {
  const [featured, fresh, brands] = await Promise.all([
    listProducts({ featured: true, limit: 4 }),
    listProducts({ isNew: true, limit: 4 }),
    listBrands(),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-black text-white">
        <Image
          src="/images/hero.jpg"
          alt="Aero Runner 2 in white and volt"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-right opacity-80"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-6 py-20">
          <p className="mb-4 inline-block w-fit rounded-full bg-[#c6ff00] px-3 py-1 text-xs font-black uppercase text-black">
            New drop · Aero Runner 2
          </p>
          <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-7xl">
            Run faster.
            <br />
            Look <span className="text-[#c6ff00]">sharper.</span>
          </h1>
          <p className="mt-5 max-w-md text-neutral-300">
            Performance kicks and street classics from the brands you love. Free shipping over $150.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-[#c6ff00] px-8 py-3.5 font-black text-black transition hover:bg-white"
            >
              Shop all
            </Link>
            <Link
              href="/product/aero-runner"
              className="rounded-full border border-white/40 px-8 py-3.5 font-bold transition hover:bg-white/10"
            >
              Aero Runner 2
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 text-sm font-black uppercase tracking-widest text-neutral-400">
          {brands.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <h2 className="mb-6 text-3xl font-black uppercase tracking-tighter">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cats.map((c) => (
            <Link
              key={c.name}
              href={`/shop?category=${c.name}`}
              className="group flex aspect-[5/3] flex-col justify-end rounded-2xl bg-neutral-900 p-5 text-white transition hover:bg-[#c6ff00] hover:text-black"
            >
              <p className="text-xl font-black uppercase">{c.name}</p>
              <p className="text-sm opacity-70">{c.blurb} →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Featured</h2>
          <Link href="/shop" className="text-sm font-bold underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <div className="grid gap-6 rounded-3xl bg-neutral-100 p-8 sm:grid-cols-3">
          {[
            ["🚚", "Free shipping", "On every order over $150"],
            ["↩️", "30-day returns", "Not the right fit? Send them back"],
            ["✅", "100% authentic", "Straight from the brands"],
          ].map(([i, t, d]) => (
            <div key={t}>
              <p className="text-2xl">{i}</p>
              <p className="mt-2 font-black uppercase">{t}</p>
              <p className="text-sm text-neutral-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter">New arrivals</h2>
          <Link href="/shop?new=1" className="text-sm font-bold underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {fresh.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </>
  );
}
