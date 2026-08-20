"use client";

import { useEffect, useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

interface RecordPayablePaymentModalProps {
  payableId: string | null;
  dueAmount: number;
  onClose: () => void;
  onRecorded: () => void;
}

export function RecordPayablePaymentModal({
  payableId,
  dueAmount,
  onClose,
  onRecorded,
}: RecordPayablePaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("CASH");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (payableId) {
      setAmount("");
      setMethod("CASH");
      setNote("");
      setError(null);
    }
  }, [payableId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!payableId) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/payables/${payableId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method, note }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not record payment.");
        return;
      }
      onRecorded();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={!!payableId} onClose={onClose} title="Record Payable Payment">
      <p className="mb-4 text-xs text-slate-500">
        Outstanding due: <span className="font-medium">{formatCurrency(dueAmount)}</span>
      </p>
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount"
          required
          type="number"
          min={0}
          max={dueAmount}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
