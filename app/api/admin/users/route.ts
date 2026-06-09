import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      planExpiresAt: true,
      isTrial: true,
      credits: true,
      createdAt: true,
      _count: { select: { invitations: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ users });
}
