import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ credits: 0, plan: "free", planExpiresAt: null });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { credits: true, plan: true, planExpiresAt: true },
  });
  const planActive = user?.plan !== "free" && user?.planExpiresAt && user.planExpiresAt > new Date();
  return NextResponse.json({
    credits: user?.credits ?? 0,
    plan: planActive ? user!.plan : "free",
    planExpiresAt: user?.planExpiresAt ?? null,
  });
}
