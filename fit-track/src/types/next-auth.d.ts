import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in Session type with a user.id property
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  }
}
