import { twMerge } from "tailwind-merge";
import { CUSTOMER_AUTH_EMAIL_DOMAIN } from "./constants";

// Plain string-join can't resolve conflicting utilities (e.g. a component's
// base "shadow-sm" vs. a caller's "shadow-md") — whichever ends up later in
// Tailwind's generated stylesheet wins, not whichever is later in this
// string, so overrides could silently fail to apply. twMerge resolves that
// correctly by understanding which classes are mutually exclusive.
export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Normalizes a Bangladeshi phone number to digits only (e.g. "01711-280943" -> "01711280943"). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidBdPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
}

/** Customers authenticate via Supabase Auth's email/password provider using a
 * synthetic email derived from their phone number, so no SMS/OTP setup is needed. */
export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhone(phone)}@${CUSTOMER_AUTH_EMAIL_DOMAIN}`;
}

/** Normalizes free-text fabric variant names to a consistent case (e.g. "voile",
 * "VOILE", "  voile  " all become "Voile") so the same variant typed differently
 * by different admins is stored, matched, and displayed identically everywhere. */
export function normalizeVariant(variant: string): string {
  return variant
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Extracts the "<bucket>/<path>" storage key from a Supabase Storage public URL. */
export function storagePathFromPublicUrl(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return publicUrl.slice(index + marker.length);
}
