import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import {
  advocateToAuthUser,
  emailEligibleForMicrosoftSso,
  findAdvocateByEmail,
  getBackdoorEmail,
  getLoginDomain,
  isAzureSsoConfigured,
} from "./app/lib/sso-config.js";

const authUrl =
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  undefined;

function buildProviders() {
  const providers = [];

  if (isAzureSsoConfigured()) {
    const tenantId = process.env.AZURE_TENANT_ID.trim();
    providers.push(
      MicrosoftEntraID({
        clientId: process.env.AZURE_CLIENT_ID.trim(),
        clientSecret: process.env.AZURE_CLIENT_SECRET.trim(),
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        authorization: {
          params: {
            prompt: "select_account",
          },
        },
      }),
    );
  }

  providers.push(
    Credentials({
      id: "credentials",
      name: "Emergency admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        const backdoorEmail = getBackdoorEmail();
        const backdoorPassword = process.env.ADMIN_PASSWORD;

        if (!email || !password || !backdoorEmail || !backdoorPassword) {
          return null;
        }

        if (email !== backdoorEmail || password !== backdoorPassword) {
          return null;
        }

        const advocate = await findAdvocateByEmail(email);
        if (!advocate) {
          return null;
        }

        return advocateToAuthUser(advocate);
      },
    }),
  );

  return providers;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  ...(authUrl ? { url: authUrl } : {}),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "microsoft-entra-id") {
        const email = user?.email?.toLowerCase().trim();
        if (!email) return false;

        if (!emailEligibleForMicrosoftSso(email)) {
          return `/login?error=${encodeURIComponent(
            `Microsoft sign-in requires an @${getLoginDomain()} email address.`,
          )}`;
        }

        const advocate = await findAdvocateByEmail(email);
        if (!advocate) {
          return `/login?error=${encodeURIComponent(
            "No FNFAO account found for this email. Ask an administrator to add you first.",
          )}`;
        }

        return true;
      }

      return false;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "microsoft-entra-id") {
        const advocate = await findAdvocateByEmail(user.email);
        if (advocate) {
          token.sub = String(advocate.advocate_id);
          token.role = advocate.role;
          token.advocateId = advocate.advocate_id;
          token.name = `${advocate.firstName} ${advocate.lastName}`.trim();
          token.email = advocate.email;
        }
      }

      if (user && account?.provider === "credentials") {
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
