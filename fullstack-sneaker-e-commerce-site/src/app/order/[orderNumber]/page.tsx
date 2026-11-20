import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/db/queries";
import OrderDetails from "@/components/OrderDetails";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmed" };

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const data = await getOrderByNumber(orderNumber);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#c6ff00] text-3xl">✓</div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Thanks, {data.order.name.split(" ")[0]}!</h1>
        <p className="mt-2 text-neutral-600">
          Your order is confirmed. Keep your order number to track it later.
        </p>
      </div>
      <OrderDetails order={data.order} items={data.items} />
      <div className="mt-8 text-center">
        <Link href="/shop" className="rounded-full bg-black px-8 py-3 font-bold text-white">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
