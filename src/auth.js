import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        const { query } = await import("./app/lib/db.js");

        const result = await query(
          `SELECT advocate_id, "firstName", "lastName", email, password_hash, role
           FROM "Advocates"
           WHERE LOWER(email) = $1
           LIMIT 1`,
          [email],
        );

        const user = result.rows[0];
        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: String(user.advocate_id),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          advocateId: user.advocate_id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.advocateId = user.advocateId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.advocateId = token.advocateId;
      }
      return session;
    },
  },
});
