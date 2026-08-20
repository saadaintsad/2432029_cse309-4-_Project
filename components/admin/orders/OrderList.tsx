"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { CreateOfflineOrderModal } from "./CreateOfflineOrderModal";
import type { OrderListRow } from "./types";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-slate-200 text-slate-700",
  APPROVED: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  ON_THE_WAY: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-200 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-300 text-slate-600",
};

export function OrderList() {
  const [orders, setOrders] = useState<OrderListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [orderSource, setOrderSource] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (orderSource) params.set("order_source", orderSource);

    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load orders.");
        return;
      }
      setOrders(data.orders);
    } catch {
      setError("Network error while loading orders.");
    }
  }, [status, orderSource]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Orders</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Offline Order</Button>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Source</label>
            <select
              value={orderSource}
              onChange={(e) => setOrderSource(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="">Online + Offline</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-0">
        {orders === null ? (
          <p className="p-6 text-sm text-slate-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No orders match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Qty (Than)</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-amber-700 hover:underline"
                      >
                        {o.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{o.customers?.name ?? "—"}</td>
                    <td className="px-4 py-3">{o.order_source}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[o.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{o.total_than}</td>
                    <td className="px-4 py-3">{formatCurrency(o.total_amount)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateOfflineOrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          load();
        }}
      />
    </div>
  );
}
