import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { LedgerPage } from "@/components/admin/ledger/LedgerPage";

export default async function AdminLedgerPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <LedgerPage />
    </AdminShell>
  );
}
