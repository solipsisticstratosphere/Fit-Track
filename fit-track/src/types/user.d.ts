import { User as PrismaUser } from "@prisma/client";

declare global {
  namespace PrismaJson {
    interface UserWithPassword extends PrismaUser {
      hashedPassword: string;
    }
  }
}
