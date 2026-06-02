import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id, userId: session.user.id } });
  if (!invitation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const patch = await req.json();
  const currentOptions = JSON.parse(invitation.options);
  const updatedOptions = JSON.stringify({ ...currentOptions, ...patch });

  await prisma.invitation.update({ where: { id }, data: { options: updatedOptions } });
  return NextResponse.json({ ok: true });
}
