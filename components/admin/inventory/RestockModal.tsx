"use client";

import { useEffect, useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";
import type { AdminInventoryItem } from "./types";

interface RestockModalProps {
  item: AdminInventoryItem | null;
  onClose: () => void;
  onRestocked: () => void;
}

const initialForm = {
  qty_added_than: "",
  buying_price_per_than: "",
  dying_cost_per_than: "0",
  paid_amount: "0",
  supplier_name: "",
  note: "",
};

export function RestockModal({ item, onClose, onRestocked }: RestockModalProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        ...initialForm,
        buying_price_per_than: String(item.buying_price_per_than),
        dying_cost_per_than: String(item.dying_cost_per_than),
      });
      setError(null);
    }
  }, [item]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const qty = Number(form.qty_added_than) || 0;
  const buying = Number(form.buying_price_per_than) || 0;
  const dying = Number(form.dying_cost_per_than) || 0;
  const paid = Number(form.paid_amount) || 0;
  const totalCost = qty * (buying + dying);
  const due = totalCost - paid;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/inventory/${item.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not record restock.");
        return;
      }

      onRestocked();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={item ? `Restock ${item.variant} — ${item.color}` : "Restock"}
    >
      {item && (
        <>
          <p className="mb-4 text-xs text-slate-500">
            Current stock: {item.qty_than} Than
          </p>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity Added (Than)"
              required
              type="number"
              min={0}
              step="any"
              value={form.qty_added_than}
              onChange={(e) => update("qty_added_than", e.target.value)}
            />
            <Input
              label="Buying Price / Than"
              required
              type="number"
              min={0}
              step="any"
              value={form.buying_price_per_than}
              onChange={(e) => update("buying_price_per_than", e.target.value)}
            />
            <Input
              label="Dying Cost / Than"
              type="number"
              min={0}
              step="any"
              value={form.dying_cost_per_than}
              onChange={(e) => update("dying_cost_per_than", e.target.value)}
            />
            <Input
              label="Paid Amount"
              type="number"
              min={0}
              step="any"
              value={form.paid_amount}
              onChange={(e) => update("paid_amount", e.target.value)}
            />
            <Input
              label="Supplier Name (optional)"
              value={form.supplier_name}
              onChange={(e) => update("supplier_name", e.target.value)}
            />
            <Input
              label="Note (optional)"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
            />

            <div className="col-span-2 rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Cost</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due to Supplier</span>
                <span
                  className={`font-medium ${due > 0 ? "text-amber-700" : "text-emerald-700"}`}
                >
                  {formatCurrency(Math.max(due, 0))}
                </span>
              </div>
            </div>

            <div className="col-span-2 mt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Record Restock
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
