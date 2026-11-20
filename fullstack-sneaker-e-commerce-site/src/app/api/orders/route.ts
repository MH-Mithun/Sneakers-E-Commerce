import { randomBytes } from "crypto";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, productSizes, products } from "@/db/schema";
import { shippingFor } from "@/lib/format";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(60),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        size: z.string().min(1).max(10),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

class StockError extends Error {}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your details and try again.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Merge duplicate lines (same product + size)
  const merged = new Map<string, (typeof data.items)[number]>();
  for (const it of data.items) {
    const key = `${it.productId}:${it.size}`;
    const prev = merged.get(key);
    merged.set(key, prev ? { ...it, quantity: Math.min(10, prev.quantity + it.quantity) } : it);
  }
  const lines = [...merged.values()];

  try {
    const result = await db.transaction(async (tx) => {
      const prods = await tx
        .select()
        .from(products)
        .where(
          and(
            inArray(products.id, [...new Set(lines.map((l) => l.productId))]),
            eq(products.active, true),
          ),
        );
      const byId = new Map(prods.map((p) => [p.id, p]));

      let subtotal = 0;
      const rows: (typeof orderItems.$inferInsert)[] = [];
      for (const line of lines) {
        const p = byId.get(line.productId);
        if (!p) throw new StockError("A product in your cart is no longer available.");
        // Atomic decrement - fails if there isn't enough stock
        const updated = await tx
          .update(productSizes)
          .set({ stock: sql`${productSizes.stock} - ${line.quantity}` })
          .where(
            and(
              eq(productSizes.productId, p.id),
              eq(productSizes.size, line.size),
              gte(productSizes.stock, line.quantity),
            ),
          )
          .returning({ id: productSizes.id });
        if (updated.length === 0) {
          throw new StockError(`${p.name} (US ${line.size}) doesn't have enough stock.`);
        }
        subtotal += p.priceCents * line.quantity;
        rows.push({
          orderId: 0,
          productId: p.id,
          productName: p.name,
          image: p.image,
          size: line.size,
          quantity: line.quantity,
          unitPriceCents: p.priceCents,
        });
      }

      const shipping = shippingFor(subtotal);
      const orderNumber = `SH-${randomBytes(4).toString("hex").toUpperCase()}`;
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          email: data.email,
          name: data.name,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          subtotalCents: subtotal,
          shippingCents: shipping,
          totalCents: subtotal + shipping,
          status: "paid",
        })
        .returning();
      await tx.insert(orderItems).values(rows.map((r) => ({ ...r, orderId: order.id })));
      return order.orderNumber;
    });
    return Response.json({ orderNumber: result }, { status: 201 });
  } catch (err) {
    if (err instanceof StockError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return Response.json({ error: "Something went wrong placing your order." }, { status: 500 });
  }
}
