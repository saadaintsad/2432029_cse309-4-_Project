"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const TIMELINE_STEPS = ["PENDING", "APPROVED", "CONFIRMED", "ON_THE_WAY", "DELIVERED"] as const;
const STEP_LABEL: Record<string, string> = {
  PENDING: "Request Submitted",
  APPROVED: "Approved",
  CONFIRMED: "Confirmed",
  ON_THE_WAY: "On the Way",
  DELIVERED: "Delivered",
};

interface TrackResult {
  order: {
    order_id: string;
    status: string;
    order_source: string;
    total_than: number;
    total_amount: number;
    created_at: string;
    confirmed_at: string | null;
    delivered_at: string | null;
  };
  items: {
    variant: string;
    color: string;
    suta_count: number;
    qty_than: number;
    rate_per_than: number;
    total_amount: number;
  }[];
  history: { status: string; created_at: string }[];
}

function TrackForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order_id") ?? "");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/track?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order not found.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isTerminalNegative =
    result?.order.status === "REJECTED" || result?.order.status === "EXPIRED";
  const currentStepIndex = result
    ? TIMELINE_STEPS.indexOf(result.order.status as (typeof TIMELINE_STEPS)[number])
    : -1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Track Order</h1>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Order ID"
              placeholder="ORD-2026-001"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <Button type="submit" loading={loading}>
            Track
          </Button>
        </form>
      </Card>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{result.order.order_id}</h2>
              <span className="text-sm text-slate-500">
                {formatDateTime(result.order.created_at)}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-500">Total Quantity</dt>
              <dd className="text-slate-900">{result.order.total_than} Than</dd>
              <dt className="text-slate-500">Total Amount</dt>
              <dd className="text-slate-900">{formatCurrency(result.order.total_amount)}</dd>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Variant</th>
                    <th className="py-2 pr-4 font-medium">Color</th>
                    <th className="py-2 pr-4 font-medium">Qty</th>
                    <th className="py-2 pr-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{item.variant}</td>
                      <td className="py-2 pr-4">{item.color}</td>
                      <td className="py-2 pr-4">{item.qty_than} Than</td>
                      <td className="py-2 pr-4">{formatCurrency(item.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Status Timeline</h2>
            {isTerminalNegative ? (
              <div className="flex flex-col gap-3">
                {result.history.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span
                      className={
                        h.status === "REJECTED" || h.status === "EXPIRED"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
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
                  const entry = result.history.find((h) => h.status === step);
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
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="min-h-screen">
      <PublicHeader />
      <Suspense fallback={null}>
        <TrackForm />
      </Suspense>
    </main>
  );
}
