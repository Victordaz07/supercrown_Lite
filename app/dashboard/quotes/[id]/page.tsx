import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuoteStatusUpdater } from "./_components/QuoteStatusUpdater";

type PageProps = { params: Promise<{ id: string }> };

const statusColors: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  PRICING: "bg-blue-100 text-blue-800",
  SENT: "bg-purple-100 text-purple-800",
  CLIENT_APPROVED: "bg-olive/30 text-olive",
  CLIENT_REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-red-200 text-red-900",
};

export default async function QuoteDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!["MASTER", "ADMIN", "SALES"].includes(session.user.role)) redirect("/dashboard");

  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id } });

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted">Quote not found</p>
      </div>
    );
  }

  let items: Array<{ itemId?: string; name: string; category: string; quantity: number }> = [];
  try {
    const parsed = JSON.parse(quote.itemsJson);
    if (Array.isArray(parsed)) items = parsed;
  } catch { /* empty */ }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quotes" className="text-terracotta hover:underline text-sm">
          ← Back to Quotes
        </Link>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-dark">{quote.quoteNumber}</h1>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[quote.status] ?? "bg-stone/20 text-muted"}`}>
          {quote.status}
        </span>
      </div>

      <div className="bg-cream border border-stone/20 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-lg text-dark">Client info</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Name" value={quote.clientName} />
          <InfoRow label="Email" value={quote.clientEmail} />
          {quote.clientPhone && <InfoRow label="Phone" value={quote.clientPhone} />}
          <InfoRow label="Delivery address" value={quote.deliveryAddress} />
          <InfoRow label="Event date" value={quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : "TBD"} />
          {quote.guestCount && <InfoRow label="Guests" value={quote.guestCount} />}
          {quote.budget && <InfoRow label="Budget" value={quote.budget} />}
          {quote.typeOfService && <InfoRow label="Service type" value={quote.typeOfService} />}
        </div>
        {quote.eventDetails && (
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Event details</p>
            <p className="text-sm text-dark">{quote.eventDetails}</p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="bg-cream border border-stone/20 rounded-xl p-6">
          <h2 className="font-display text-lg text-dark mb-4">Requested items</h2>
          <div className="divide-y divide-stone/15">
            {items.map((item, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark">{item.name}</p>
                  <p className="text-xs text-muted uppercase">{item.category}</p>
                </div>
                <span className="text-sm text-dark font-medium">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-cream border border-stone/20 rounded-xl p-6">
        <h2 className="font-display text-lg text-dark mb-4">Update status</h2>
        <QuoteStatusUpdater quoteId={quote.id} currentStatus={quote.status} />
      </div>

      <p className="text-xs text-muted">
        Received {new Date(quote.createdAt).toLocaleString()} ·
        {quote.expiresAt && ` Expires ${new Date(quote.expiresAt).toLocaleDateString()}`}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-dark">{value}</p>
    </div>
  );
}
