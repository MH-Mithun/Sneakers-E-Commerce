import { getOrderByNumber } from "@/db/queries";
import OrderDetails from "@/components/OrderDetails";

export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || "";

export default async function TrackPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const number = one(sp.order).toUpperCase();
  const email = one(sp.email).toLowerCase();
  const searched = Boolean(number && email);
  const data = searched ? await getOrderByNumber(number) : null;
  const match = data && data.order.email.toLowerCase() === email ? data : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-4xl font-black uppercase tracking-tighter">Track your order</h1>
      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          name="order"
          defaultValue={number}
          required
          placeholder="Order number (SH-XXXXXXXX)"
          className="rounded-lg border border-neutral-300 px-4 py-3 text-sm"
        />
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          placeholder="Email used at checkout"
          className="rounded-lg border border-neutral-300 px-4 py-3 text-sm"
        />
        <button className="rounded-lg bg-black px-6 py-3 text-sm font-bold text-white">Track</button>
      </form>
      <div className="mt-8">
        {searched && !match && (
          <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
            We couldn&apos;t find an order matching those details.
          </p>
        )}
        {match && <OrderDetails order={match.order} items={match.items} />}
      </div>
    </div>
  );
}
