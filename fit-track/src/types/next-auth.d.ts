/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DefaultSession, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      imageUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    imageUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    imageUrl?: string | null;
  }
}
