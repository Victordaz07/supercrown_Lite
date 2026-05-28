import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ShoppingList } from "@/components/shopping/ShoppingList";

export default async function ShoppingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!["MASTER", "ADMIN", "SALES"].includes(session.user.role)) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-dark mb-1">Shopping</h1>
        <p className="text-sm text-muted">Team ingredient and supply tracking</p>
      </div>
      <ShoppingList />
    </div>
  );
}
