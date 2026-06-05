import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { WeddingContentSchema, WeddingOptionsSchema } from "@/lib/schemas/wedding";
import { z } from "zod";

const patchSchema = z.object({
  content: WeddingContentSchema.optional(),
  options: WeddingOptionsSchema.partial().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation || invitation.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const updateData: Record<string, string> = {};
  if (parsed.data.content) updateData.content = JSON.stringify(parsed.data.content);
  if (parsed.data.options) {
    const current = JSON.parse(invitation.options);
    updateData.options = JSON.stringify({ ...current, ...parsed.data.options });
  }

  await prisma.invitation.update({ where: { id }, data: updateData });
  revalidatePath(`/i/${invitation.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation || invitation.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.invitation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
