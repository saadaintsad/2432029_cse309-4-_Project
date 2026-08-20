import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { CustomerDetail } from "@/components/admin/customers/CustomerDetail";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <CustomerDetail customerId={params.id} />
    </AdminShell>
  );
}
