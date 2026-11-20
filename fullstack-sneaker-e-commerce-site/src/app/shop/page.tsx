import Link from "next/link";
import { listBrands, listProducts } from "@/db/queries";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/format";
import { SIZES } from "@/db/seed-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop all sneakers" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = one(sp.category);
  const brand = one(sp.brand);
  const q = one(sp.q);
  const sort = one(sp.sort);
  const size = one(sp.size);
  const isNew = one(sp.new) === "1";
  const max = one(sp.max) ? Number(one(sp.max)) : undefined;

  const [items, brands] = await Promise.all([
    listProducts({
      category,
      brand,
      q,
      sort,
      size,
      isNew,
      max: Number.isFinite(max) ? max : undefined,
    }),
    listBrands(),
  ]);

  const href = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const cur: Record<string, string | undefined> = {
      category,
      brand,
      q,
      sort,
      size,
      max: max !== undefined ? String(max) : undefined,
      new: isNew ? "1" : undefined,
      ...patch,
    };
    for (const [k, v] of Object.entries(cur)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
      active ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"
    }`;

  const hasFilter = category || brand || q || size || isNew || max !== undefined;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {q ? `Results for “${q}”` : isNew ? "New arrivals" : (category ?? "All sneakers")}
          </h1>
          <p className="text-neutral-500">{items.length} products</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            ["", "Newest"],
            ["price-asc", "Price: low to high"],
            ["price-desc", "Price: high to low"],
            ["name", "A–Z"],
          ].map(([v, l]) => (
            <Link key={v} href={href({ sort: v || undefined })} className={chip((sort ?? "") === v)}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-7 text-sm">
          <div>
            <p className="mb-2 font-black uppercase">Category</p>
            <div className="flex flex-wrap gap-2">
              <Link href={href({ category: undefined })} className={chip(!category)}>All</Link>
              {CATEGORIES.map((c) => (
                <Link key={c} href={href({ category: c })} className={chip(category === c)}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-black uppercase">Brand</p>
            <div className="flex flex-wrap gap-2">
              <Link href={href({ brand: undefined })} className={chip(!brand)}>All</Link>
              {brands.map((b) => (
                <Link key={b} href={href({ brand: b })} className={chip(brand === b)}>
                  {b}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-black uppercase">Size (US)</p>
            <div className="grid grid-cols-4 gap-2">
              {SIZES.map((s) => (
                <Link
                  key={s}
                  href={href({ size: size === s ? undefined : s })}
                  className={`${chip(size === s)} text-center`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-black uppercase">Max price</p>
            <div className="flex flex-wrap gap-2">
              {[100, 150, 200].map((m) => (
                <Link
                  key={m}
                  href={href({ max: max === m ? undefined : String(m) })}
                  className={chip(max === m)}
                >
                  ≤ ${m}
                </Link>
              ))}
            </div>
          </div>
          {hasFilter && (
            <Link href="/shop" className="inline-block font-bold underline">
              Clear all filters
            </Link>
          )}
        </aside>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-neutral-100 p-12 text-center">
            <p className="text-lg font-bold">No sneakers match your filters.</p>
            <Link href="/shop" className="mt-3 inline-block underline">
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 xl:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
