"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import type { MenuItem } from "@/lib/menu";
import { getMenuBySubcategory } from "@/lib/menu";
import { getImagePath } from "@/lib/menuImageMap";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ProductModal } from "@/components/ui/ProductModal";
import { useScrollReveal } from "@/lib/useScrollReveal";

export function MenuPreviewWithModal({ showAll = false }: { showAll?: boolean }) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const items = (data as Array<Record<string, unknown>>).map((p) => ({
          id:               String(p.id),
          name:             String(p.name),
          category:         String(p.category),
          subcategory:      String(p.subcategory ?? ""),
          description:      String(p.description ?? ""),
          shortDescription: String(p.shortDescription ?? ""),
          ingredients:      safeParseArray(String(p.ingredients ?? "[]")),
          calories:         Number(p.calories ?? 0),
          allergens:        safeParseArray(String(p.allergens ?? "[]")),
          isPopular:        Boolean(p.isPopular),
          isVegetarian:     Boolean(p.isVegetarian),
          imagePlaceholder: String(p.imagePlaceholder ?? "#C9A07A"),
          imageUrl:         p.imageUrl ? String(p.imageUrl) : null,
          galleryUrls:      safeParseArray(String(p.galleryUrls ?? "[]")),
          isAvailable:      Boolean(p.isAvailable ?? true),
          sortOrder:        Number(p.sortOrder ?? 0),
          review: {
            text:   String(p.reviewText   ?? ""),
            author: String(p.reviewAuthor ?? ""),
            rating: Number(p.reviewRating ?? 5),
          },
        })) as MenuItem[];
        setMenuItems(items.filter((i) => i.isAvailable));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups   = getMenuBySubcategory(menuItems);
  const popular  = menuItems.filter((i) => i.isPopular);
  const fallback = groups.flatMap((g) => g.items.slice(0, 2));
  const toShow   = showAll
    ? menuItems
    : (popular.length >= 4 ? popular : [...popular, ...fallback])
        .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
        .slice(0, 6);

  return (
    <section id="menu" className="bg-cream py-20 md:py-28 px-4 sm:px-6 md:px-20 scroll-mt-24 w-full">
      <div className="max-w-7xl mx-auto w-full">
        <SectionHeader
          label="Fresh selections"
          title="Popular menu items"
          subtitle="Click on any product to see details and add it to your quote."
        />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-terracotta" /></div>
        ) : (
          <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toShow.map((item) => {
              const imagePath = item.imageUrl || getImagePath(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="bg-cream rounded-2xl border border-stone/20 text-left overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePath} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: item.imagePlaceholder }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {item.isPopular    && <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cream/95 text-terracotta shadow-sm">Popular</span>}
                      {item.isVegetarian && <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cream/95 text-olive shadow-sm">Vegetarian</span>}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-terracotta/10 text-terracotta mb-3">{item.category}</span>
                    <h4 className="font-display text-xl text-dark mb-2 leading-tight">{item.name}</h4>
                    <p className="text-muted text-sm line-clamp-2 mb-3">{item.shortDescription}</p>
                    <span className="inline-flex items-center gap-1.5 text-terracotta text-sm font-medium">
                      View details
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-14 flex justify-center">
          <Link href="/menu">
            <Button variant="outline" className="group gap-2">
              View full menu
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}

function safeParseArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
