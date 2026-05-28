"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, ShoppingCart, CheckCircle, ShoppingBag } from "lucide-react";
import type { ShoppingItem, ShoppingList as ShoppingListType, UnitKey } from "@/lib/shopping/types";
import {
  getOrCreateTeamList,
  listItems,
  addItem as addItemToList,
  updateItem,
  removeItem,
  cycleStatus,
} from "@/lib/shopping/service";
import { lineTotal, displayUnitLabel } from "@/lib/shopping/priceMath";
import { AddItemForm } from "./AddItemForm";
import { EditItemModal } from "./EditItemModal";
import { BudgetBar } from "./BudgetBar";

const TEAM_ID = process.env.NEXT_PUBLIC_SHOPPING_TEAM_ID || "supercrown-team";

const statusIcon = {
  pending: <span className="w-5 h-5 rounded-full border-2 border-stone/40 flex-shrink-0" />,
  in_cart: <ShoppingCart className="w-5 h-5 text-terracotta flex-shrink-0" />,
  purchased: <CheckCircle className="w-5 h-5 text-olive flex-shrink-0" />,
};

const statusBg = {
  pending: "",
  in_cart: "bg-terracotta/5",
  purchased: "opacity-50",
};

function fmt(n: number, currency = "USD") {
  if (n === 0) return "";
  return n.toLocaleString("en-US", { style: "currency", currency, minimumFractionDigits: 2 });
}

type GroupedItems = Record<string, ShoppingItem[]>;

function groupByCategory(items: ShoppingItem[]): GroupedItems {
  return items.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as GroupedItems);
}

export function ShoppingList() {
  const { data: session } = useSession();
  const [list, setList] = useState<(ShoppingListType & { id: string }) | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null);

  const userId = session?.user?.id || "anonymous";

  const loadData = useCallback(async () => {
    try {
      const l = await getOrCreateTeamList(TEAM_ID, userId);
      setList(l);
      const is = await listItems(l.id!);
      setItems(is);
    } catch (err) {
      setError("Could not load shopping list. Check your Firebase configuration.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (itemData: {
    name: string;
    qty: number;
    unit: UnitKey;
    category: string;
    note?: string;
    unitPrice?: number | null;
  }) => {
    if (!list) return;
    const id = await addItemToList(list.id!, {
      ...itemData,
      status: "pending",
      priceMode: itemData.unitPrice != null ? "unit" : undefined,
    });
    setItems((prev) => [
      ...prev,
      { ...itemData, id, listId: list.id!, status: "pending", priceMode: itemData.unitPrice != null ? "unit" : undefined },
    ]);
  };

  const handleCycleStatus = async (item: ShoppingItem) => {
    const next = cycleStatus(item.status);
    await updateItem(item.id, { status: next });
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: next } : i));
  };

  const handleUpdate = async (itemId: string, patch: Partial<ShoppingItem>) => {
    await updateItem(itemId, patch);
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, ...patch } : i));
  };

  const handleDelete = async (itemId: string) => {
    await removeItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 text-sm">{error}</p>
        <button type="button" onClick={loadData} className="mt-3 text-terracotta text-sm hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const activeItems = items.filter((i) => i.status !== "purchased");
  const purchasedItems = items.filter((i) => i.status === "purchased");
  const groups = groupByCategory(activeItems);

  return (
    <div className="space-y-4">
      <BudgetBar items={items} budgetLimit={list?.budgetLimit} currency={list?.currency} />

      <AddItemForm onAdd={handleAdd} />

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-stone/40" />
          <p>No items yet. Add something to get started.</p>
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([category, catItems]) => (
            <div key={category} className="bg-cream border border-stone/20 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-warm/50 border-b border-stone/15">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">{category}</p>
              </div>
              <div className="divide-y divide-stone/10">
                {catItems.map((item) => {
                  const total = lineTotal(item);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${statusBg[item.status]}`}
                    >
                      <button type="button" onClick={() => handleCycleStatus(item)} className="flex-shrink-0" aria-label="Cycle status">
                        {statusIcon[item.status]}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">{item.name}</p>
                        <p className="text-xs text-muted">
                          {item.qty} {displayUnitLabel(item.unit ?? "u", item.packSize)}
                          {item.note && ` · ${item.note}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {total > 0 && <p className="text-sm font-medium text-dark">{fmt(total, list?.currency)}</p>}
                        {item.unitPrice != null && item.unitPrice > 0 && (
                          <p className="text-xs text-muted">{fmt(item.unitPrice, list?.currency)}/{displayUnitLabel(item.unit ?? "u")}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditItem(item)}
                        className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-warm transition-colors flex-shrink-0 text-xs"
                        aria-label="Edit item"
                      >
                        ···
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {purchasedItems.length > 0 && (
            <div className="bg-cream border border-stone/20 rounded-xl overflow-hidden opacity-60">
              <div className="px-4 py-2 bg-warm/50 border-b border-stone/15">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">
                  Purchased ({purchasedItems.length})
                </p>
              </div>
              <div className="divide-y divide-stone/10">
                {purchasedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <button type="button" onClick={() => handleCycleStatus(item)} className="flex-shrink-0">
                      {statusIcon[item.status]}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted line-through truncate">{item.name}</p>
                    </div>
                    {lineTotal(item) > 0 && (
                      <p className="text-sm text-muted">{fmt(lineTotal(item), list?.currency)}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditItem(item)}
                      className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-warm transition-colors text-xs"
                    >
                      ···
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onSave={(patch) => handleUpdate(editItem.id, patch)}
          onDelete={() => handleDelete(editItem.id)}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
