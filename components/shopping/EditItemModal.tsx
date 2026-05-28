"use client";

import { useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import type { ShoppingItem, UnitKey } from "@/lib/shopping/types";
import { displayUnitLabel } from "@/lib/shopping/priceMath";

const UNITS: UnitKey[] = ["u", "dozen", "half_dozen", "lb", "kg", "oz", "L", "pack_4", "pack_6", "pack_12"];
const CATEGORIES = ["Produce", "Dairy", "Meat", "Bakery", "Dry goods", "Beverages", "Supplies", "Other"];

interface EditItemModalProps {
  item: ShoppingItem;
  onSave: (patch: Partial<ShoppingItem>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function EditItemModal({ item, onSave, onDelete, onClose }: EditItemModalProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    qty: item.qty,
    unit: item.unit ?? "u" as UnitKey,
    category: item.category ?? "Other",
    note: item.note ?? "",
    unitPrice: item.unitPrice != null ? String(item.unitPrice) : "",
    priceMode: item.priceMode ?? "unit",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const unitPriceVal = form.unitPrice ? Number(form.unitPrice) : null;
      await onSave({
        name: form.name.trim(),
        qty: Number(form.qty) || 1,
        unit: form.unit as UnitKey,
        category: form.category,
        note: form.note.trim() || undefined,
        unitPrice: unitPriceVal,
        priceMode: unitPriceVal != null ? "unit" : item.priceMode,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this item from the list?")) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md border border-stone/20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone/15">
          <h2 className="font-display text-lg text-dark">Edit item</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-warm transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none focus:ring-2 focus:ring-terracotta/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1">Quantity</label>
              <input
                type="number"
                value={form.qty}
                onChange={(e) => setForm((p) => ({ ...p, qty: Number(e.target.value) || 1 }))}
                min={0.01}
                step="any"
                className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value as UnitKey }))} className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none">
                {UNITS.map((u) => <option key={u} value={u}>{displayUnitLabel(u)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1">Unit price</label>
              <input
                type="number"
                value={form.unitPrice}
                onChange={(e) => setForm((p) => ({ ...p, unitPrice: e.target.value }))}
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">Note</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="Brand, store, details..."
              className="w-full px-3 py-2 border border-stone/40 rounded-lg text-sm outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
