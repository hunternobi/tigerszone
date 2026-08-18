import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}

class TooManyAttemptsError extends CredentialsSignin {
  code = "too-many-attempts";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const emailLower = email.toLowerCase().trim();
        const ip = await getClientIp();
        const [ipCheck, emailCheck] = await Promise.all([
          checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000),
          checkRateLimit(`login:email:${emailLower}`, 6, 15 * 60 * 1000),
        ]);
        if (!ipCheck.allowed || !emailCheck.allowed) throw new TooManyAttemptsError();

        await dbConnect();
        const user = await UserModel.findOne({ email: emailLower });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerified) throw new EmailNotVerifiedError();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
      }
      return session;
    },
  },
});
