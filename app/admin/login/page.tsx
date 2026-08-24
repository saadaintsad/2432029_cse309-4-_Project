"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(data.must_change_password ? "/admin/change-password" : "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <Image
        src="/images/adminBackground.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-amber-700 p-4 text-white shadow-lg shadow-amber-900/40">
            <Store size={36} />
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">New N Islam</h1>
          <p className="mt-1 text-sm font-medium text-white/80">Admin Panel — New N Islam</p>
        </div>

        <div
          className="rounded-2xl border border-white/20 bg-white/[0.08] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-10"
        >
          <h2 className="mb-1 text-xl font-semibold text-white">Sign In</h2>
          <p className="mb-6 text-sm text-white/70">Enter your admin credentials to continue.</p>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-username" className="text-sm font-medium text-white/90">
                Username
              </label>
              <input
                id="admin-username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-md border border-white/30 bg-white/[0.12] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/60 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-password" className="text-sm font-medium text-white/90">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-white/30 bg-white/[0.12] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/60 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
              />
            </div>
            <Button type="submit" loading={loading} className="mt-2 py-2.5">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/80">
          <Link href="/" className="hover:text-white hover:underline">
            ← View Customer Site
          </Link>
        </p>
      </div>
    </main>
  );
}
