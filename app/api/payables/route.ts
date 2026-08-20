import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { PAYABLE_STATUSES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");

  const supabase = createServiceRoleClient();
  let query = supabase.from("payables").select("*").order("created_at", { ascending: false });

  if (status && (PAYABLE_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load payables." }, { status: 500 });
  }

  return NextResponse.json({ payables: data });
}

/** Manual payable creation, for dues that aren't tied to an inventory restock
 * (spec 7.6: "Admin can also create payables manually for other dues"). */
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

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const partyName = typeof body.party_name === "string" ? body.party_name.trim() : "";
  const totalAmount = Number(body.total_amount);
  const paidAmount = Number(body.paid_amount ?? 0);

  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }
  if (!partyName) {
    return NextResponse.json({ error: "Party name is required." }, { status: 400 });
  }
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    return NextResponse.json({ error: "Total amount cannot be negative." }, { status: 400 });
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });
  }
  if (paidAmount > totalAmount) {
    return NextResponse.json(
      { error: "Paid amount cannot exceed the total amount." },
      { status: 400 }
    );
  }

  const dueAmount = totalAmount - paidAmount;
  const status = dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("payables")
    .insert({
      description,
      party_name: partyName,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      status,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create payable." }, { status: 500 });
  }

  return NextResponse.json({ payable: data }, { status: 201 });
}
