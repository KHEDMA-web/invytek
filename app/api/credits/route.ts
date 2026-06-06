import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ credits: 0 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { credits: true } });
  return NextResponse.json({ credits: user?.credits ?? 0 });
}
