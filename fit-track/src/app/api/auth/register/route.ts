import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { User, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = (await prisma.$queryRaw(
        Prisma.sql`
        INSERT INTO "User" ("id", "email", "name", "hashedPassword", "createdAt", "updatedAt")
        VALUES (${randomUUID()}, ${email}, ${
          name || null
        }, ${hashedPassword}, ${new Date()}, ${new Date()})
        RETURNING "id", "email", "name";
        `
      )) as Pick<User, "id" | "email" | "name">[];

      if (!result || result.length === 0) {
        throw new Error("Failed to create user");
      }

      const user = result[0];

      return NextResponse.json(
        {
          message: "User registered successfully",
          user,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error during user creation:", dbError);

      // More detailed error response
      return NextResponse.json(
        {
          message: "Failed to create user",
          error: dbError instanceof Error ? dbError.message : "Unknown error",
          details: JSON.stringify(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);

    // More detailed error handling
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
