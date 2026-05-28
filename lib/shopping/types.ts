export type PriceMode = "unit" | "total";
export type UnitKey = "u" | "dozen" | "half_dozen" | "pack" | "pack_4" | "pack_6" | "pack_12" | "lb" | "kg" | "g" | "oz" | "L" | "gal";
export type ShoppingStatus = "pending" | "in_cart" | "purchased";

export type ShoppingStore = {
  id: string;
  name: string;
  address?: string;
  color?: string;
  isFavorite?: boolean;
  budgetLimit?: number;
};

export type ShoppingItem = {
  id: string;
  listId: string;
  name: string;
  qty: number;
  unit?: UnitKey;
  packSize?: number | null;
  category?: string;
  note?: string;
  status: ShoppingStatus;
  storeId?: string;
  createdAt?: number;
  updatedAt?: number;
  priceMode?: PriceMode;
  unitPrice?: number | null;
  totalPrice?: number | null;
  price?: number;
};

export type ShoppingList = {
  id?: string;
  teamId: string;
  title: string;
  stores: ShoppingStore[];
  currency: string;
  budgetLimit?: number;
  createdBy: string;
  createdAt?: number;
  updatedAt?: number;
};
