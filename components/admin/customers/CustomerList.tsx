"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerRow {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  shop_name: string | null;
  total_purchased: number;
  total_paid: number;
  due: number;
  status: "ALL_CLEAR" | "HAS_DUE";
  created_at: string;
}

export function CustomerList() {
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    try {
      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load customers.");
        return;
      }
      setCustomers(data.customers);
    } catch {
      setError("Network error while loading customers.");
    }
  }, [q]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-slate-900">Customers</h1>

      <Card>
        <Input
          label="Search by name, phone, or Customer ID"
          placeholder="e.g. Karim or 01711280943 or CUST-001"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-0">
        {customers === null ? (
          <p className="p-6 text-sm text-slate-500">Loading customers…</p>
        ) : customers.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No customers match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-medium">Customer ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Total Purchased</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-medium text-amber-700 hover:underline"
                      >
                        {c.customer_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{c.name}</td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{formatCurrency(c.total_purchased)}</td>
                    <td className="px-4 py-3">{formatCurrency(c.total_paid)}</td>
                    <td className="px-4 py-3">{formatCurrency(c.due)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.status === "ALL_CLEAR"
                            ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {c.status === "ALL_CLEAR" ? "All Clear" : "Has Due"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
