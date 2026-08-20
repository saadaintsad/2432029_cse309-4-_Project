"use client";

import { useEffect, useState, FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/utils";

interface AdminRow {
  admin_id: string;
  username: string;
  phone: string;
  must_change_password: boolean;
  created_at: string;
}

export function AdminAccountsSection() {
  const [admins, setAdmins] = useState<AdminRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState({ username: "", phone: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAdmins() {
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Could not load admin accounts.");
        return;
      }
      setAdmins(data.admins);
    } catch {
      setLoadError("Network error while loading admin accounts.");
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Could not create admin.");
        return;
      }

      setForm({ username: "", phone: "", password: "" });
      await loadAdmins();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900">Admin Accounts</h2>

      {loadError && (
        <Alert variant="error" className="mb-4">
          {loadError}
        </Alert>
      )}

      {admins === null && !loadError ? (
        <p className="text-sm text-slate-500">Loading admin accounts…</p>
      ) : admins && admins.length === 0 ? (
        <p className="text-sm text-slate-500">No admin accounts yet.</p>
      ) : (
        admins && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Admin ID</th>
                  <th className="py-2 pr-4 font-medium">Username</th>
                  <th className="py-2 pr-4 font-medium">Phone</th>
                  <th className="py-2 pr-4 font-medium">Created</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.admin_id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{a.admin_id}</td>
                    <td className="py-2 pr-4">{a.username}</td>
                    <td className="py-2 pr-4">{a.phone}</td>
                    <td className="py-2 pr-4">{formatDate(a.created_at)}</td>
                    <td className="py-2 pr-4">
                      {a.must_change_password ? (
                        <span className="text-amber-700">Must change password</span>
                      ) : (
                        <span className="text-emerald-700">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <h3 className="mb-3 text-sm font-semibold text-slate-900">Create Admin</h3>
      {formError && (
        <Alert variant="error" className="mb-4">
          {formError}
        </Alert>
      )}
      <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Username"
          required
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
        />
        <Input
          label="Phone Number"
          required
          type="tel"
          placeholder="017XXXXXXXX"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
        <Input
          label="Password"
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <Button type="submit" loading={submitting} className="sm:col-span-3 sm:w-fit">
          Create Admin
        </Button>
      </form>
    </Card>
  );
}
