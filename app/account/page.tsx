import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase-server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved — contact the shop within 30 days to confirm",
  CONFIRMED: "Confirmed",
  ON_THE_WAY: "On the Way",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirectTo=/account");
  }

  const service = createServiceRoleClient();
  const { data: customer } = await service
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!customer) {
    redirect("/signin?redirectTo=/account");
  }

  const { data: orders } = await service
    .from("orders")
    .select("id, order_id, status, order_source, total_than, total_amount, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const { data: payments } = await service
    .from("customer_payments")
    .select("id, amount, method, note, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Account</h1>
          <p className="text-sm text-slate-500">{customer.customer_id}</p>
        </div>
        <Link href="/">
          <Button variant="secondary" className="inline-flex items-center gap-1.5">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Profile</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-500">Name</dt>
          <dd className="text-slate-900">{customer.name}</dd>
          <dt className="text-slate-500">Phone</dt>
          <dd className="text-slate-900">{customer.phone}</dd>
          <dt className="text-slate-500">Address</dt>
          <dd className="text-slate-900">{customer.address}</dd>
          {customer.shop_name && (
            <>
              <dt className="text-slate-500">Shop / Business</dt>
              <dd className="text-slate-900">{customer.shop_name}</dd>
            </>
          )}
          <dt className="text-slate-500">Member since</dt>
          <dd className="text-slate-900">{formatDate(customer.created_at)}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Account Book</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-500">Total Purchased</dt>
          <dd className="text-slate-900">{formatCurrency(customer.total_purchased)}</dd>
          <dt className="text-slate-500">Paid</dt>
          <dd className="text-slate-900">{formatCurrency(customer.total_paid)}</dd>
          <dt className="text-slate-500">Due</dt>
          <dd className="text-slate-900">{formatCurrency(customer.due)}</dd>
          <dt className="text-slate-500">Status</dt>
          <dd>
            <span
              className={
                customer.status === "ALL_CLEAR"
                  ? "text-emerald-700"
                  : "text-amber-700"
              }
            >
              {customer.status === "ALL_CLEAR" ? "All Clear" : "Has Due"}
            </span>
          </dd>
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">My Requests &amp; Orders</h2>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-slate-500">
            No requests yet.{" "}
            <Link href="/browse" className="text-amber-700 hover:underline">
              Browse Stock
            </Link>{" "}
            to place one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Order ID</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/track?order_id=${o.order_id}`}
                        className="text-amber-700 hover:underline"
                      >
                        {o.order_id}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{STATUS_LABEL[o.status] ?? o.status}</td>
                    <td className="py-2 pr-4">{formatCurrency(o.total_amount)}</td>
                    <td className="py-2 pr-4 text-slate-500">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Payment History</h2>
        {!payments || payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Method</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{formatCurrency(p.amount)}</td>
                    <td className="py-2 pr-4">{p.method}</td>
                    <td className="py-2 pr-4 text-slate-500">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}
