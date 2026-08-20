"use client";

import { useEffect, useState, FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ShopDetailsSection() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [aboutUs, setAboutUs] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error ?? "Could not load shop details.");
          return;
        }
        setShopName(json.settings.shop_name);
        setPhone(json.settings.phone);
        setAddress(json.settings.address);
        setOwnerName(json.settings.owner_name);
        setAboutUs(json.settings.about_us);
      })
      .catch(() => setError("Network error while loading shop details."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_name: shopName,
          phone,
          address,
          owner_name: ownerName,
          about_us: aboutUs,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not save shop details.");
        return;
      }

      setShopName(data.settings.shop_name);
      setPhone(data.settings.phone);
      setAddress(data.settings.address);
      setOwnerName(data.settings.owner_name);
      setAboutUs(data.settings.about_us);
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function markDirty() {
    setSuccess(false);
  }

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-slate-900">Shop Details</h2>
      <p className="mb-4 text-xs text-slate-500">
        Used throughout the app, including the landing page, the About Us modal,
        and generated PDFs.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">Shop details updated.</Alert>}

          <Input
            label="Shop Name"
            required
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value);
              markDirty();
            }}
          />
          <Input
            label="Owner Name"
            required
            value={ownerName}
            onChange={(e) => {
              setOwnerName(e.target.value);
              markDirty();
            }}
          />
          <Input
            label="Phone Number"
            required
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              markDirty();
            }}
          />
          <Input
            label="Address"
            required
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              markDirty();
            }}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">About Us</label>
            <textarea
              required
              rows={4}
              value={aboutUs}
              onChange={(e) => {
                setAboutUs(e.target.value);
                markDirty();
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/30"
            />
            <p className="text-xs text-slate-500">
              Shown in the About Us modal on the customer landing page.
            </p>
          </div>
          <Button type="submit" loading={submitting} className="w-fit">
            Save Shop Details
          </Button>
        </form>
      )}
    </Card>
  );
}
