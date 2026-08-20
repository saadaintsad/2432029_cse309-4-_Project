import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { RestockSuggestions } from "@/components/admin/assistant/RestockSuggestions";
import { SlowMovingStock } from "@/components/admin/assistant/SlowMovingStock";

export default async function AdminAssistantPage() {
  const session = await getAdminSession();

  return (
    <AdminShell activeUsername={session?.username ?? ""}>
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold text-slate-900">Business Assistant</h1>
        <RestockSuggestions />
        <SlowMovingStock />
      </div>
    </AdminShell>
  );
}
