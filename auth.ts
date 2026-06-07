import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/emails";

class AuthError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  action: z.enum(["login", "register"]),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/auth" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: {}, password: {}, name: {}, action: {},
      },
      async authorize(credentials) {
        const parsed = credSchema.safeParse(credentials);
        if (!parsed.success) throw new AuthError("invalid_input");
        const { email, password, name, action } = parsed.data;

        if (action === "register") {
          const exists = await prisma.user.findUnique({ where: { email } });
          if (exists) throw new AuthError("email_exists");
          const hash = await bcrypt.hash(password, 12);
          const user = await prisma.user.create({
            data: { email, name: name?.trim() || email.split("@")[0], password: hash, credits: 3 },
          });
          void sendWelcomeEmail(user.email, user.name);
          return { id: user.id, email: user.email, name: user.name };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) throw new AuthError("no_account");
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new AuthError("bad_password");
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
      } else if ((account?.provider === "google" || account?.provider === "github") && token.email) {
        // Upsert user on first Google login
        const existing = await prisma.user.findUnique({ where: { email: token.email! }, select: { id: true } });
        const dbUser = await prisma.user.upsert({
          where: { email: token.email! },
          update: { name: token.name ?? undefined, image: token.picture as string ?? undefined },
          create: { email: token.email!, name: token.name ?? token.email!.split("@")[0], image: token.picture as string ?? undefined, credits: 3 },
        });
        if (!existing) void sendWelcomeEmail(dbUser.email, dbUser.name);
        token.id = dbUser.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
