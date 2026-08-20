// TypeScript interfaces mirroring the Supabase schema (see schema.sql).

export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "CONFIRMED"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "REJECTED"
  | "EXPIRED";

export type OrderSource = "ONLINE" | "OFFLINE";

export type PaymentMethod = "CASH" | "CHEQUE" | "BANK";

export type CustomerStatus = "ALL_CLEAR" | "HAS_DUE";

export type PayableStatus = "UNPAID" | "PARTIAL" | "PAID";

export type ExpenseCategory =
  | "RENT"
  | "SALARY"
  | "UTILITY"
  | "INVENTORY"
  | "OTHER";

export interface Admin {
  id: string;
  admin_id: string;
  username: string;
  phone: string;
  password_hash: string;
  must_change_password: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  address: string;
  password_hash: string | null;
  shop_name: string | null;
  email: string | null;
  total_purchased: number;
  total_paid: number;
  due: number;
  status: CustomerStatus;
  created_at: string;
}

export interface Inventory {
  id: string;
  variant: string;
  color: string;
  suta_count: number;
  qty_than: number;
  buying_price_per_than: number;
  dying_cost_per_than: number;
  selling_price_per_than: number;
  location: string;
  display: boolean;
  created_at: string;
}

export interface InventoryImage {
  id: string;
  inventory_id: string;
  image_url: string;
  created_at: string;
}

export interface InventoryRestockLog {
  id: string;
  inventory_id: string;
  qty_added_than: number;
  buying_price_per_than: number;
  dying_cost_per_than: number;
  total_cost: number;
  paid_amount: number;
  due_amount: number;
  supplier_name: string | null;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_id: string;
  order_source: OrderSource;
  status: OrderStatus;
  total_than: number;
  total_amount: number;
  note: string | null;
  confirmed_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_id: string;
  variant: string;
  color: string;
  suta_count: number;
  qty_than: number;
  rate_per_than: number;
  total_amount: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string;
  note: string | null;
  created_at: string;
}

export interface CustomerPayment {
  id: string;
  customer_id: string;
  order_id: string | null;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  recorded_by: string;
  created_at: string;
}

export interface Payable {
  id: string;
  payable_id: string;
  description: string;
  party_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: PayableStatus;
  inventory_id: string | null;
  restock_log_id: string | null;
  created_at: string;
}

export interface PayablePayment {
  id: string;
  payable_id: string;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  recorded_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  inventory_id: string | null;
  note: string | null;
  created_at: string;
}

export interface ColorSlip {
  id: string;
  slip_id: string;
  inventory_id: string | null;
  variant: string;
  total_qty_than: number;
  colors: string;
  ratio: string;
  note: string | null;
  created_at: string;
}

export interface CashMemo {
  id: string;
  memo_id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  generated_by: string;
  created_at: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  phone: string;
  address: string;
  updated_at: string;
}

// Admin session JWT payload
export interface AdminSessionPayload {
  sub: string; // admin.id
  admin_id: string;
  username: string;
  role: "admin";
  must_change_password: boolean;
}
