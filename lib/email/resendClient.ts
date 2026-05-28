import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[Resend] RESEND_API_KEY not set — emails disabled");
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL ?? "noreply@supercrowncatering.com";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@supercrowncatering.com";

export const SITE_URL =
  process.env.NEXTAUTH_URL ?? "http://localhost:3000";
