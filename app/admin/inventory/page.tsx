import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { InventoryManager } from "@/components/admin/inventory/InventoryManager";

export default async function AdminInventoryPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <InventoryManager />
    </AdminShell>
  );
}
