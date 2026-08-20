import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  adminCookieOptions,
  hashPassword,
  requireAdmin,
  signAdminToken,
  verifyPassword,
} from "@/lib/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

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

  const currentPassword =
    typeof body.current_password === "string" ? body.current_password : "";
  const newPassword = typeof body.new_password === "string" ? body.new_password : "";

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, admin_id, username, password_hash")
    .eq("id", session.sub)
    .maybeSingle();

  if (error || !admin) {
    return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
  }

  const currentOk = await verifyPassword(currentPassword, admin.password_hash);
  if (!currentOk) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const newHash = await hashPassword(newPassword);
  const { error: updateError } = await supabase
    .from("admins")
    .update({ password_hash: newHash, must_change_password: false })
    .eq("id", admin.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Could not update password. Please try again." },
      { status: 500 }
    );
  }

  const token = await signAdminToken({
    sub: admin.id,
    admin_id: admin.admin_id,
    username: admin.username,
    role: "admin",
    must_change_password: false,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions);
  return response;
}
