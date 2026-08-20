"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { phoneToAuthEmail } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    password: "",
    shop_name: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: phoneToAuthEmail(form.phone),
        password: form.password,
      });

      if (signInError) {
        setError("Account created, but sign in failed. Please sign in manually.");
        router.push("/signin");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mb-6 text-sm text-slate-500">
          New N Islam — Islampur, Old Dhaka
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <Input
            label="Phone Number"
            required
            type="tel"
            placeholder="017XXXXXXXX"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <Input
            label="Address"
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <Input
            label="Password"
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <Input
            label="Shop / Business Name (optional)"
            value={form.shop_name}
            onChange={(e) => update("shop_name", e.target.value)}
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <Button type="submit" loading={loading} className="mt-2">
            Sign Up
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-amber-700 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
