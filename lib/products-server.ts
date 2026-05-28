import { prisma } from "@/lib/db";
import type { Product } from "@/lib/product-types";

export async function getProducts(includeUnavailable = false): Promise<Product[]> {
  const raw = await prisma.product.findMany({
    where: includeUnavailable ? {} : { isAvailable: true },
    orderBy: [{ subcategory: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return raw.map((p) => ({
    id:               p.id,
    slug:             p.slug,
    name:             p.name,
    category:         p.category,
    subcategory:      p.subcategory,
    description:      p.description,
    shortDescription: p.shortDescription,
    ingredients:      safeParseArray(p.ingredients),
    calories:         p.calories,
    allergens:        safeParseArray(p.allergens),
    isPopular:        p.isPopular,
    isVegetarian:     p.isVegetarian,
    imagePlaceholder: p.imagePlaceholder,
    imageUrl:         p.imageUrl,
    galleryUrls:      safeParseArray(p.galleryUrls),
    isAvailable:      p.isAvailable,
    sortOrder:        p.sortOrder,
    review: {
      text:   p.reviewText   ?? "",
      author: p.reviewAuthor ?? "",
      rating: p.reviewRating,
    },
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

function safeParseArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
