"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

const STATUSES = ["REQUESTED", "PRICING", "SENT", "CLIENT_APPROVED", "CLIENT_REJECTED", "EXPIRED"] as const;

interface Props {
  quoteId: string;
  currentStatus: string;
}

export function QuoteStatusUpdater({ quoteId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (status === currentStatus) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="flex-1 px-4 py-2 border border-stone/40 rounded-lg outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="px-4 py-2 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? "Saved" : "Update"}
      </button>
    </div>
  );
}
