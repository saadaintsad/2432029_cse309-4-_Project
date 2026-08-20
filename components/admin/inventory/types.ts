export interface InventoryImageRow {
  id: string;
  image_url: string;
}

export interface AdminInventoryItem {
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
  inventory_images: InventoryImageRow[];
}
