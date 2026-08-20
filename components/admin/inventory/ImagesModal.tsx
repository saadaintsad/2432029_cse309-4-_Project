"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { AdminInventoryItem } from "./types";

interface ImagesModalProps {
  item: AdminInventoryItem | null;
  onClose: () => void;
  onChanged: () => void;
}

export function ImagesModal({ item, onClose, onChanged }: ImagesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !item) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/inventory/${item.id}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not upload image.");
        return;
      }
      onChanged();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!item) return;
    setError(null);
    setDeletingId(imageId);

    try {
      const res = await fetch(`/api/inventory/${item.id}/images/${imageId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not delete image.");
        return;
      }
      onChanged();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const images = item?.inventory_images ?? [];
  const atLimit = images.length >= 2;

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={item ? `Images — ${item.variant} (${item.color})` : "Images"}
    >
      {item && (
        <>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {images.length === 0 ? (
            <p className="mb-4 text-sm text-slate-500">No images uploaded yet.</p>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-md border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt="" className="h-32 w-full object-cover" />
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                    className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs text-red-600 hover:bg-white disabled:opacity-50"
                  >
                    {deletingId === img.id ? "…" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            loading={uploading}
            disabled={atLimit}
            onClick={() => fileInputRef.current?.click()}
          >
            {atLimit ? "Maximum 2 images reached" : "Upload PNG Image"}
          </Button>

          <div className="mt-4 flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
