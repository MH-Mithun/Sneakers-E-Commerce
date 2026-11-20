import { desc, eq, asc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { orderItems, orders, productSizes, products } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";
import { ORDER_STATUSES, formatPrice } from "@/lib/format";
import { statusStyle } from "@/components/OrderDetails";
import { login, logout, toggleActive, updateOrderStatus, updatePrice, updateStock } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tab = sp.tab === "products" ? "products" : "orders";

  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Admin</h1>
        {!adminEnabled() ? (
          <p className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            Admin is disabled. Set the <code>ADMIN_PASSWORD</code> environment variable to enable it.
          </p>
        ) : (
          <form action={login} className="mt-6 space-y-3">
            <input
              name="password"
              type="password"
              required
              placeholder="Admin password"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3"
            />
            {sp.error && <p className="text-sm font-semibold text-red-600">Wrong password.</p>}
            <button className="w-full rounded-full bg-black py-3 font-bold text-white">Sign in</button>
          </form>
        )}
      </div>
    );
  }

  await ensureSeeded();
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  const allItems = await db.select().from(orderItems);
  const allProducts = await db.select().from(products).orderBy(asc(products.id));
  const allSizes = await db.select().from(productSizes).orderBy(asc(productSizes.id));
  const revenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + o.totalCents, 0);

  const tabClass = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-bold ${active ? "bg-black text-white" : "bg-neutral-100"}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Dashboard</h1>
        <form action={logout}>
          <button className="text-sm font-bold underline">Sign out</button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Revenue", formatPrice(revenue)],
          ["Orders", String(allOrders.length)],
          ["Products", String(allProducts.length)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-neutral-100 p-5">
            <p className="text-xs font-bold uppercase text-neutral-500">{l}</p>
            <p className="text-3xl font-black">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        <Link href="/admin" className={tabClass(tab === "orders")}>Orders</Link>
        <Link href="/admin?tab=products" className={tabClass(tab === "products")}>Inventory</Link>
      </div>

      {tab === "orders" ? (
        <div className="mt-6 space-y-4">
          {allOrders.length === 0 && <p className="text-neutral-500">No orders yet.</p>}
          {allOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-neutral-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black">{o.orderNumber}</p>
                  <p className="text-sm text-neutral-500">
                    {o.name} · {o.email} · {o.createdAt.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyle[o.status] ?? ""}`}>
                    {o.status}
                  </span>
                  <p className="font-black">{formatPrice(o.totalCents)}</p>
                </div>
              </div>
              <ul className="mt-3 text-sm text-neutral-700">
                {allItems
                  .filter((i) => i.orderId === o.id)
                  .map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.productName} (US {i.size})
                    </li>
                  ))}
              </ul>
              <p className="mt-2 text-xs text-neutral-500">
                {o.address}, {o.city} {o.postalCode}, {o.country}
              </p>
              <form action={updateOrderStatus} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">Update</button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {allProducts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-neutral-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black">
                    {p.name} {!p.active && <span className="ml-2 text-xs text-red-600">(hidden)</span>}
                  </p>
                  <p className="text-sm text-neutral-500">{p.brand} · {p.colorway}</p>
                </div>
                <div className="flex items-center gap-3">
                  <form action={updatePrice} className="flex items-center gap-1 text-sm">
                    <input type="hidden" name="id" value={p.id} />$
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="1"
                      defaultValue={(p.priceCents / 100).toFixed(2)}
                      className="w-24 rounded-lg border border-neutral-300 px-2 py-1"
                    />
                    <button className="rounded-lg bg-neutral-900 px-3 py-1 text-xs font-bold text-white">Save</button>
                  </form>
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-bold">
                      {p.active ? "Hide" : "Show"}
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {allSizes
                  .filter((s) => s.productId === p.id)
                  .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
                  .map((s) => (
                    <form key={s.id} action={updateStock} className="flex items-center gap-1 text-xs">
                      <input type="hidden" name="id" value={s.id} />
                      <span className="w-8 font-bold">{s.size}</span>
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={s.stock}
                        className="w-14 rounded border border-neutral-300 px-1 py-1"
                      />
                      <button className="rounded bg-neutral-900 px-2 py-1 font-bold text-white">✓</button>
                    </form>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
