import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, parseProjectEnquiryPayload, toLeadEnvelope } from "@/lib/enquiry";
import { checkRequestRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 250_000;
const TO = process.env.ROOFHUB_INQUIRY_TO || "";
const FROM = process.env.ROOFHUB_FROM_EMAIL || "RoofHub <onboarding@resend.dev>";

function text(value: unknown, max = 4000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}

async function sendEmail(subject: string, replyTo: string, html: string, plain: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !TO) throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: replyTo, subject, html, text: plain })
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
  return response.json() as Promise<{ id?: string }>;
}

function rateLimited(retryAfterSeconds: number) {
  return NextResponse.json(
    { ok: false, error: "Too many enquiry attempts. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export async function POST(request: NextRequest) {
  const limit = checkRequestRateLimit(request, { namespace: "enquiry", limit: 12, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("host");
  if (origin && requestHost) {
    try {
      if (new URL(origin).host !== requestHost) {
        return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
    }
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });
  }

  // Honeypot field: genuine users never see or fill this.
  if (text(body.companyWebsite, 200)) return NextResponse.json({ ok: true, reference: "accepted" });

  const kind = body.kind === "quote" ? "quote" : body.kind === "project" ? "project" : "contact";

  if (kind === "contact") {
    const name = text(body.name, 120);
    const email = text(body.email, 254);
    const topic = text(body.topic, 120) || "General enquiry";
    const pageUrl = text(body.pageUrl, 1000);
    const message = text(body.message, 8000);
    if (!name || !isValidEmail(email) || message.length < 10) {
      return NextResponse.json({ ok: false, error: "Please provide your name, a valid email and a useful message." }, { status: 400 });
    }
    const plain = [`RoofHub ${topic}`, `Name: ${name}`, `Reply email: ${email}`, pageUrl ? `Page: ${pageUrl}` : "", "", message].filter(Boolean).join("\n");
    const html = `<h2>RoofHub ${escapeHtml(topic)}</h2><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Reply email:</strong> ${escapeHtml(email)}${pageUrl ? `<br><strong>Page:</strong> ${escapeHtml(pageUrl)}` : ""}</p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`;
    try {
      const sent = await sendEmail(`RoofHub: ${topic}`, email, html, plain);
      return NextResponse.json({ ok: true, reference: sent.id || `RH-${Date.now().toString(36).toUpperCase()}` });
    } catch (error) {
      console.error("RoofHub contact delivery failed", error);
      return NextResponse.json({ ok: false, error: "Your message could not be sent right now. Please try again shortly." }, { status: 503 });
    }
  }

  if (kind === "project") {
    const payload = parseProjectEnquiryPayload(body.payload);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Project enquiry is incomplete." }, { status: 400 });
    }
    const envelope = toLeadEnvelope(payload);
    const safeJson = JSON.stringify(envelope, null, 2).slice(0, 180_000);
    const share = envelope.consent.shareWithRoofingPartners ? "Yes" : "No";
    const plain = [
      "RoofHub project enquiry",
      `Requested help: ${envelope.requestedHelp}`,
      `Name: ${envelope.contact.name}`,
      `Reply email: ${envelope.contact.email}`,
      envelope.contact.phone ? `Phone: ${envelope.contact.phone}` : "",
      envelope.contact.location ? `Location: ${envelope.contact.location}` : "",
      `Consent to share with roofing partners: ${share}`,
      "",
      safeJson
    ].filter(Boolean).join("\n");
    const html = `<h2>RoofHub project enquiry</h2><p><strong>Requested help:</strong> ${escapeHtml(envelope.requestedHelp)}<br><strong>Name:</strong> ${escapeHtml(envelope.contact.name)}<br><strong>Reply email:</strong> ${escapeHtml(envelope.contact.email)}${envelope.contact.phone ? `<br><strong>Phone:</strong> ${escapeHtml(envelope.contact.phone)}` : ""}${envelope.contact.location ? `<br><strong>Location:</strong> ${escapeHtml(envelope.contact.location)}` : ""}<br><strong>Consent to share with roofing partners:</strong> ${share}</p><p>The structured project envelope is included below.</p><pre style="white-space:pre-wrap;font:12px/1.5 monospace">${escapeHtml(safeJson)}</pre>`;
    try {
      const sent = await sendEmail(`RoofHub: ${envelope.requestedHelp}`, envelope.contact.email, html, plain);
      return NextResponse.json({ ok: true, reference: sent.id || `RH-${Date.now().toString(36).toUpperCase()}` });
    } catch (error) {
      console.error("RoofHub project enquiry delivery failed", error);
      return NextResponse.json({ ok: false, error: "Your request could not be sent right now. Please try again shortly." }, { status: 503 });
    }
  }

  // Detailed estimator quote request. Payload is generated by the RoofHub estimator and
  // intentionally excludes uploaded plan-image bytes and custom private rate overrides.
  const payload = body.payload as Record<string, unknown> | undefined;
  const contact = payload && typeof payload.contact === "object" ? payload.contact as Record<string, unknown> : {};
  const name = text(contact.name, 120);
  const email = text(contact.email, 254);
  if (!name || !isValidEmail(email) || !payload) {
    return NextResponse.json({ ok: false, error: "Quote request is incomplete." }, { status: 400 });
  }
  const safeJson = JSON.stringify(payload, null, 2).slice(0, 180_000);
  const plain = `RoofHub detailed quote enquiry\nName: ${name}\nReply email: ${email}\n\n${safeJson}`;
  const html = `<h2>RoofHub detailed quote enquiry</h2><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Reply email:</strong> ${escapeHtml(email)}</p><p>The structured project payload is included below. Uploaded plan image bytes and private custom rate overrides are not included.</p><pre style="white-space:pre-wrap;font:12px/1.5 monospace">${escapeHtml(safeJson)}</pre>`;
  try {
    const sent = await sendEmail("RoofHub: detailed roof quote enquiry", email, html, plain);
    return NextResponse.json({ ok: true, reference: sent.id || `RH-${Date.now().toString(36).toUpperCase()}` });
  } catch (error) {
    console.error("RoofHub quote delivery failed", error);
    return NextResponse.json({ ok: false, error: "Your request could not be sent right now. Please try again shortly." }, { status: 503 });
  }
}
