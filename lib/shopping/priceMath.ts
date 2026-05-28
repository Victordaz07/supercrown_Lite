import type { ShoppingItem, UnitKey } from "./types";

export function unitMultiplier(unit: UnitKey, packSize?: number | null): number {
  switch (unit) {
    case "u": return 1;
    case "dozen": return 12;
    case "half_dozen": return 6;
    case "pack_4": return 4;
    case "pack_6": return 6;
    case "pack_12": return 12;
    case "pack": return packSize || 1;
    case "lb": return 1;
    case "kg": return 2.20462;
    case "g": return 0.00220462;
    case "oz": return 0.0625;
    case "L": return 1;
    case "gal": return 3.78541;
    default: return 1;
  }
}

export function displayUnitLabel(unit: UnitKey, packSize?: number | null): string {
  switch (unit) {
    case "u": return "unit";
    case "dozen": return "dozen";
    case "half_dozen": return "half dozen";
    case "pack_4": return "pack of 4";
    case "pack_6": return "pack of 6";
    case "pack_12": return "pack of 12";
    case "pack": return packSize ? `pack of ${packSize}` : "pack";
    case "lb": return "lb";
    case "kg": return "kg";
    case "g": return "g";
    case "oz": return "oz";
    case "L": return "L";
    case "gal": return "gal";
    default: return "unit";
  }
}

export function lineTotal(item: ShoppingItem): number {
  if (item.priceMode === "total" && item.totalPrice) return item.totalPrice;
  if (item.priceMode === "unit" && item.unitPrice) return item.unitPrice * item.qty;
  if (item.price) return item.price * item.qty;
  return 0;
}

export function atomicUnitPrice(item: ShoppingItem): { value: number; suffix: string } {
  const total = lineTotal(item);
  const qty = item.qty || 1;
  if (!total || !qty) return { value: 0, suffix: "" };

  const unit = item.unit || "u";
  const packSize = item.packSize;

  if (["pack", "pack_4", "pack_6", "pack_12", "dozen", "half_dozen"].includes(unit)) {
    const multiplier = unitMultiplier(unit as UnitKey, packSize);
    return { value: total / (qty * multiplier), suffix: "/u" };
  }

  const isWeight = ["lb", "kg", "g", "oz"].includes(unit);
  const isVolume = ["L", "gal"].includes(unit);

  if (isWeight || isVolume) return { value: total / qty, suffix: `/${unit}` };
  return { value: total / qty, suffix: "/u" };
}
