import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["MASTER", "ADMIN"].includes(session.user.role)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/products" className="text-terracotta hover:underline text-sm">
          ← Back to Products
        </Link>
      </div>
      <h1 className="font-display text-2xl text-dark">New Product</h1>
      <ProductForm />
    </div>
  );
}
