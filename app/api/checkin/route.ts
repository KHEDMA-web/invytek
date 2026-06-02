import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token requis" }, { status: 400 });

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { invitation: { select: { slug: true, status: true } } },
  });

  if (!guest) return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  if (guest.invitation.status !== "published") {
    return NextResponse.json({ error: "Invitation non disponible" }, { status: 403 });
  }

  const updated = await prisma.guest.update({
    where: { token },
    data: { status: "checked_in", checkedInAt: new Date() },
  });

  return NextResponse.json({
    name: updated.name,
    status: "checked_in",
    partySize: updated.partySize,
    message: updated.message,
    checkedInAt: updated.checkedInAt,
  });
}
