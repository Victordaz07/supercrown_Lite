import { resend, EMAIL_FROM, ADMIN_EMAIL, SITE_URL } from "./resendClient";

interface NewQuotePayload {
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  eventDate: string;
}

export async function notifyAdminNewQuote(payload: NewQuotePayload) {
  if (!resend) {
    console.log("[Email] Simulated — new quote:", payload.quoteNumber);
    return;
  }
  await resend.emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    replyTo: payload.clientEmail,
    subject: `[${payload.quoteNumber}] New quote from ${payload.clientName} — ${payload.eventDate}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#2A2520">New Quote Request</h2>
        <p><strong>Client:</strong> ${payload.clientName} (${payload.clientEmail})</p>
        <p><strong>Event date:</strong> ${payload.eventDate}</p>
        <p><strong>Quote #:</strong> ${payload.quoteNumber}</p>
        <a href="${SITE_URL}/dashboard/quotes/${payload.quoteId}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#B5612A;color:#fff;border-radius:8px;text-decoration:none">
          View in Dashboard
        </a>
      </div>
    `,
  });
}
