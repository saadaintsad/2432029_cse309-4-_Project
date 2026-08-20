import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { createWalkInCustomer } from "@/lib/customers";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("customers")
    .select(
      "id, customer_id, name, phone, shop_name, total_purchased, total_paid, due, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (q) {
    const safeQ = q.replace(/[,()]/g, "");
    query = query.or(
      `name.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,customer_id.ilike.%${safeQ}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load customers." }, { status: 500 });
  }

  return NextResponse.json({ customers: data });
}

/** Admin-only "walk-in customer" creation — used when creating an Offline Order
 * for a customer who doesn't exist yet (spec section 22). */
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await createWalkInCustomer(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ customer: result.customer }, { status: 201 });
}
