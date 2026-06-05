import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = await req.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  if (!token) return NextResponse.json({ error: "Token requis" }, { status: 400 });

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { invitation: { select: { slug: true, status: true } } },
  });

  if (!guest) return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  if (guest.invitation.status !== "published") {
    return NextResponse.json({ error: "Invitation non disponible" }, { status: 403 });
  }

  // Idempotent: don't overwrite the original check-in timestamp
  if (guest.checkedInAt) {
    return NextResponse.json({
      name: guest.name,
      status: "checked_in",
      partySize: guest.partySize,
      message: guest.message,
      checkedInAt: guest.checkedInAt,
      alreadyCheckedIn: true,
    });
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
    alreadyCheckedIn: false,
  });
}
