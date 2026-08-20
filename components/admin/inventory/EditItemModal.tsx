"use client";

import { useEffect, useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { AdminInventoryItem } from "./types";

interface EditItemModalProps {
  item: AdminInventoryItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditItemModal({ item, onClose, onUpdated }: EditItemModalProps) {
  const [sellingPrice, setSellingPrice] = useState("");
  const [location, setLocation] = useState("");
  const [display, setDisplay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setSellingPrice(String(item.selling_price_per_than));
      setLocation(item.location);
      setDisplay(item.display);
      setError(null);
    }
  }, [item]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selling_price_per_than: Number(sellingPrice),
          location,
          display,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not update item.");
        return;
      }

      onUpdated();
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
      title={item ? `Edit ${item.variant} — ${item.color}` : "Edit Item"}
    >
      {item && (
        <>
          <p className="mb-4 text-xs text-slate-500">
            Suta {item.suta_count} · Qty {item.qty_than} Than. Variant, Suta
            Count, Color and quantity/cost are fixed here — use Restock to
            change quantity or cost.
          </p>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Selling Price / Than"
              required
              type="number"
              min={0}
              step="any"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
            <Input
              label="Location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={display}
                onChange={(e) => setDisplay(e.target.checked)}
              />
              Visible to customers (Display ON)
            </label>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
