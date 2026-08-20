import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { isValidBdPhone, normalizePhone } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id, admin_id, username, phone, must_change_password, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load admins." }, { status: 500 });
  }

  return NextResponse.json({ admins: data });
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

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }
  if (!isValidBdPhone(phoneRaw)) {
    return NextResponse.json(
      { error: "Enter a valid Bangladeshi phone number." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from("admins")
    .insert({
      username,
      phone: normalizePhone(phoneRaw),
      password_hash: passwordHash,
      must_change_password: true,
    })
    .select("admin_id, username")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Username already exists." : "Could not create admin.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ admin: data }, { status: 201 });
}
