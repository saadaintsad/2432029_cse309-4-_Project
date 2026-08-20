"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", enabled: true },
  { label: "Inventory", href: "/admin/inventory", enabled: true },
  { label: "Orders", href: "/admin/orders", enabled: true },
  { label: "Customers", href: "/admin/customers", enabled: true },
  { label: "Ledger", href: "/admin/ledger", enabled: true },
  { label: "Payables", href: "/admin/payables", enabled: true },
  { label: "Documents", href: "/admin/documents", enabled: true },
  { label: "Business Assistant", href: "/admin/assistant", enabled: true },
  { label: "Settings", href: "/admin/settings", enabled: true },
];

export function AdminShell({
  activeUsername,
  children,
}: {
  activeUsername: string;
  children: React.ReactNode;
}) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    // Hard navigation so the cleared session cookie and any stale
    // client-side state are guaranteed gone, not just client-routed away from.
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="flex min-h-screen w-56 flex-col bg-slate-900 text-slate-200">
          <div className="border-b border-slate-800 px-4 py-5">
            <p className="text-sm font-semibold text-white">New N Islam</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
          <nav className="flex-1 px-2 py-4">
            {NAV_ITEMS.map((item) =>
              item.enabled ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.href}
                  title="Coming soon"
                  className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-slate-500"
                >
                  {item.label}
                </span>
              )
            )}
          </nav>
          <div className="border-t border-slate-800 px-4 py-4">
            <p className="mb-2 truncate text-xs text-slate-400">{activeUsername}</p>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
