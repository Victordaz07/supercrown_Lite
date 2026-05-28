export interface ProductReview {
  text: string;
  author: string;
  rating: number;
}

export interface Product {
  id: string;
  slug?: string;
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
  isAvailable: boolean;
  sortOrder: number;
  review: ProductReview;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductCreateInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string };
export type ProductUpdateInput = Partial<Omit<Product, "id" | "createdAt">>;
