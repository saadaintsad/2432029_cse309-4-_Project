import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { CashMemoForm } from "@/components/admin/documents/CashMemoForm";
import { ColorSlipForm } from "@/components/admin/documents/ColorSlipForm";

export default async function AdminDocumentsPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-slate-900">Documents</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <CashMemoForm />
          <ColorSlipForm />
        </div>
      </div>
    </AdminShell>
  );
}
