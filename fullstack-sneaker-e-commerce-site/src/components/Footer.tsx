import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-black text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-black tracking-tighter text-white">
            SOLE<span className="ml-0.5 rounded bg-[#c6ff00] px-1 text-black">HOUSE</span>
          </p>
          <p className="mt-3 text-sm text-neutral-400">
            Authentic sneakers for runners, hoopers and everyday walkers. Fast shipping and
            30-day returns.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-white">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop">All shoes</Link></li>
            <li><Link href="/shop?new=1">New arrivals</Link></li>
            <li><Link href="/shop?category=Running">Running</Link></li>
            <li><Link href="/shop?category=Basketball">Basketball</Link></li>
            <li><Link href="/shop?category=Skate">Skate</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-white">Help</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/track">Track your order</Link></li>
            <li>Free shipping over $150</li>
            <li>30-day free returns</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-white">Company</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/admin">Admin</Link></li>
            <li>hello@solehouse.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Solehouse. Demo store — no real payments are processed.
      </div>
    </footer>
  );
}
