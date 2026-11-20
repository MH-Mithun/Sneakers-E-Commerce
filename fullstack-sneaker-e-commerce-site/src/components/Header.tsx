"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/shop", label: "All Shoes" },
  { href: "/shop?new=1", label: "New" },
  { href: "/shop?category=Running", label: "Running" },
  { href: "/shop?category=Basketball", label: "Basketball" },
  { href: "/shop?category=Lifestyle", label: "Lifestyle" },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          className="rounded p-2 md:hidden"
          aria-label="Menu"
          onClick={() => setMenu((m) => !m)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <Link href="/" className="text-xl font-black tracking-tighter">
          SOLE<span className="rounded bg-[#c6ff00] px-1 text-black">HOUSE</span>
        </Link>
        <nav className="ml-6 hidden gap-6 text-sm font-semibold md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-neutral-500">
              {l.label}
            </Link>
          ))}
        </nav>
        <form
          className="ml-auto hidden w-56 sm:block"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/shop?q=${encodeURIComponent(q)}`);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sneakers…"
            className="w-full rounded-full bg-neutral-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
        </form>
        <button
          onClick={() => setOpen(true)}
          className="relative ml-auto rounded-full p-2 hover:bg-neutral-100 sm:ml-0"
          aria-label="Open cart"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 7h12l-1 13H7L6 7Z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[11px] font-bold text-[#c6ff00]">
              {count}
            </span>
          )}
        </button>
      </div>
      {menu && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
          <form
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              setMenu(false);
              router.push(`/shop?q=${encodeURIComponent(q)}`);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sneakers…"
              className="w-full rounded-full bg-neutral-100 px-4 py-2 text-sm outline-none"
            />
          </form>
          <div className="flex flex-col gap-3 text-sm font-semibold">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
