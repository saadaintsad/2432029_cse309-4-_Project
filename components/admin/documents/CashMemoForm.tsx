"use client";

import { useEffect, useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";

// @react-pdf/renderer touches browser-only APIs and its <Document> element
// tree must be built entirely within one client-only module (see
// CashMemoDownload.tsx) — never split across nested dynamic() wrappers, or
// its internal renderer receives a loading placeholder instead of a real
// element tree. ssr:false keeps this whole chunk out of the server bundle
// (spec: "@react-pdf/renderer — client side only").
const CashMemoDownload = dynamic(() => import("./CashMemoDownload"), {
  ssr: false,
  loading: () => (
    <Button type="button" disabled>
      Preparing PDF…
    </Button>
  ),
});

interface EligibleOrder {
  id: string;
  order_id: string;
  status: string;
  total_amount: number;
  customers: { name: string; customer_id: string } | null;
}

interface GeneratedMemo {
  memo: {
    memo_id: string;
    customer_name: string;
    paid_amount: number;
    due_amount: number;
    total_amount: number;
  };
  order: { order_id: string };
  items: {
    variant: string;
    color: string;
    qty_than: number;
    rate_per_than: number;
    total_amount: number;
  }[];
  shop_settings: { shop_name: string; phone: string; address: string };
  customer_id: string;
}

const ELIGIBLE_STATUSES = ["CONFIRMED", "ON_THE_WAY", "DELIVERED"];

export function CashMemoForm() {
  const [orders, setOrders] = useState<EligibleOrder[]>([]);
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<EligibleOrder | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState<GeneratedMemo | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders.filter((o: EligibleOrder) => ELIGIBLE_STATUSES.includes(o.status)));
        }
      });
  }, []);

  const filtered = orders.filter((o) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      o.order_id.toLowerCase().includes(q) ||
      o.customers?.name.toLowerCase().includes(q)
    );
  });

  function selectOrder(order: EligibleOrder) {
    setSelectedOrder(order);
    setPaidAmount(String(order.total_amount));
    setDueAmount("0");
    setGenerated(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedOrder) {
      setError("Select an order first.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/cash-memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          paid_amount: Number(paidAmount),
          due_amount: Number(dueAmount),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not generate cash memo.");
        return;
      }

      setGenerated({ ...data, customer_id: selectedOrder.customers?.customer_id ?? "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900">Cash Memo</h2>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {!selectedOrder ? (
        <div>
          <Input
            label="Search by Order ID or Customer Name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-slate-200">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">
                No confirmed orders found. Cash Memo can only be generated for a
                confirmed order.
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => selectOrder(o)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {o.order_id} — {o.customers?.name} ({formatCurrency(o.total_amount)})
                </button>
              ))
            )}
          </div>
        </div>
      ) : !generated ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-900">{selectedOrder.order_id}</p>
            <p className="text-slate-500">
              {selectedOrder.customers?.name} · Total: {formatCurrency(selectedOrder.total_amount)}
            </p>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-1 text-xs text-amber-700 hover:underline"
            >
              Change order
            </button>
          </div>
          <Input
            label="Paid Amount (for memo display)"
            required
            type="number"
            min={0}
            step="any"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
          <Input
            label="Due Amount (for memo display)"
            required
            type="number"
            min={0}
            step="any"
            value={dueAmount}
            onChange={(e) => setDueAmount(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            These values are printed on the memo only — they do not change the
            customer&apos;s actual due or record a payment.
          </p>
          <Button type="submit" loading={submitting} className="w-fit">
            Generate Cash Memo
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <Alert variant="success">
            Cash Memo {generated.memo.memo_id} created.
          </Alert>
          <CashMemoDownload
            shop={generated.shop_settings}
            memo={generated.memo}
            order={generated.order}
            customerId={generated.customer_id}
            items={generated.items}
          />
          <button
            type="button"
            className="w-fit text-sm text-amber-700 hover:underline"
            onClick={() => {
              setSelectedOrder(null);
              setGenerated(null);
            }}
          >
            Create another
          </button>
        </div>
      )}
    </Card>
  );
}
