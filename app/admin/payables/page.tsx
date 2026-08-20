import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PayablesList } from "@/components/admin/payables/PayablesList";

export default async function AdminPayablesPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <PayablesList />
    </AdminShell>
  );
}
