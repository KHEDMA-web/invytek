import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";
import { z } from "zod";

const bodySchema = z.object({
  clientName:  z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation || invitation.userId !== dbUser.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  let body: z.infer<typeof bodySchema> = {};
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (parsed.success) body = parsed.data;
  } catch { /* optional body */ }

  const token = crypto.randomUUID();

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      clientAccessToken: token,
      clientName:  body.clientName  ?? invitation.clientName,
      clientEmail: body.clientEmail ?? invitation.clientEmail,
    },
    select: { clientAccessToken: true, clientName: true, clientEmail: true },
  });

  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation || invitation.userId !== dbUser.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  let body: z.infer<typeof bodySchema> = {};
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (parsed.success) body = parsed.data;
  } catch { /* optional body */ }

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      clientName:  body.clientName  !== undefined ? body.clientName  : invitation.clientName,
      clientEmail: body.clientEmail !== undefined ? body.clientEmail : invitation.clientEmail,
    },
    select: { clientAccessToken: true, clientName: true, clientEmail: true },
  });

  return NextResponse.json(updated);
}
