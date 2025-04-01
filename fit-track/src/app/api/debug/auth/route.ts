import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found",
        success: false,
      });
    }

    console.log("Stored hashed password:", user.hashedPassword);

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    return NextResponse.json({
      success: passwordMatch,
      message: passwordMatch ? "Password is correct" : "Password is incorrect",
      passwordProvided: password !== undefined && password !== null,
      hashedPasswordExists:
        user.hashedPassword !== undefined && user.hashedPassword !== null,
    });
  } catch (error) {
    console.error("Auth debug error:", error);
    return NextResponse.json(
      {
        error: String(error),
        details: error instanceof Error ? error.stack : null,
        success: false,
      },
      { status: 500 }
    );
  }
}
