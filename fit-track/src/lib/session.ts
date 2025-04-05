import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function getTypedServerSession() {
  const session = await getServerSession(authOptions);
  return session as Session | null;
}
