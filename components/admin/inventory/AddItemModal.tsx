"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const initialForm = {
  variant: "",
  color: "",
  suta_count: "",
  qty_than: "0",
  buying_price_per_than: "",
  dying_cost_per_than: "0",
  selling_price_per_than: "",
  location: "",
  supplier_name: "",
  paid_amount: "0",
};

export function AddItemModal({ open, onClose, onCreated }: AddItemModalProps) {
  const [form, setForm] = useState(initialForm);
  const [display, setDisplay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    setForm(initialForm);
    setDisplay(true);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: form.variant,
          color: form.color,
          suta_count: Number(form.suta_count),
          qty_than: Number(form.qty_than),
          buying_price_per_than: Number(form.buying_price_per_than),
          dying_cost_per_than: Number(form.dying_cost_per_than),
          selling_price_per_than: Number(form.selling_price_per_than),
          location: form.location,
          display,
          supplier_name: form.supplier_name,
          paid_amount: Number(form.paid_amount),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create item.");
        return;
      }

      handleClose();
      onCreated();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Inventory Item">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input
          label="Variant"
          required
          value={form.variant}
          onChange={(e) => update("variant", e.target.value)}
        />
        <Input
          label="Color"
          required
          value={form.color}
          onChange={(e) => update("color", e.target.value)}
        />
        <Input
          label="Suta Count (10–120)"
          required
          type="number"
          min={10}
          max={120}
          value={form.suta_count}
          onChange={(e) => update("suta_count", e.target.value)}
        />
        <Input
          label="Location"
          required
          placeholder="Showroom or Warehouse"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />
        <Input
          label="Initial Quantity (Than)"
          required
          type="number"
          min={0}
          step="any"
          value={form.qty_than}
          onChange={(e) => update("qty_than", e.target.value)}
        />
        <Input
          label="Selling Price / Than"
          required
          type="number"
          min={0}
          step="any"
          value={form.selling_price_per_than}
          onChange={(e) => update("selling_price_per_than", e.target.value)}
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

        {Number(form.qty_than) > 0 && (
          <>
            <Input
              label="Supplier Name (optional)"
              value={form.supplier_name}
              onChange={(e) => update("supplier_name", e.target.value)}
            />
            <Input
              label="Paid Amount"
              type="number"
              min={0}
              step="any"
              value={form.paid_amount}
              onChange={(e) => update("paid_amount", e.target.value)}
            />
          </>
        )}

        <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={display}
            onChange={(e) => setDisplay(e.target.checked)}
          />
          Visible to customers (Display ON)
        </label>

        {Number(form.qty_than) > 0 && (
          <p className="col-span-2 text-xs text-slate-500">
            Adding initial stock records a restock, an INVENTORY expense, and a
            payable for any unpaid balance — same as a regular restock.
          </p>
        )}

        <div className="col-span-2 mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Add Item
          </Button>
        </div>
      </form>
    </Modal>
  );
}
