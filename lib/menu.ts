export interface MenuItemReview {
  text: string;
  author: string;
  rating: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  ingredients: string[];
  shortDescription: string;
  calories: number;
  allergens: string[];
  isPopular: boolean;
  isVegetarian: boolean;
  imagePlaceholder: string;
  imageUrl?: string | null;
  galleryUrls?: string[];
  isAvailable?: boolean;
  sortOrder?: number;
  review: MenuItemReview;
}

export interface MenuGroup {
  subcategory: string;
  items: MenuItem[];
}

const subcategoryOrder = ["Sandwiches", "Snacks", "Salads"];

export function getMenuBySubcategory(items?: MenuItem[]): MenuGroup[] {
  const data = items ?? ([] as MenuItem[]);
  const bySubcategory = new Map<string, MenuItem[]>();
  for (const item of data) {
    const existing = bySubcategory.get(item.subcategory) ?? [];
    existing.push(item);
    bySubcategory.set(item.subcategory, existing);
  }
  return subcategoryOrder
    .filter((sub) => bySubcategory.has(sub))
    .map((sub) => ({ subcategory: sub, items: bySubcategory.get(sub) ?? [] }));
}
