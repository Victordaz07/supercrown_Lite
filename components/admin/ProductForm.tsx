"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import type { Product } from "@/lib/product-types";

interface ProductFormProps {
  product?: Product | null;
}

const CATEGORIES = ["Box Lunch", "Grab-N-Go"];
const SUBCATEGORIES = ["Sandwiches", "Snacks", "Salads", "Beverages", "Desserts"];
const ALLERGENS = ["gluten", "dairy", "fish", "egg", "tree nuts", "peanuts"];

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "Box Lunch",
    subcategory: product?.subcategory ?? "Sandwiches",
    description: product?.description ?? "",
    shortDescription: product?.shortDescription ?? "",
    ingredients: product?.ingredients?.join(", ") ?? "",
    calories: product?.calories ?? 0,
    allergens: product?.allergens ?? [],
    isPopular: product?.isPopular ?? false,
    isVegetarian: product?.isVegetarian ?? false,
    imagePlaceholder: product?.imagePlaceholder ?? "#C9A07A",
    isAvailable: product?.isAvailable ?? true,
    reviewText: product?.review?.text ?? "",
    reviewAuthor: product?.review?.author ?? "",
    reviewRating: product?.review?.rating ?? 5,
  });

  const toggleAllergen = (a: string) => {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(a)
        ? prev.allergens.filter((x) => x !== a)
        : [...prev.allergens, a],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        description: form.description,
        shortDescription: form.shortDescription || form.name,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        calories: Number(form.calories) || 0,
        allergens: form.allergens,
        isPopular: form.isPopular,
        isVegetarian: form.isVegetarian,
        imagePlaceholder: form.imagePlaceholder,
        isAvailable: form.isAvailable,
        reviewText: form.reviewText,
        reviewAuthor: form.reviewAuthor,
        reviewRating: Math.min(5, Math.max(1, form.reviewRating)),
      };

      if (isEdit && product) {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error updating");
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error creating");
        }
      }
      router.push("/dashboard/admin/products");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/products/${product.id}/image`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Error uploading");
      router.refresh();
    } catch {
      alert("Error uploading image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-cream border border-stone/20 rounded-xl p-6">
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          className="w-full px-4 py-2 border border-stone/40 rounded-lg focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Subcategory</label>
          <select value={form.subcategory} onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none">
            {SUBCATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">Description</label>
        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">Short description</label>
        <input type="text" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} placeholder="For the product card" className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">Ingredients (comma separated)</label>
        <input type="text" value={form.ingredients} onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">Calories</label>
        <input type="number" value={form.calories || ""} onChange={(e) => setForm((p) => ({ ...p, calories: Number(e.target.value) || 0 }))} min={0} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-2">Allergens</label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <button key={a} type="button" onClick={() => toggleAllergen(a)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${form.allergens.includes(a) ? "bg-terracotta/20 text-terracotta" : "bg-stone/20 text-muted hover:bg-stone/30"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))} className="rounded border-stone" />
          <span className="text-sm">Popular</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isVegetarian} onChange={(e) => setForm((p) => ({ ...p, isVegetarian: e.target.checked }))} className="rounded border-stone" />
          <span className="text-sm">Vegetarian</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))} className="rounded border-stone" />
          <span className="text-sm">Available</span>
        </label>
      </div>

      <div className="border-t border-stone/20 pt-6">
        <h3 className="font-display text-lg text-dark mb-4">Featured review</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Review text</label>
            <textarea value={form.reviewText} onChange={(e) => setForm((p) => ({ ...p, reviewText: e.target.value }))} rows={2} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Author</label>
              <input type="text" value={form.reviewAuthor} onChange={(e) => setForm((p) => ({ ...p, reviewAuthor: e.target.value }))} placeholder="E.g.: Maria G." className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Stars (1–5)</label>
              <input type="number" value={form.reviewRating} onChange={(e) => setForm((p) => ({ ...p, reviewRating: Number(e.target.value) || 5 }))} min={1} max={5} className="w-full px-4 py-2 border border-stone/40 rounded-lg outline-none" />
            </div>
          </div>
        </div>
      </div>

      {isEdit && product && (
        <div id="upload" className="border-t border-stone/20 pt-6">
          <h3 className="font-display text-lg text-dark mb-3">Upload image</h3>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone/20 rounded-lg hover:bg-stone/30 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Select image"}
          </button>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 disabled:opacity-50 flex items-center gap-2 transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2 border border-stone/40 rounded-lg hover:bg-stone/20 transition-colors flex items-center gap-2 text-muted hover:text-dark">
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
