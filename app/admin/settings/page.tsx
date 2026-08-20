import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAccountsSection } from "@/components/admin/AdminAccountsSection";
import { ShopDetailsSection } from "@/components/admin/settings/ShopDetailsSection";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        <ShopDetailsSection />
        <AdminAccountsSection />
      </div>
    </AdminShell>
  );
}
