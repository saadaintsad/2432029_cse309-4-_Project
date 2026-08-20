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
  const category = searchParams.get("category");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  const supabase = createServiceRoleClient();
  let query = supabase.from("expenses").select("*").order("date", { ascending: false });

  if (category && (EXPENSE_CATEGORIES as readonly string[]).includes(category)) {
    query = query.eq("category", category);
  }
  if (dateFrom) query = query.gte("date", dateFrom);
  if (dateTo) query = query.lte("date", dateTo);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load expenses." }, { status: 500 });
  }

  return NextResponse.json({ expenses: data });
}

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

  const category = typeof body.category === "string" ? body.category : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const amount = Number(body.amount);
  const date = typeof body.date === "string" ? body.date : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json(
      { error: `Category must be one of: ${EXPENSE_CATEGORIES.join(", ")}.` },
      { status: 400 }
    );
  }
  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }
  if (!date || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({ category, description, amount, date, note: note || null })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create expense." }, { status: 500 });
  }

  return NextResponse.json({ expense: data }, { status: 201 });
}
