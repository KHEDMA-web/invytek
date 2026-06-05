import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MAX_GUESTS = 500;

// Block private/internal URLs to prevent SSRF
function isSafeWebhookUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const h = u.hostname;
    if (
      h === "localhost" ||
      h === "0.0.0.0" ||
      /^127\./.test(h) ||
      /^10\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      /^\[::1\]$/.test(h) ||
      /^169\.254\./.test(h)
    ) return false;
    return true;
  } catch { return false; }
}

const schema = z.object({
  invitationId: z.string().min(1),
  name: z.string().min(2).max(80),
  status: z.enum(["attending", "declined"]),
  partySize: z.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
  token: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { invitationId, name, status, partySize, message, token } = parsed.data;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId, status: "published" },
  });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  if (token) {
    const guest = await prisma.guest.findUnique({ where: { token } });
    if (!guest || guest.invitationId !== invitationId) {
      return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
    }
    await prisma.guest.update({
      where: { token },
      data: { name, status, partySize: status === "attending" ? partySize : 1, message: message || null, respondedAt: new Date() },
    });
    revalidatePath(`/i/${invitation.slug}/g/${token}`);
  } else {
    const guestCount = await prisma.guest.count({ where: { invitationId } });
    if (guestCount >= MAX_GUESTS) {
      return NextResponse.json({ error: "Limite d'invités atteinte" }, { status: 429 });
    }
    await prisma.guest.create({
      data: {
        invitationId,
        name,
        status,
        partySize: status === "attending" ? partySize : 1,
        message: message || null,
        respondedAt: new Date(),
      },
    });
  }

  // Webhook RSVP — only fire for HTTPS, non-internal URLs
  try {
    const options = JSON.parse(invitation.options) as { webhookUrl?: string };
    if (options.webhookUrl && isSafeWebhookUrl(options.webhookUrl)) {
      void fetch(options.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, name, status, partySize, message }),
      });
    }
  } catch { /* ne pas bloquer si le webhook échoue */ }

  return NextResponse.json({ ok: true });
}
