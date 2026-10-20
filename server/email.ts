import { config } from "./config";
import { log } from "./log";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends through Resend (https://resend.com). Without RESEND_API_KEY it runs in
 * dry-run mode: the email is logged instead of sent, and reported as delivered.
 */
export async function sendEmail(email: Email): Promise<{ delivered: boolean; dryRun: boolean }> {
  if (!config.email.resendApiKey) {
    log(`[dry run] would email ${email.to}: "${email.subject}"`, "email");
    return { delivered: true, dryRun: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.email.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.email.from, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
  return { delivered: true, dryRun: false };
}
