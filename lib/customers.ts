import { createServiceRoleClient } from "./supabase-server";
import { isValidBdPhone, normalizePhone } from "./utils";

export interface WalkInCustomerInput {
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  shop_name?: unknown;
  email?: unknown;
}

export type CreateWalkInCustomerResult =
  | { ok: true; customer: { id: string; customer_id: string; name: string; phone: string } }
  | { ok: false; status: number; error: string };

/** Admin-only "walk-in customer" creation — no Supabase Auth account, since a
 * walk-in customer created during an Offline Order doesn't need online login. */
export async function createWalkInCustomer(
  input: WalkInCustomerInput
): Promise<CreateWalkInCustomerResult> {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const phoneRaw = typeof input.phone === "string" ? input.phone.trim() : "";
  const address = typeof input.address === "string" ? input.address.trim() : "";
  const shopName =
    typeof input.shop_name === "string" && input.shop_name.trim() ? input.shop_name.trim() : null;
  const email = typeof input.email === "string" && input.email.trim() ? input.email.trim() : null;

  if (!name) return { ok: false, status: 400, error: "Name is required." };
  if (!isValidBdPhone(phoneRaw)) {
    return { ok: false, status: 400, error: "Enter a valid Bangladeshi phone number." };
  }
  if (!address) return { ok: false, status: 400, error: "Address is required." };

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      phone: normalizePhone(phoneRaw),
      address,
      shop_name: shopName,
      email,
      total_purchased: 0,
      total_paid: 0,
      due: 0,
      status: "ALL_CLEAR",
    })
    .select("id, customer_id, name, phone")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { ok: false, status: 409, error: "A customer with this phone number already exists." };
    }
    return { ok: false, status: 500, error: "Could not create customer." };
  }

  return { ok: true, customer: data };
}
