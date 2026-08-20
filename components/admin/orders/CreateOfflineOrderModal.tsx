"use client";

import { useEffect, useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";

interface CustomerOption {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
}

interface InventoryOption {
  id: string;
  variant: string;
  color: string;
  suta_count: number;
  qty_than: number;
  selling_price_per_than: number;
}

interface LineItem {
  inventory_id: string;
  variant: string;
  color: string;
  suta_count: number;
  qty_than: number;
  rate_per_than: number;
  available: number;
}

interface CreateOfflineOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOfflineOrderModal({
  open,
  onClose,
  onCreated,
}: CreateOfflineOrderModalProps) {
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });

  const [itemQuery, setItemQuery] = useState("");
  const [itemResults, setItemResults] = useState<InventoryOption[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [note, setNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCustomerMode("existing");
      setCustomerQuery("");
      setCustomerResults([]);
      setSelectedCustomer(null);
      setNewCustomer({ name: "", phone: "", address: "" });
      setItemQuery("");
      setItemResults([]);
      setItems([]);
      setNote("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || customerMode !== "existing" || !customerQuery) {
      setCustomerResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(customerQuery)}`);
      const data = await res.json();
      if (res.ok) setCustomerResults(data.customers);
    }, 250);
    return () => clearTimeout(timeout);
  }, [open, customerMode, customerQuery]);

  useEffect(() => {
    if (!open) {
      setItemResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/inventory?variant=${encodeURIComponent(itemQuery)}`);
      const data = await res.json();
      if (res.ok) setItemResults(data.inventory);
    }, 250);
    return () => clearTimeout(timeout);
  }, [open, itemQuery]);

  function addItem(inv: InventoryOption) {
    if (items.some((i) => i.inventory_id === inv.id)) return;
    setItems((prev) => [
      ...prev,
      {
        inventory_id: inv.id,
        variant: inv.variant,
        color: inv.color,
        suta_count: inv.suta_count,
        qty_than: 1,
        rate_per_than: inv.selling_price_per_than,
        available: inv.qty_than,
      },
    ]);
  }

  function updateQty(inventoryId: string, qty: number) {
    setItems((prev) =>
      prev.map((i) => (i.inventory_id === inventoryId ? { ...i, qty_than: qty } : i))
    );
  }

  function removeItem(inventoryId: string) {
    setItems((prev) => prev.filter((i) => i.inventory_id !== inventoryId));
  }

  const total = items.reduce((sum, i) => sum + i.qty_than * i.rate_per_than, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (customerMode === "existing" && !selectedCustomer) {
      setError("Select a customer.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (items.some((i) => !Number.isFinite(i.qty_than) || i.qty_than < 1)) {
      setError("Every item needs a quantity of at least 1 Than.");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        items: items.map((i) => ({ inventory_id: i.inventory_id, qty_than: i.qty_than })),
        note: note || undefined,
      };
      if (customerMode === "existing") {
        body.customer_id = selectedCustomer!.id;
      } else {
        body.new_customer = newCustomer;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create order.");
        return;
      }

      onCreated();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Offline Order" className="max-w-2xl">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <div className="mb-2 flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={customerMode === "existing"}
                onChange={() => setCustomerMode("existing")}
              />
              Existing Customer
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={customerMode === "new"}
                onChange={() => setCustomerMode("new")}
              />
              New Customer
            </label>
          </div>

          {customerMode === "existing" ? (
            <div>
              <Input
                placeholder="Search by name, phone, or Customer ID"
                value={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.customer_id})` : customerQuery}
                onChange={(e) => {
                  setSelectedCustomer(null);
                  setCustomerQuery(e.target.value);
                }}
              />
              {!selectedCustomer && customerResults.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-slate-200">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerResults([]);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      {c.name} — {c.phone} ({c.customer_id})
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="Phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                placeholder="Address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Items</label>
          <Input
            placeholder="Search inventory by variant"
            value={itemQuery}
            onChange={(e) => setItemQuery(e.target.value)}
          />
          {itemResults.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-slate-200">
              {itemResults.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => addItem(inv)}
                  disabled={inv.qty_than <= 0}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {inv.variant} — {inv.color} (suta {inv.suta_count}) · {inv.qty_than} Than available ·{" "}
                  {formatCurrency(inv.selling_price_per_than)}/Than
                </button>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {items.map((i) => (
                <div
                  key={i.inventory_id}
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="flex-1">
                    {i.variant} — {i.color} (suta {i.suta_count})
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={i.available}
                    step="any"
                    value={i.qty_than}
                    onChange={(e) => updateQty(i.inventory_id, Number(e.target.value))}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1"
                  />
                  <span className="w-16 text-right">Than</span>
                  <span className="w-24 text-right font-medium">
                    {formatCurrency(i.qty_than * i.rate_per_than)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(i.inventory_id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex justify-end text-sm font-semibold text-slate-900">
                Total: {formatCurrency(total)}
              </div>
            </div>
          )}
        </div>

        <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
