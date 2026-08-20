"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { RecordPaymentModal } from "./RecordPaymentModal";

interface CustomerDetailData {
  customer: {
    id: string;
    customer_id: string;
    name: string;
    phone: string;
    address: string;
    shop_name: string | null;
    email: string | null;
    total_purchased: number;
    total_paid: number;
    due: number;
    status: "ALL_CLEAR" | "HAS_DUE";
    created_at: string;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    note: string | null;
    order_id: string | null;
    created_at: string;
  }[];
  orders: {
    id: string;
    order_id: string;
    status: string;
    order_source: string;
    total_amount: number;
    created_at: string;
  }[];
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not load customer.");
        return;
      }
      setData(json);
    } catch {
      setError("Network error while loading customer.");
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/customers" className="text-sm text-amber-700 hover:underline">
          ← Back to Customers
        </Link>
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading customer…</p>;
  }

  const { customer, payments, orders } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-amber-700 hover:underline">
          ← Back to Customers
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.customer_id}</p>
          </div>
          <Button onClick={() => setShowPaymentModal(true)} disabled={customer.due <= 0}>
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Profile</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Phone</dt>
            <dd className="text-slate-900">{customer.phone}</dd>
            <dt className="text-slate-500">Address</dt>
            <dd className="text-slate-900">{customer.address}</dd>
            {customer.shop_name && (
              <>
                <dt className="text-slate-500">Shop / Business</dt>
                <dd className="text-slate-900">{customer.shop_name}</dd>
              </>
            )}
            {customer.email && (
              <>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-900">{customer.email}</dd>
              </>
            )}
            <dt className="text-slate-500">Member since</dt>
            <dd className="text-slate-900">{formatDate(customer.created_at)}</dd>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Financial Standing</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Total Purchased</dt>
            <dd className="text-slate-900">{formatCurrency(customer.total_purchased)}</dd>
            <dt className="text-slate-500">Paid</dt>
            <dd className="text-slate-900">{formatCurrency(customer.total_paid)}</dd>
            <dt className="text-slate-500">Due</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(customer.due)}</dd>
            <dt className="text-slate-500">Status</dt>
            <dd>
              <span
                className={
                  customer.status === "ALL_CLEAR" ? "text-emerald-700" : "text-amber-700"
                }
              >
                {customer.status === "ALL_CLEAR" ? "All Clear" : "Has Due"}
              </span>
            </dd>
          </dl>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Order ID</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{o.order_id}</td>
                    <td className="py-2 pr-4">{o.order_source}</td>
                    <td className="py-2 pr-4">{o.status}</td>
                    <td className="py-2 pr-4">{formatCurrency(o.total_amount)}</td>
                    <td className="py-2 pr-4 text-slate-500">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Method</th>
                  <th className="py-2 pr-4 font-medium">Note</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{formatCurrency(p.amount)}</td>
                    <td className="py-2 pr-4">{p.method}</td>
                    <td className="py-2 pr-4">{p.note || "—"}</td>
                    <td className="py-2 pr-4 text-slate-500">{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <RecordPaymentModal
        open={showPaymentModal}
        customerId={customer.id}
        customerDue={customer.due}
        onClose={() => setShowPaymentModal(false)}
        onRecorded={() => {
          setShowPaymentModal(false);
          load();
        }}
      />
    </div>
  );
}
