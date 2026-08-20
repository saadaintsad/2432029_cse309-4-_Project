import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderDetail } from "@/components/admin/orders/OrderDetail";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <OrderDetail orderId={params.id} />
    </AdminShell>
  );
}
