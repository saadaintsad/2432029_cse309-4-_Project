import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { adminCookieOptions, signAdminToken, verifyPassword } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (isRateLimited(`admin-login:${getClientIp(request)}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, admin_id, username, password_hash, must_change_password")
    .eq("username", username)
    .maybeSingle();

  if (error || !admin) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const passwordOk = await verifyPassword(password, admin.password_hash);
  if (!passwordOk) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await signAdminToken({
    sub: admin.id,
    admin_id: admin.admin_id,
    username: admin.username,
    role: "admin",
    must_change_password: admin.must_change_password,
  });

  const response = NextResponse.json({
    must_change_password: admin.must_change_password,
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
