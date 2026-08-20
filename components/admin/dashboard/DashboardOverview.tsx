"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface RecentOrder {
  id: string;
  order_id: string;
  status: string;
  order_source: string;
  total_amount: number;
  created_at: string;
  customers: { name: string } | null;
}

interface RecentPayment {
  id: string;
  amount: number;
  method: string;
  created_at: string;
  customers: { name: string } | null;
}

interface DashboardData {
  total_stock: number;
  total_customer_receivables: number;
  total_payables_due: number;
  pending_requests_count: number;
  recent_orders: RecentOrder[];
  recent_payments: RecentPayment[];
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-slate-200 text-slate-700",
  APPROVED: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  ON_THE_WAY: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-200 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-300 text-slate-600",
};

export function DashboardOverview({ username }: { username: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error ?? "Could not load dashboard.");
          return;
        }
        setData(json);
      })
      .catch(() => setError("Network error while loading dashboard."));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, {username}.</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {!data && !error ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs text-slate-500">Total Stock</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {data.total_stock.toLocaleString()} Than
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">Customer Receivables</p>
              <p className="mt-1 text-xl font-semibold text-emerald-700">
                {formatCurrency(data.total_customer_receivables)}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">Payables Due</p>
              <p className="mt-1 text-xl font-semibold text-amber-700">
                {formatCurrency(data.total_payables_due)}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">Pending Requests</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {data.pending_requests_count}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
                <Link href="/admin/orders" className="text-xs text-amber-700 hover:underline">
                  View all
                </Link>
              </div>
              {data.recent_orders.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-slate-500">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-2 font-medium">Order</th>
                        <th className="px-4 py-2 font-medium">Customer</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_orders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-2">
                            <Link
                              href={`/admin/orders/${o.id}`}
                              className="text-amber-700 hover:underline"
                            >
                              {o.order_id}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-slate-900">{o.customers?.name ?? "—"}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[o.status] ?? "bg-slate-100 text-slate-600"}`}
                            >
                              {o.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-2">{formatCurrency(o.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
                <Link href="/admin/customers" className="text-xs text-amber-700 hover:underline">
                  View customers
                </Link>
              </div>
              {data.recent_payments.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-slate-500">No payments recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-2 font-medium">Customer</th>
                        <th className="px-4 py-2 font-medium">Amount</th>
                        <th className="px-4 py-2 font-medium">Method</th>
                        <th className="px-4 py-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_payments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-2 text-slate-900">{p.customers?.name ?? "—"}</td>
                          <td className="px-4 py-2">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-2">{p.method}</td>
                          <td className="px-4 py-2 text-slate-500">
                            {formatDateTime(p.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
