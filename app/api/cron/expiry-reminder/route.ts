import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPlanExpiryReminderEmail } from "@/lib/emails";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Vercel Cron authenticates with CRON_SECRET header
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Window: plans expiring between 6 and 8 days from now (send once, ~7 days before)
  const from = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      plan: { not: "free" },
      planExpiresAt: { gte: from, lte: to },
    },
    select: { email: true, name: true, plan: true, planExpiresAt: true },
  });

  let sent = 0;
  for (const u of users) {
    if (!u.planExpiresAt) continue;
    await sendPlanExpiryReminderEmail(u.email, u.name, u.plan, u.planExpiresAt);
    sent++;
  }

  return NextResponse.json({ ok: true, sent, checked: users.length });
}
