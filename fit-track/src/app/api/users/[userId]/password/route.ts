import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcrypt";
import type { Session } from "next-auth";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        hashedPassword: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isCurrentPasswordValid = await compare(
      currentPassword,
      user.hashedPassword
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        hashedPassword,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
