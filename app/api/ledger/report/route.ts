import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { getShopSettings } from "@/lib/shop-settings";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  // Same reasoning as /api/ledger/summary: expenses.date is a plain DATE
  // column (bare "YYYY-MM-DD" bounds are already inclusive), but
  // customer_payments.created_at is timestamptz, so its "to" bound needs an
  // explicit end-of-day timestamp or same-day activity gets cut off.
  const dateFromTs = dateFrom ? `${dateFrom}T00:00:00.000Z` : null;
  const dateToTs = dateTo ? `${dateTo}T23:59:59.999Z` : null;

  const supabase = createServiceRoleClient();

  // Deliberately independent of the Ledger page's category filter — the
  // report is a complete financial summary for the date range, not a view
  // of whatever category happens to be selected on screen.
  let expensesQuery = supabase
    .from("expenses")
    .select("date, category, description, amount")
    .order("date", { ascending: true });
  if (dateFrom) expensesQuery = expensesQuery.gte("date", dateFrom);
  if (dateTo) expensesQuery = expensesQuery.lte("date", dateTo);

  let paymentsQuery = supabase
    .from("customer_payments")
    .select("amount, method, created_at, customers(name)")
    .order("created_at", { ascending: true });
  if (dateFromTs) paymentsQuery = paymentsQuery.gte("created_at", dateFromTs);
  if (dateToTs) paymentsQuery = paymentsQuery.lte("created_at", dateToTs);

  const [shopSettings, { data: expenses, error: expensesError }, { data: payments, error: paymentsError }] =
    await Promise.all([getShopSettings(), expensesQuery, paymentsQuery]);

  if (expensesError || paymentsError) {
    return NextResponse.json({ error: "Could not load report data." }, { status: 500 });
  }

  return NextResponse.json({
    shop_settings: shopSettings,
    expenses: expenses ?? [],
    payments: (payments ?? []).map((p) => ({
      // customer_payments -> customers is many-to-one, so PostgREST embeds
      // it as a single object, not an array (confirmed against real data —
      // TS's inferred array type here is wrong without generated DB types).
      customer_name: (p.customers as unknown as { name: string } | null)?.name ?? "Unknown",
      date: p.created_at,
      amount: p.amount,
      method: p.method,
    })),
  });
}
