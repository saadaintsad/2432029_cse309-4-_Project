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
  // expenses.date is a plain DATE column, so a bare "YYYY-MM-DD" bound is
  // already inclusive of the whole day. orders.confirmed_at and
  // customer_payments.created_at are timestamptz — comparing those against
  // a bare date would cut off before end-of-day on the "to" bound, so they
  // get explicit UTC day-boundary timestamps instead.
  const dateFromTs = dateFrom ? `${dateFrom}T00:00:00.000Z` : null;
  const dateToTs = dateTo ? `${dateTo}T23:59:59.999Z` : null;

  const supabase = createServiceRoleClient();

  let expenseQuery = supabase.from("expenses").select("category, amount");
  if (dateFrom) expenseQuery = expenseQuery.gte("date", dateFrom);
  if (dateTo) expenseQuery = expenseQuery.lte("date", dateTo);

  let ordersQuery = supabase
    .from("orders")
    .select("total_amount")
    .in("status", ["CONFIRMED", "ON_THE_WAY", "DELIVERED"]);
  if (dateFromTs) ordersQuery = ordersQuery.gte("confirmed_at", dateFromTs);
  if (dateToTs) ordersQuery = ordersQuery.lte("confirmed_at", dateToTs);

  let paymentsQuery = supabase.from("customer_payments").select("amount");
  if (dateFromTs) paymentsQuery = paymentsQuery.gte("created_at", dateFromTs);
  if (dateToTs) paymentsQuery = paymentsQuery.lte("created_at", dateToTs);

  const [
    { data: expenses, error: expenseError },
    { data: payables, error: payablesError },
    { data: customers, error: customersError },
    { data: revenueOrders, error: ordersError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    expenseQuery,
    supabase.from("payables").select("due_amount, status"),
    supabase.from("customers").select("due"),
    ordersQuery,
    paymentsQuery,
  ]);

  if (expenseError || payablesError || customersError || ordersError || paymentsError) {
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

  const totalRevenue = (revenueOrders ?? []).reduce((sum, o) => sum + o.total_amount, 0);
  const totalCashReceived = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const grossProfit = totalRevenue - (byCategory.INVENTORY ?? 0);
  const netProfit = totalRevenue - totalExpenses;

  return NextResponse.json({
    total_expenses: totalExpenses,
    expenses_by_category: byCategory,
    total_payables_due: totalPayablesDue,
    total_customer_receivables: totalCustomerReceivables,
    total_revenue: totalRevenue,
    total_cash_received: totalCashReceived,
    gross_profit: grossProfit,
    net_profit: netProfit,
  });
}
