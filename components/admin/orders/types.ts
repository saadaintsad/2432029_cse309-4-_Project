export interface OrderListRow {
  id: string;
  order_id: string;
  order_source: "ONLINE" | "OFFLINE";
  status: string;
  total_than: number;
  total_amount: number;
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  customers: { id: string; customer_id: string; name: string; phone: string } | null;
}

export interface OrderItemRow {
  id: string;
  variant: string;
  color: string;
  suta_count: number;
  qty_than: number;
  rate_per_than: number;
  total_amount: number;
}

export interface OrderStatusHistoryRow {
  id: string;
  status: string;
  changed_by: string;
  note: string | null;
  created_at: string;
}

export interface OrderDetail {
  id: string;
  order_id: string;
  order_source: "ONLINE" | "OFFLINE";
  status: string;
  total_than: number;
  total_amount: number;
  note: string | null;
  confirmed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  customers: {
    id: string;
    customer_id: string;
    name: string;
    phone: string;
    address: string;
    shop_name: string | null;
  };
}
