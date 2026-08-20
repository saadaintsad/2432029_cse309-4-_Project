import { createServiceRoleClient } from "./supabase-server";

export interface ShopSettingsData {
  shop_name: string;
  phone: string;
  address: string;
}

const DEFAULT_SHOP_SETTINGS: ShopSettingsData = {
  shop_name: "New N Islam",
  phone: "01711280943",
  address: "Islampur, Old Dhaka",
};

export async function getShopSettings(): Promise<ShopSettingsData> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("shop_settings")
    .select("shop_name, phone, address")
    .eq("id", "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  return data ?? DEFAULT_SHOP_SETTINGS;
}
