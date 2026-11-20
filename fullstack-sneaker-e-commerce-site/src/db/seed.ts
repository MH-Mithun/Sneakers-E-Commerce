import { count } from "drizzle-orm";
import { db } from "@/db";
import { productSizes, products } from "@/db/schema";
import { SIZES, seedProducts } from "@/db/seed-data";

let seeding: Promise<void> | null = null;

/** Seeds the catalogue the first time the app talks to an empty database. */
export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = run().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

async function run() {
  const [{ value }] = await db.select({ value: count() }).from(products);
  if (value > 0) return;

  for (const p of seedProducts) {
    const [row] = await db
      .insert(products)
      .values({
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        colorway: p.colorway,
        description: p.description,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
        image: p.image,
        featured: p.featured ?? false,
        isNew: p.isNew ?? false,
      })
      .onConflictDoNothing()
      .returning({ id: products.id });
    if (!row) continue;
    await db.insert(productSizes).values(
      SIZES.map((size, i) => ({
        productId: row.id,
        size,
        stock: p.soldOut?.includes(size) ? 0 : 3 + ((i * 7 + row.id) % 9),
      })),
    );
  }
}
