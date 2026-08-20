"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { OrderDetail as OrderDetailType, OrderItemRow, OrderStatusHistoryRow } from "./types";

const TIMELINE_STEPS = ["PENDING", "APPROVED", "CONFIRMED", "ON_THE_WAY", "DELIVERED"] as const;
const STEP_LABEL: Record<string, string> = {
  PENDING: "Request Submitted",
  APPROVED: "Approved",
  CONFIRMED: "Confirmed",
  ON_THE_WAY: "On the Way",
  DELIVERED: "Delivered",
};

export function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [history, setHistory] = useState<OrderStatusHistoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load order.");
        return;
      }
      setOrder(data.order);
      setItems(data.items);
      setHistory(data.history);
    } catch {
      setError("Network error while loading order.");
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: string) {
    setActionError(null);
    setActioning(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error ?? "Could not update order.");
        return;
      }
      load();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setActioning(false);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/orders" className="text-sm text-amber-700 hover:underline">
          ← Back to Orders
        </Link>
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!order) {
    return <p className="text-sm text-slate-500">Loading order…</p>;
  }

  const isRejected = order.status === "REJECTED";
  const isExpired = order.status === "EXPIRED";
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status as (typeof TIMELINE_STEPS)[number]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-amber-700 hover:underline">
          ← Back to Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{order.order_id}</h1>
            <p className="text-sm text-slate-500">
              {order.order_source} · {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            {order.status === "PENDING" && (
              <>
                <Button loading={actioning} onClick={() => handleStatusChange("APPROVED")}>
                  Approve
                </Button>
                <Button
                  variant="danger"
                  loading={actioning}
                  onClick={() => handleStatusChange("REJECTED")}
                >
                  Reject
                </Button>
              </>
            )}
            {order.status === "APPROVED" && (
              <>
                <Button loading={actioning} onClick={() => handleStatusChange("CONFIRMED")}>
                  Confirm Order
                </Button>
                <Button
                  variant="secondary"
                  loading={actioning}
                  onClick={() => handleStatusChange("EXPIRED")}
                >
                  Mark Expired
                </Button>
              </>
            )}
            {order.status === "CONFIRMED" && (
              <Button loading={actioning} onClick={() => handleStatusChange("ON_THE_WAY")}>
                Mark On the Way
              </Button>
            )}
            {order.status === "ON_THE_WAY" && (
              <Button loading={actioning} onClick={() => handleStatusChange("DELIVERED")}>
                Mark Delivered
              </Button>
            )}
          </div>
        </div>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Customer</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Customer ID</dt>
            <dd>
              <Link
                href={`/admin/customers/${order.customers.id}`}
                className="text-amber-700 hover:underline"
              >
                {order.customers.customer_id}
              </Link>
            </dd>
            <dt className="text-slate-500">Name</dt>
            <dd className="text-slate-900">{order.customers.name}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd className="text-slate-900">{order.customers.phone}</dd>
            <dt className="text-slate-500">Address</dt>
            <dd className="text-slate-900">{order.customers.address}</dd>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Order Summary</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Total Quantity</dt>
            <dd className="text-slate-900">{order.total_than} Than</dd>
            <dt className="text-slate-500">Total Amount</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</dd>
            {order.note && (
              <>
                <dt className="text-slate-500">Note</dt>
                <dd className="text-slate-900">{order.note}</dd>
              </>
            )}
          </dl>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Variant</th>
                <th className="py-2 pr-4 font-medium">Color</th>
                <th className="py-2 pr-4 font-medium">Suta</th>
                <th className="py-2 pr-4 font-medium">Qty (Than)</th>
                <th className="py-2 pr-4 font-medium">Rate</th>
                <th className="py-2 pr-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{item.variant}</td>
                  <td className="py-2 pr-4">{item.color}</td>
                  <td className="py-2 pr-4">{item.suta_count}</td>
                  <td className="py-2 pr-4">{item.qty_than}</td>
                  <td className="py-2 pr-4">{formatCurrency(item.rate_per_than)}</td>
                  <td className="py-2 pr-4">{formatCurrency(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Status Timeline</h2>
        {isRejected || isExpired ? (
          <div className="flex flex-col gap-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm">
                <span className={h.status === "REJECTED" || h.status === "EXPIRED" ? "text-red-600" : "text-emerald-600"}>
                  {h.status === "REJECTED" || h.status === "EXPIRED" ? "✕" : "✓"}
                </span>
                <span className="flex-1 text-slate-900">{STEP_LABEL[h.status] ?? h.status}</span>
                <span className="text-slate-500">{formatDateTime(h.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {TIMELINE_STEPS.map((step, idx) => {
              const entry = history.find((h) => h.status === step);
              const reached = idx <= currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-3 text-sm">
                  <span className={reached ? "text-emerald-600" : "text-slate-300"}>
                    {reached ? "✓" : "○"}
                  </span>
                  <span className={`flex-1 ${reached ? "text-slate-900" : "text-slate-400"}`}>
                    {STEP_LABEL[step]}
                  </span>
                  <span className="text-slate-500">
                    {entry ? formatDateTime(entry.created_at) : "Not yet"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
