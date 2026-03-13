"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clientes" }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">CreativeFlow</p>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900">Revision y aprobacion creativa</h1>
        </div>
        <nav className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 p-1 shadow-sm">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
