import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { isValidBdPhone, normalizePhone, phoneToAuthEmail } from "@/lib/utils";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (isRateLimited(`signup:${getClientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const shopName =
    typeof body.shop_name === "string" && body.shop_name.trim()
      ? body.shop_name.trim()
      : null;
  const email =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : null;

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!isValidBdPhone(phoneRaw))
    return NextResponse.json(
      { error: "Enter a valid Bangladeshi phone number." },
      { status: 400 }
    );
  if (!address)
    return NextResponse.json({ error: "Address is required." }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );

  const phone = normalizePhone(phoneRaw);
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An account with this phone number already exists." },
      { status: 409 }
    );
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: phoneToAuthEmail(phone),
    password,
    email_confirm: true,
    user_metadata: { name, phone },
  });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      id: authUser.user.id,
      name,
      phone,
      address,
      shop_name: shopName,
      email,
      total_purchased: 0,
      total_paid: 0,
      due: 0,
      status: "ALL_CLEAR",
    })
    .select("customer_id")
    .single();

  if (customerError || !customer) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ customer_id: customer.customer_id }, { status: 201 });
}
