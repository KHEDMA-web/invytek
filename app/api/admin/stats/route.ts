import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "aniskhelifiusthb@gmail.com";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const now = new Date();

  const [
    totalUsers,
    paidActive,
    trialsActive,
    freeUsers,
    totalInvitations,
    publishedInvitations,
    creditsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        plan: { not: "free" },
        isTrial: false,
        OR: [{ planExpiresAt: null }, { planExpiresAt: { gt: now } }],
      },
    }),
    prisma.user.count({
      where: { isTrial: true, planExpiresAt: { gt: now } },
    }),
    prisma.user.count({ where: { plan: "free" } }),
    prisma.invitation.count(),
    prisma.invitation.count({ where: { status: "published" } }),
    prisma.user.aggregate({ _sum: { credits: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    paidActive,
    trialsActive,
    freeUsers,
    totalInvitations,
    publishedInvitations,
    totalCredits: creditsAgg._sum.credits ?? 0,
  });
}
