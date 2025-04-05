// @ts-nocheck - Temporarily disable TS checking for this file
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// Define the authentication options
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Trying to authenticate user:", credentials.email);

          // Using Prisma Client directly for better type safety and clarity
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          console.log("User found:", user.email);

          if (!user.hashedPassword) {
            console.log("No password stored for user");
            return null;
          }

          console.log("Comparing passwords...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );

          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            return null;
          }

          // Return the user object expected by NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.imageUrl,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Keep user ID in the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  // Only include debug in development
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// Special handling for Next.js App Router with NextAuth v4
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
