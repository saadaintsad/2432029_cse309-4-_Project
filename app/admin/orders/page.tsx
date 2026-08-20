import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderList } from "@/components/admin/orders/OrderList";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <OrderList />
    </AdminShell>
  );
}
