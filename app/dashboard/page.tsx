import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const statusColors: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  PRICING: "bg-blue-100 text-blue-800",
  SENT: "bg-purple-100 text-purple-800",
  CLIENT_APPROVED: "bg-olive/30 text-olive",
  CLIENT_REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-red-200 text-red-900",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!["MASTER", "ADMIN", "SALES"].includes(session.user.role)) redirect("/");

  const [totalProducts, totalQuotes, recentQuotes] = await Promise.all([
    prisma.product.count({ where: { isAvailable: true } }),
    prisma.quote.count(),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const quotesByStatus = await prisma.quote.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statusMap = Object.fromEntries(quotesByStatus.map((s) => [s.status, s._count.status]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-dark mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Welcome back, {session.user.name || session.user.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cream rounded-xl border border-stone/20 p-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Active products</p>
          <p className="font-display text-3xl text-dark">{totalProducts}</p>
        </div>
        <div className="bg-cream rounded-xl border border-stone/20 p-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Total quotes</p>
          <p className="font-display text-3xl text-dark">{totalQuotes}</p>
        </div>
        <div className="bg-cream rounded-xl border border-stone/20 p-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Pending review</p>
          <p className="font-display text-3xl text-terracotta">{statusMap["REQUESTED"] ?? 0}</p>
        </div>
        <div className="bg-cream rounded-xl border border-stone/20 p-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Approved</p>
          <p className="font-display text-3xl text-olive">{statusMap["CLIENT_APPROVED"] ?? 0}</p>
        </div>
      </div>

      <div className="bg-cream rounded-xl border border-stone/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-dark">Recent quotes</h2>
          <Link href="/dashboard/quotes" className="text-terracotta text-sm hover:underline">View all →</Link>
        </div>
        {recentQuotes.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">No quotes yet</p>
        ) : (
          <div className="divide-y divide-stone/15">
            {recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/quotes/${q.id}`}
                className="flex items-center justify-between py-3 hover:bg-warm/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-dark">{q.clientName}</p>
                  <p className="text-xs text-muted">{q.clientEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{new Date(q.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${statusColors[q.status] ?? "bg-stone/20 text-muted"}`}>
                    {q.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
