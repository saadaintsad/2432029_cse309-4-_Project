"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYABLE_STATUSES } from "@/lib/constants";
import { RecordPayablePaymentModal } from "./RecordPayablePaymentModal";
import { CreatePayableModal } from "./CreatePayableModal";

interface PayableRow {
  id: string;
  payable_id: string;
  description: string;
  party_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export function PayablesList() {
  const [payables, setPayables] = useState<PayableRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [payingPayable, setPayingPayable] = useState<PayableRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);

    try {
      const res = await fetch(`/api/payables?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load payables.");
        return;
      }
      setPayables(data.payables);
    } catch {
      setError("Network error while loading payables.");
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Payables</h1>
        <Button onClick={() => setShowCreateModal(true)}>Add Payable</Button>
      </div>

      <Card>
        <div className="flex flex-col gap-1 sm:w-64">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
          >
            <option value="">All Statuses</option>
            {PAYABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-0">
        {payables === null ? (
          <p className="p-6 text-sm text-slate-500">Loading payables…</p>
        ) : payables.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No payables match your filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-medium">Payable ID</th>
                  <th className="px-4 py-3 font-medium">Party</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payables.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{p.payable_id}</td>
                    <td className="px-4 py-3 text-slate-900">{p.party_name}</td>
                    <td className="px-4 py-3">{p.description}</td>
                    <td className="px-4 py-3">{formatCurrency(p.total_amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.paid_amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.due_amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      {p.status !== "PAID" && (
                        <button
                          className="text-amber-700 hover:underline"
                          onClick={() => setPayingPayable(p)}
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <RecordPayablePaymentModal
        payableId={payingPayable?.id ?? null}
        dueAmount={payingPayable?.due_amount ?? 0}
        onClose={() => setPayingPayable(null)}
        onRecorded={() => {
          setPayingPayable(null);
          load();
        }}
      />

      <CreatePayableModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={load}
      />
    </div>
  );
}
