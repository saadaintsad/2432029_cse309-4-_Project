import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: payable, error: payableError } = await supabase
    .from("payables")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (payableError || !payable) {
    return NextResponse.json({ error: "Payable not found." }, { status: 404 });
  }

  const { data: payments } = await supabase
    .from("payable_payments")
    .select("id, amount, method, note, created_at")
    .eq("payable_id", params.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ payable, payments });
}
