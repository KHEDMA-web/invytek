import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ available: false });
  const exists = await prisma.invitation.findUnique({ where: { slug } });
  return NextResponse.json({ available: !exists });
}
