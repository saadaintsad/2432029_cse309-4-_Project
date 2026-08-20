"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function AddExpenseModal({ open, onClose, onCreated }: AddExpenseModalProps) {
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number]>("OTHER");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setCategory("OTHER");
    setDescription("");
    setAmount("");
    setDate(today());
    setNote("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, amount: Number(amount), date, note }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create expense.");
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
    <Modal open={open} onClose={handleClose} title="Add Expense">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Amount"
          required
          type="number"
          min={0}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          label="Date"
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
