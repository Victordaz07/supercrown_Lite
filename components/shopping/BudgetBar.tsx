"use client";

import type { ShoppingItem } from "@/lib/shopping/types";
import { lineTotal } from "@/lib/shopping/priceMath";

interface BudgetBarProps {
  items: ShoppingItem[];
  budgetLimit?: number;
  currency?: string;
}

export function BudgetBar({ items, budgetLimit, currency = "USD" }: BudgetBarProps) {
  const purchased = items.filter((i) => i.status === "purchased");
  const estimated = items.reduce((s, i) => s + lineTotal(i), 0);
  const actual = purchased.reduce((s, i) => s + lineTotal(i), 0);
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency });

  const pct = budgetLimit && budgetLimit > 0 ? Math.min(100, (estimated / budgetLimit) * 100) : null;
  const barColor = pct === null ? "bg-terracotta" : pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-olive";

  return (
    <div className="bg-cream border border-stone/20 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Estimated</p>
            <p className="font-display text-lg text-dark">{fmt(estimated)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Purchased</p>
            <p className="font-display text-lg text-olive">{fmt(actual)}</p>
          </div>
          {budgetLimit && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Budget</p>
              <p className="font-display text-lg text-dark">{fmt(budgetLimit)}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">{items.length} items · {purchased.length} purchased</p>
        </div>
      </div>

      {pct !== null && (
        <div className="h-2 bg-stone/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
