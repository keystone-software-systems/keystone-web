import { NextResponse } from "next/server";
import { Resend } from "resend";

const SERVICE_LABELS: Record<string, string> = {
  "net-new-development": "Net New Development",
  "vibe-code-to-production": "Vibe-Code to Production",
  "business-process-automation": "Business Process Automation",
  "acquisition-due-diligence": "Acquisition Due Diligence",
  "ai-training-setup": "AI Training & Setup",
  "codebase-improvement": "Existing Codebase Improvement",
  other: "Not sure / other",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const service = typeof body?.service === "string" ? body.service.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json(
      { error: "The contact form isn't configured yet. Please try again later." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Keystone Systems <onboarding@resend.dev>";
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "tanner@propdog.ai";
  const serviceLabel = SERVICE_LABELS[service] ?? "Not specified";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `New inquiry from ${name}${company ? ` (${company})` : ""}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "Not provided"}`,
      `Service interest: ${serviceLabel}`,
      "",
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("Resend send failed", error);
    return NextResponse.json(
      { error: "Something went wrong sending your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
