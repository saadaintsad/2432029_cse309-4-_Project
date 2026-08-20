"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface CreatePayableModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePayableModal({ open, onClose, onCreated }: CreatePayableModalProps) {
  const [description, setDescription] = useState("");
  const [partyName, setPartyName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setDescription("");
    setPartyName("");
    setTotalAmount("");
    setPaidAmount("0");
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
      const res = await fetch("/api/payables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          party_name: partyName,
          total_amount: Number(totalAmount),
          paid_amount: Number(paidAmount),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create payable.");
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
    <Modal open={open} onClose={handleClose} title="Add Payable">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Description"
          required
          placeholder="What this payable is for"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Party Name"
          required
          placeholder="Mill / factory / supplier name"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
        />
        <Input
          label="Total Amount"
          required
          type="number"
          min={0}
          step="any"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
        <Input
          label="Already Paid (optional)"
          type="number"
          min={0}
          step="any"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Add Payable
          </Button>
        </div>
      </form>
    </Modal>
  );
}
