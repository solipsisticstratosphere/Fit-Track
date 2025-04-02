import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
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

          const users = (await prisma.$queryRaw`
            SELECT id, email, name, "hashedPassword", "imageUrl"
            FROM "User"
            WHERE email = ${credentials.email}
            LIMIT 1
          `) as Array<{
            id: string;
            email: string;
            name: string | null;
            hashedPassword: string;
            imageUrl: string | null;
          }>;

          if (!users || users.length === 0) {
            console.log("User not found");
            return null;
          }

          const user = users[0];
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

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.imageUrl,
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
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
