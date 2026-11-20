"use server";

import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderItems, orders, productSizes, products } from "@/db/schema";
import {
  ADMIN_COOKIE,
  adminEnabled,
  isAdmin,
  passwordMatches,
  sessionToken,
} from "@/lib/admin-auth";
import { ORDER_STATUSES } from "@/lib/format";

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (!adminEnabled() || !passwordMatches(pw)) {
    redirect("/admin?error=1");
  }
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE === "true",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;

  await db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!current || current.status === status) return;
    // Return stock when an order gets cancelled
    if (status === "cancelled" && current.status !== "cancelled") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const it of items) {
        if (!it.productId) continue;
        await tx
          .update(productSizes)
          .set({ stock: sql`${productSizes.stock} + ${it.quantity}` })
          .where(and(eq(productSizes.productId, it.productId), eq(productSizes.size, it.size)));
      }
    }
    await tx.update(orders).set({ status }).where(eq(orders.id, id));
  });
  revalidatePath("/admin");
}

export async function updateStock(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = Number(formData.get("id"));
  const stock = Math.max(0, Math.floor(Number(formData.get("stock"))));
  if (!Number.isFinite(id) || !Number.isFinite(stock)) return;
  await db.update(productSizes).set({ stock }).where(eq(productSizes.id, id));
  revalidatePath("/admin");
}

export async function updatePrice(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = Number(formData.get("id"));
  const price = Math.round(Number(formData.get("price")) * 100);
  if (!Number.isFinite(id) || !Number.isFinite(price) || price <= 0) return;
  await db.update(products).set({ priceCents: price }).where(eq(products.id, id));
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function toggleActive(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = Number(formData.get("id"));
  await db
    .update(products)
    .set({ active: sql`not ${products.active}` })
    .where(eq(products.id, id));
  revalidatePath("/admin");
  revalidatePath("/shop");
}
