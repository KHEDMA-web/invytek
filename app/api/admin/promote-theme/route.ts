import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  let body: { id?: string; promote?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const theme = await prisma.generatedTheme.update({
    where: { id: body.id },
    data: { isPromoted: body.promote ?? true },
  });

  return NextResponse.json({ ok: true, theme });
}
