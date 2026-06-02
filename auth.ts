import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

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
            data: { email, name: name?.trim() || email.split("@")[0], password: hash },
          });
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
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
