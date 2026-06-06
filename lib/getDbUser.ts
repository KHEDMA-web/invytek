import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Resolves the session user from Neon by email — more reliable than
// session.user.id which can be stale if the DB was reset after JWT was issued.
export async function getDbUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}
