"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { AddExpenseModal } from "./AddExpenseModal";

// @react-pdf/renderer touches browser-only APIs and must be built entirely
// within one client-only module (see GenerateReportButton.tsx) — ssr:false
// keeps this whole chunk out of the server bundle (spec: "Generated
// client-side only — no server-side PDF generation").
const GenerateReportButton = dynamic(() => import("./GenerateReportButton"), {
  ssr: false,
  loading: () => (
    <Button type="button" variant="secondary" disabled>
      Preparing Report…
    </Button>
  ),
});

interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  note: string | null;
}

interface Summary {
  total_expenses: number;
  expenses_by_category: Record<string, number>;
  total_payables_due: number;
  total_customer_receivables: number;
  total_revenue: number;
  total_cash_received: number;
  gross_profit: number;
  net_profit: number;
}

export function LedgerPage() {
  const [expenses, setExpenses] = useState<ExpenseRow[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    try {
      const [expensesRes, summaryRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`),
        fetch(`/api/ledger/summary?${params.toString()}`),
      ]);
      const expensesData = await expensesRes.json();
      const summaryData = await summaryRes.json();

      if (!expensesRes.ok || !summaryRes.ok) {
        setError(expensesData.error ?? summaryData.error ?? "Could not load ledger.");
        return;
      }
      setExpenses(expensesData.expenses);
      setSummary(summaryData);
    } catch {
      setError("Network error while loading ledger.");
    }
  }, [category, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  function handleClearFilters() {
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Ledger</h1>
        <div className="flex items-center gap-2">
          {summary && (
            <GenerateReportButton dateFrom={dateFrom} dateTo={dateTo} summary={summary} />
          )}
          <Button onClick={() => setShowAddModal(true)}>Add Expense</Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-slate-500">Total Revenue</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(summary.total_revenue)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Total Cash Received</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(summary.total_cash_received)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Gross Profit</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(summary.gross_profit)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Net Profit / Loss</p>
            <p
              className={`mt-1 text-xl font-semibold ${
                summary.net_profit >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.net_profit)}
            </p>
          </Card>
        </div>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-slate-500">Total Expenses</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(summary.total_expenses)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Outstanding Payables</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">
              {formatCurrency(summary.total_payables_due)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Customer Receivables</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">
              {formatCurrency(summary.total_customer_receivables)}
            </p>
          </Card>
        </div>
      )}

      {summary && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Expenses by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {EXPENSE_CATEGORIES.map((c) => (
              <div key={c} className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{c}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(summary.expenses_by_category[c] ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-0">
        {expenses === null ? (
          <p className="p-6 text-sm text-slate-500">Loading expenses…</p>
        ) : expenses.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No expenses match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{e.description}</td>
                    <td className="px-4 py-3">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3 text-slate-500">{e.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddExpenseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={load}
      />
    </div>
  );
}
