"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

interface Suggestion {
  inventory_id: string;
  variant: string;
  color: string;
  suta_count: number;
  current_stock: number;
  location: string;
  orders_count_90_days: number;
  qty_sold_90_days: number;
  depletion_rate: number;
  score: number;
}

export function RestockSuggestions() {
  const [data, setData] = useState<{ suggestions: Suggestion[]; window_days: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assistant/restock-suggestions")
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error ?? "Could not load restock suggestions.");
          return;
        }
        setData(json);
      })
      .catch(() => setError("Network error while loading restock suggestions."));
  }, []);

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-slate-900">Top 5 Products to Restock</h2>
      <p className="mb-4 text-xs text-slate-500">
        Based on customer order demand over the last {data?.window_days ?? 90} days. This is a
        demand indicator, not a guarantee — you decide what to restock.
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      {!data && !error ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : data && data.suggestions.length === 0 ? (
        <p className="text-sm text-slate-500">No inventory items to rank yet.</p>
      ) : data ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Variant</th>
                <th className="px-3 py-2 font-medium">Color</th>
                <th className="px-3 py-2 font-medium">Current Stock</th>
                <th className="px-3 py-2 font-medium">Orders (90d)</th>
                <th className="px-3 py-2 font-medium">Than Sold (90d)</th>
                <th className="px-3 py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.suggestions.map((s, idx) => (
                <tr key={s.inventory_id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{s.variant}</td>
                  <td className="px-3 py-2">{s.color}</td>
                  <td className="px-3 py-2">{s.current_stock} Than</td>
                  <td className="px-3 py-2">{s.orders_count_90_days}</td>
                  <td className="px-3 py-2">{s.qty_sold_90_days}</td>
                  <td className="px-3 py-2">{s.score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}
