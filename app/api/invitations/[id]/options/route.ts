import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/getDbUser";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id, userId: dbUser.id } });
  if (!invitation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const patch = await req.json();
  const currentOptions = JSON.parse(invitation.options);
  const updatedOptions = JSON.stringify({ ...currentOptions, ...patch });

  await prisma.invitation.update({ where: { id }, data: { options: updatedOptions } });
  revalidatePath(`/i/${invitation.slug}`);
  return NextResponse.json({ ok: true });
}
