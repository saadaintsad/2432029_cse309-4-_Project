import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <DashboardOverview username={session?.username ?? ""} />
    </AdminShell>
  );
}
