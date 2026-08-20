export const ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "CONFIRMED",
  "ON_THE_WAY",
  "DELIVERED",
  "REJECTED",
  "EXPIRED",
] as const;

export const PAYMENT_METHODS = ["CASH", "CHEQUE", "BANK"] as const;

export const EXPENSE_CATEGORIES = [
  "RENT",
  "SALARY",
  "UTILITY",
  "INVENTORY",
  "OTHER",
] as const;

export const PAYABLE_STATUSES = ["UNPAID", "PARTIAL", "PAID"] as const;

export const THAN_TO_GOJ = 30;
export const MIN_ORDER_QTY_THAN = 1;
export const APPROVED_CONFIRM_WINDOW_DAYS = 30;

// Customer auth uses Supabase Auth's email/password provider under the hood.
// Customers only ever enter a phone number, so we map phone -> a synthetic,
// unreachable email address. No SMS/OTP provider is required this way.
export const CUSTOMER_AUTH_EMAIL_DOMAIN = "customers.newnislam.internal";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours
