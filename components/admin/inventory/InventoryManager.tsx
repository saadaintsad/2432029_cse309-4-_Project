"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { AddItemModal } from "./AddItemModal";
import { EditItemModal } from "./EditItemModal";
import { RestockModal } from "./RestockModal";
import { ImagesModal } from "./ImagesModal";
import type { AdminInventoryItem } from "./types";

export function InventoryManager() {
  const [items, setItems] = useState<AdminInventoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [variantFilter, setVariantFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminInventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<AdminInventoryItem | null>(null);
  const [imagesItem, setImagesItem] = useState<AdminInventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdminInventoryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (variantFilter) params.set("variant", variantFilter);
    if (colorFilter) params.set("color", colorFilter);
    if (locationFilter) params.set("location", locationFilter);

    try {
      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load inventory.");
        return;
      }
      setItems(data.inventory);
    } catch {
      setError("Network error while loading inventory.");
    }
  }, [variantFilter, colorFilter, locationFilter]);

  useEffect(() => {
    const timeout = setTimeout(loadItems, 250);
    return () => clearTimeout(timeout);
  }, [loadItems]);

  // Keep modal-selected items in sync after a refetch (e.g. after restock/edit).
  function refreshSelections(freshItems: AdminInventoryItem[]) {
    setEditingItem((prev) => (prev ? freshItems.find((i) => i.id === prev.id) ?? null : null));
    setRestockingItem((prev) => (prev ? freshItems.find((i) => i.id === prev.id) ?? null : null));
    setImagesItem((prev) => (prev ? freshItems.find((i) => i.id === prev.id) ?? null : null));
  }

  async function handleRefetchAndSync() {
    await loadItems();
  }

  useEffect(() => {
    if (items) refreshSelections(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  async function handleToggleDisplay(item: AdminInventoryItem) {
    setError(null);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display: !item.display }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update display setting.");
        return;
      }
      loadItems();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory/${deletingItem.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "Could not delete item.");
        return;
      }
      setDeletingItem(null);
      loadItems();
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Inventory</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Item</Button>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Variant"
            placeholder="Search by variant"
            value={variantFilter}
            onChange={(e) => setVariantFilter(e.target.value)}
          />
          <Input
            label="Color"
            placeholder="Search by color"
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="Showroom / Warehouse"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-0">
        {items === null ? (
          <p className="p-6 text-sm text-slate-500">Loading inventory…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No inventory items match your search. Try adjusting filters or add a
            new item.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">Color</th>
                  <th className="px-4 py-3 font-medium">Suta</th>
                  <th className="px-4 py-3 font-medium">Qty (Than)</th>
                  <th className="px-4 py-3 font-medium">Buying</th>
                  <th className="px-4 py-3 font-medium">Dying</th>
                  <th className="px-4 py-3 font-medium">Selling</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Images</th>
                  <th className="px-4 py-3 font-medium">Display</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.variant}</td>
                    <td className="px-4 py-3">{item.color}</td>
                    <td className="px-4 py-3">{item.suta_count}</td>
                    <td className="px-4 py-3">
                      <span className={item.qty_than <= 0 ? "text-red-600" : ""}>
                        {item.qty_than}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(item.buying_price_per_than)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.dying_cost_per_than)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.selling_price_per_than)}</td>
                    <td className="px-4 py-3">{item.location}</td>
                    <td className="px-4 py-3">{item.inventory_images.length}/2</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleDisplay(item)}
                        className={
                          item.display
                            ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {item.display ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="text-amber-700 hover:underline"
                          onClick={() => setEditingItem(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-amber-700 hover:underline"
                          onClick={() => setRestockingItem(item)}
                        >
                          Restock
                        </button>
                        <button
                          className="text-amber-700 hover:underline"
                          onClick={() => setImagesItem(item)}
                        >
                          Images
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingItem(item);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleRefetchAndSync}
      />
      <EditItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onUpdated={handleRefetchAndSync}
      />
      <RestockModal
        item={restockingItem}
        onClose={() => setRestockingItem(null)}
        onRestocked={handleRefetchAndSync}
      />
      <ImagesModal
        item={imagesItem}
        onClose={() => setImagesItem(null)}
        onChanged={handleRefetchAndSync}
      />

      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Delete Inventory Item"
      >
        {deletingItem && (
          <>
            <p className="mb-4 text-sm text-slate-600">
              Delete <span className="font-medium">{deletingItem.variant} — {deletingItem.color}</span>{" "}
              (suta {deletingItem.suta_count})? This cannot be undone.
            </p>
            {deleteError && (
              <Alert variant="error" className="mb-4">
                {deleteError}
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" loading={deleting} onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
