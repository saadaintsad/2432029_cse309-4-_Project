import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Server Component / Route Handler client — reads/writes the customer's Supabase Auth session cookies. */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — middleware refreshes the
            // session cookie on the next request instead.
          }
        },
      },
    }
  );
}

/** Privileged client using the service role key — bypasses RLS. Server-only, never expose to the browser.
 *
 * Explicitly disables Next.js's fetch Data Cache. Next patches the global
 * `fetch` and caches GET requests by default during server rendering —
 * including supabase-js's underlying REST calls — even on routes marked
 * `export const dynamic = "force-dynamic"` (that setting affects whether the
 * route itself is prerendered, but doesn't reliably stop already-cached
 * fetch entries from being reused for routes with no dynamic API trigger).
 * Business data read through this client must always be live, never a stale
 * cached response, so every call here is forced to `cache: "no-store"`. */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
