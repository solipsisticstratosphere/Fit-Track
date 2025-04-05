import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Gets the server session with proper typing for user.id
 * Use this instead of directly calling getServerSession to ensure proper typing
 */
export async function getTypedServerSession() {
  const session = await getServerSession(authOptions);
  return session as Session | null;
}
