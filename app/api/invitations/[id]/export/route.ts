import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });

  const invitation = await prisma.invitation.findUnique({
    where: { id, userId: dbUser.id },
    include: { guests: { orderBy: { respondedAt: "asc" } } },
  });
  if (!invitation) return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });

  const rows = [
    ["Nom", "Contact", "Statut", "Personnes", "Message", "Répondu le", "Arrivé le"],
    ...invitation.guests.map(g => [
      g.name,
      g.contact ?? "",
      g.status,
      String(g.partySize),
      (g.message ?? "").replace(/\n/g, " "),
      g.respondedAt ? new Date(g.respondedAt).toLocaleString("fr-FR") : "",
      g.checkedInAt ? new Date(g.checkedInAt).toLocaleString("fr-FR") : "",
    ]),
  ];

  const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invites-${invitation.id}.csv"`,
    },
  });
}
