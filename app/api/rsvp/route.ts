import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  invitationId: z.string().min(1),
  name: z.string().min(2).max(80),
  status: z.enum(["attending", "declined"]),
  partySize: z.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
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

  const { invitationId, name, status, partySize, message } = parsed.data;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId, status: "published" },
  });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
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

  return NextResponse.json({ ok: true });
}
