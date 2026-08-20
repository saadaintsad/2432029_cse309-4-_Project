"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface LandingImage {
  id: string;
  image_url: string;
  display_order: number;
}

export function LandingImagesSection() {
  const [images, setImages] = useState<LandingImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/landing-images");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load landing images.");
        return;
      }
      setImages(data.images);
    } catch {
      setError("Network error while loading landing images.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/landing-images", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not upload image.");
        return;
      }
      load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/landing-images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete image.");
        return;
      }
      load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-slate-900">Landing Page Images</h2>
      <p className="mb-4 text-xs text-slate-500">
        Shown on the customer landing page. If none are uploaded, the landing
        page falls back to random inventory photos.
      </p>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {images === null ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : images.length === 0 ? (
        <p className="mb-4 text-sm text-slate-500">No landing images uploaded yet.</p>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="relative overflow-hidden rounded-md border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="aspect-square w-full object-cover" />
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
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        loading={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Image
      </Button>
    </Card>
  );
}
