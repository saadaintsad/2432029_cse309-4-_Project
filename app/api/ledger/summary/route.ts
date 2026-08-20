import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  const supabase = createServiceRoleClient();

  let expenseQuery = supabase.from("expenses").select("category, amount");
  if (dateFrom) expenseQuery = expenseQuery.gte("date", dateFrom);
  if (dateTo) expenseQuery = expenseQuery.lte("date", dateTo);
  const { data: expenses, error: expenseError } = await expenseQuery;

  const { data: payables, error: payablesError } = await supabase
    .from("payables")
    .select("due_amount, status");

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("due");

  if (expenseError || payablesError || customersError) {
    return NextResponse.json({ error: "Could not load ledger summary." }, { status: 500 });
  }

  const byCategory: Record<string, number> = Object.fromEntries(
    EXPENSE_CATEGORIES.map((c) => [c, 0])
  );
  let totalExpenses = 0;
  for (const e of expenses ?? []) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    totalExpenses += e.amount;
  }

  const totalPayablesDue = (payables ?? [])
    .filter((p) => p.status !== "PAID")
    .reduce((sum, p) => sum + p.due_amount, 0);

  const totalCustomerReceivables = (customers ?? []).reduce((sum, c) => sum + c.due, 0);

  return NextResponse.json({
    total_expenses: totalExpenses,
    expenses_by_category: byCategory,
    total_payables_due: totalPayablesDue,
    total_customer_receivables: totalCustomerReceivables,
  });
}
