"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";

interface SlowMovingItem {
  inventory_id: string;
  variant: string;
  color: string;
  suta_count: number;
  current_stock: number;
  selling_price_per_than: number;
  own_cost_per_than: number;
  days_since_last_sale: number | null;
  suggested_discount_min_percent: number;
  suggested_discount_max_percent: number;
  suggested_price_min: number;
  suggested_price_max: number;
  capped_by_own_cost: boolean;
}

export function SlowMovingStock() {
  const [data, setData] = useState<{ slow_moving: SlowMovingItem[]; threshold_days: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assistant/slow-moving")
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error ?? "Could not load slow-moving stock.");
          return;
        }
        setData(json);
      })
      .catch(() => setError("Network error while loading slow-moving stock."));
  }, []);

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-slate-900">
        Slow Moving Stock — Discount Recommendations
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        Items with no sale in {data?.threshold_days ?? 60}+ days. Suggestions only — you decide
        whether to actually change any price.
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      {!data && !error ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : data && data.slow_moving.length === 0 ? (
        <p className="text-sm text-slate-500">No slow-moving stock right now.</p>
      ) : data ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-2 font-medium">Variant</th>
                <th className="px-3 py-2 font-medium">Color</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">Last Sale</th>
                <th className="px-3 py-2 font-medium">Current Price</th>
                <th className="px-3 py-2 font-medium">Suggested Discount</th>
                <th className="px-3 py-2 font-medium">Suggested Price</th>
              </tr>
            </thead>
            <tbody>
              {data.slow_moving.map((item) => (
                <tr key={item.inventory_id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-900">{item.variant}</td>
                  <td className="px-3 py-2">{item.color}</td>
                  <td className="px-3 py-2">{item.current_stock} Than</td>
                  <td className="px-3 py-2 text-slate-500">
                    {item.days_since_last_sale === null
                      ? "Never sold"
                      : `${item.days_since_last_sale} days ago`}
                  </td>
                  <td className="px-3 py-2">{formatCurrency(item.selling_price_per_than)}</td>
                  <td className="px-3 py-2 text-amber-700">
                    {item.suggested_discount_min_percent}–{item.suggested_discount_max_percent}%
                  </td>
                  <td className="px-3 py-2">
                    {formatCurrency(item.suggested_price_min)}–{formatCurrency(item.suggested_price_max)}
                    {item.capped_by_own_cost && (
                      <span className="ml-1 text-xs text-slate-400" title="Capped so price never drops below own cost">
                        (cost floor)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}
