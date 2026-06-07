import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { plan: true, planExpiresAt: true },
  });

  const planActive = user?.plan !== "free" && user?.planExpiresAt && user.planExpiresAt > new Date();

  // Si une callbackUrl est passée en query, l'honorer sauf si c'est /post-login
  const cb = req.nextUrl.searchParams.get("callbackUrl");
  if (cb && cb.startsWith("/") && cb !== "/post-login") {
    redirect(cb);
  }

  redirect(planActive ? "/dashboard" : "/pricing");
}
