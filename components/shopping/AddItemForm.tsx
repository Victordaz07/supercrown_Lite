"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import type { UnitKey } from "@/lib/shopping/types";

const UNITS: { value: UnitKey; label: string }[] = [
  { value: "u", label: "units" },
  { value: "dozen", label: "dozen" },
  { value: "half_dozen", label: "half dozen" },
  { value: "lb", label: "lb" },
  { value: "kg", label: "kg" },
  { value: "oz", label: "oz" },
  { value: "L", label: "L" },
  { value: "pack_4", label: "pack of 4" },
  { value: "pack_6", label: "pack of 6" },
  { value: "pack_12", label: "pack of 12" },
];

const CATEGORIES = ["Produce", "Dairy", "Meat", "Bakery", "Dry goods", "Beverages", "Supplies", "Other"];

interface AddItemFormProps {
  onAdd: (item: {
    name: string;
    qty: number;
    unit: UnitKey;
    category: string;
    note?: string;
    unitPrice?: number | null;
  }) => Promise<void>;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    qty: 1,
    unit: "u" as UnitKey,
    category: "Other",
    note: "",
    unitPrice: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        name: form.name.trim(),
        qty: Number(form.qty) || 1,
        unit: form.unit,
        category: form.category,
        note: form.note.trim() || undefined,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
      });
      setForm({ name: "", qty: 1, unit: "u", category: "Other", note: "", unitPrice: "" });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-stone/30 rounded-xl text-muted hover:border-terracotta/40 hover:text-terracotta transition-all"
      >
        <Plus className="w-4 h-4" />
        Add item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream border border-stone/20 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Item name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            autoFocus
            placeholder="e.g. Chicken breast"
            className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Quantity</label>
          <input
            type="number"
            value={form.qty}
            onChange={(e) => setForm((p) => ({ ...p, qty: Number(e.target.value) || 1 }))}
            min={0.01}
            step="any"
            className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none focus:ring-2 focus:ring-terracotta/30"
          />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Unit</label>
          <select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value as UnitKey }))} className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none">
            {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Unit price (optional)</label>
          <input
            type="number"
            value={form.unitPrice}
            onChange={(e) => setForm((p) => ({ ...p, unitPrice: e.target.value }))}
            min={0}
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none focus:ring-2 focus:ring-terracotta/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Note</label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            placeholder="Brand, store, details..."
            className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-stone/40 rounded-lg text-sm text-muted hover:text-dark hover:border-stone/60 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
