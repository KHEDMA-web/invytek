import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  invitationId: z.string().min(1),
  name: z.string().min(2).max(80),
  contact: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { invitationId, name, contact } = parsed.data;

  // Vérifier que l'invitation appartient à l'utilisateur connecté
  const inv = await prisma.invitation.findUnique({ where: { id: invitationId, userId: session.user.id } });
  if (!inv) return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });

  const guest = await prisma.guest.create({
    data: { invitationId, name, contact: contact || null },
  });

  return NextResponse.json({ ok: true, token: guest.token });
}
