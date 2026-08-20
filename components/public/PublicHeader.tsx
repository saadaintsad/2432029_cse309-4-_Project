"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setCustomerName((data.user?.user_metadata?.name as string) ?? null);
      setChecking(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomerName((session?.user?.user_metadata?.name as string) ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-slate-900">
        New N Islam
      </Link>
      <nav className="flex items-center gap-4 text-sm text-slate-600">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <Link
          href={
            customerName
              ? "/account"
              : "/signin?redirectTo=/account&message=Please+sign+in+to+view+your+account"
          }
          className="hover:text-slate-900"
        >
          My Account
        </Link>

        {checking ? null : customerName ? (
          <>
            <Link href="/account" className="hover:text-slate-900">
              {customerName}
            </Link>
            <Button
              variant="secondary"
              className="px-3 py-1.5"
              loading={signingOut}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/signin" className="hover:text-slate-900">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="px-3 py-1.5">Sign Up</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
