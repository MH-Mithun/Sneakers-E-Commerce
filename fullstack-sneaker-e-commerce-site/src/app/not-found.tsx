import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-28 text-center">
      <p className="text-7xl font-black tracking-tighter">404</p>
      <p className="mt-2 text-neutral-600">That page took a wrong turn.</p>
      <Link href="/shop" className="mt-6 inline-block rounded-full bg-black px-8 py-3 font-bold text-white">
        Back to the shop
      </Link>
    </div>
  );
}
