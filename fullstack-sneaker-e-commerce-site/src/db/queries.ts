import "server-only";
import { and, asc, desc, eq, gte, ilike, inArray, ne, or, sql, lte } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, productSizes, products } from "@/db/schema";
import type { Product } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export type ProductWithStock = Product & {
  sizes: { size: string; stock: number }[];
  inStock: boolean;
};

export type ProductFilters = {
  category?: string;
  brand?: string;
  q?: string;
  sort?: string;
  size?: string;
  max?: number;
  min?: number;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
};

const sizeSort = (a: string, b: string) => parseFloat(a) - parseFloat(b);

async function attachSizes(rows: Product[]): Promise<ProductWithStock[]> {
  if (rows.length === 0) return [];
  const sizes = await db
    .select()
    .from(productSizes)
    .where(inArray(productSizes.productId, rows.map((r) => r.id)));
  return rows.map((p) => {
    const mine = sizes
      .filter((s) => s.productId === p.id)
      .map((s) => ({ size: s.size, stock: s.stock }))
      .sort((a, b) => sizeSort(a.size, b.size));
    return { ...p, sizes: mine, inStock: mine.some((s) => s.stock > 0) };
  });
}

export async function listProducts(f: ProductFilters = {}): Promise<ProductWithStock[]> {
  await ensureSeeded();
  const conds = [eq(products.active, true)];
  if (f.category) conds.push(eq(products.category, f.category));
  if (f.brand) conds.push(eq(products.brand, f.brand));
  if (f.featured) conds.push(eq(products.featured, true));
  if (f.isNew) conds.push(eq(products.isNew, true));
  if (f.min !== undefined) conds.push(gte(products.priceCents, f.min * 100));
  if (f.max !== undefined) conds.push(lte(products.priceCents, f.max * 100));
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "")}%`;
    conds.push(
      or(
        ilike(products.name, like),
        ilike(products.brand, like),
        ilike(products.colorway, like),
        ilike(products.category, like),
      )!,
    );
  }
  if (f.size) {
    conds.push(
      sql`exists (select 1 from ${productSizes} where ${productSizes.productId} = ${products.id} and ${productSizes.size} = ${f.size} and ${productSizes.stock} > 0)`,
    );
  }
  const order =
    f.sort === "price-asc"
      ? asc(products.priceCents)
      : f.sort === "price-desc"
        ? desc(products.priceCents)
        : f.sort === "name"
          ? asc(products.name)
          : desc(products.createdAt);

  const q = db
    .select()
    .from(products)
    .where(and(...conds))
    .orderBy(order, asc(products.id));
  const rows = f.limit ? await q.limit(f.limit) : await q;
  return attachSizes(rows);
}

export async function getProduct(slug: string): Promise<ProductWithStock | null> {
  await ensureSeeded();
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  if (!row) return null;
  return (await attachSizes([row]))[0];
}

export async function relatedProducts(p: Product, limit = 4) {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        ne(products.id, p.id),
        or(eq(products.category, p.category), eq(products.brand, p.brand)),
      ),
    )
    .limit(limit);
  return attachSizes(rows);
}

export async function listBrands(): Promise<string[]> {
  await ensureSeeded();
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}
