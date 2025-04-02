import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      imageUrl?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    imageUrl?: string | null;
  }
}
