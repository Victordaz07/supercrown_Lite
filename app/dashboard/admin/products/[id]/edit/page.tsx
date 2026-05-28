import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/product-types";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !["MASTER", "ADMIN"].includes(session.user.role)) redirect("/dashboard");

  const { id } = await params;
  const raw = await prisma.product.findUnique({ where: { id } });
  if (!raw) notFound();

  const product: Product = {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    category: raw.category,
    subcategory: raw.subcategory,
    description: raw.description,
    shortDescription: raw.shortDescription,
    ingredients: safeParseArray(raw.ingredients),
    calories: raw.calories,
    allergens: safeParseArray(raw.allergens),
    isPopular: raw.isPopular,
    isVegetarian: raw.isVegetarian,
    isAvailable: raw.isAvailable,
    imagePlaceholder: raw.imagePlaceholder,
    imageUrl: raw.imageUrl,
    galleryUrls: safeParseArray(raw.galleryUrls),
    sortOrder: raw.sortOrder,
    review: {
      text: raw.reviewText ?? "",
      author: raw.reviewAuthor ?? "",
      rating: raw.reviewRating,
    },
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/products" className="text-terracotta hover:underline text-sm">
          ← Back to Products
        </Link>
      </div>
      <h1 className="font-display text-2xl text-dark">Edit: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}

function safeParseArray(json: string): string[] {
  try {
    const p = JSON.parse(json);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}
