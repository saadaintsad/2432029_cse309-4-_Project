import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { CustomerList } from "@/components/admin/customers/CustomerList";

export default async function AdminCustomersPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <CustomerList />
    </AdminShell>
  );
}
