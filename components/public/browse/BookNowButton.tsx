"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";

interface BookNowButtonProps {
  inventoryId: string;
  sellingPricePerThan: number;
  qtyAvailable: number;
}

export function BookNowButton({
  inventoryId,
  sellingPricePerThan,
  qtyAvailable,
}: BookNowButtonProps) {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum < 1) {
      setError("Quantity must be at least 1 Than.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory_id: inventoryId, qty_than: qtyNum, note }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not submit request.");
        return;
      }

      setSubmittedOrderId(data.result.order_id);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <Button disabled className="w-full">
        Loading…
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Link href={`/signin?redirectTo=/browse/${inventoryId}`} className="block">
        <Button className="w-full">Sign in to Book Now</Button>
      </Link>
    );
  }

  if (submittedOrderId) {
    return (
      <Alert variant="success">
        Request submitted! Your order ID is <strong>{submittedOrderId}</strong>. You
        can track it anytime from the Track Order page, and it will also appear
        in your Account Book.
      </Alert>
    );
  }

  if (!showForm) {
    return (
      <Button className="w-full" onClick={() => setShowForm(true)} disabled={qtyAvailable <= 0}>
        {qtyAvailable <= 0 ? "Out of Stock" : "Book Now"}
      </Button>
    );
  }

  const qtyNum = Number(qty) || 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-slate-200 p-4">
      {error && <Alert variant="error">{error}</Alert>}
      <Input
        label="Quantity (Than)"
        type="number"
        min={1}
        step="any"
        required
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <p className="text-sm text-slate-600">
        Estimated Total: <span className="font-semibold">{formatCurrency(qtyNum * sellingPricePerThan)}</span>
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} className="flex-1">
          Submit Request
        </Button>
      </div>
    </form>
  );
}
