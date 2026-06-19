import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "admin" | "advocate";
      advocateId?: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "admin" | "advocate";
    advocateId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "advocate";
    advocateId?: number;
  }
}

export {};
