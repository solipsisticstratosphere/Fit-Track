import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import type { Session } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = (await getServerSession(authOptions)) as Session;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        createdAt: true,
        cloudinaryPublicId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = (await getServerSession(authOptions)) as Session;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, imageUrl, cloudinaryPublicId } = body;

    if (name !== undefined && (typeof name !== "string" || name.length > 100)) {
      return NextResponse.json(
        { error: "Invalid name format" },
        { status: 400 }
      );
    }

    if (imageUrl !== undefined && typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid imageUrl format" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | null> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    if (
      cloudinaryPublicId !== undefined &&
      typeof cloudinaryPublicId === "string"
    ) {
      try {
        const currentUser = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if ("cloudinaryPublicId" in currentUser!) {
          updateData.cloudinaryPublicId = cloudinaryPublicId;

          if (
            currentUser &&
            "cloudinaryPublicId" in currentUser &&
            currentUser.cloudinaryPublicId &&
            currentUser.cloudinaryPublicId !== cloudinaryPublicId
          ) {
            try {
              const { default: cloudinary } = await import("@/lib/cloudinary");
              await cloudinary.uploader.destroy(
                currentUser.cloudinaryPublicId as string
              );
            } catch (deleteError) {
              console.error(
                "Error deleting previous Cloudinary image:",
                deleteError
              );
            }
          }
        }
      } catch (error) {
        console.error("Error checking cloudinaryPublicId support:", error);
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        updatedAt: true,
      },
    });

    const responseUser: Record<string, unknown> = { ...updatedUser };
    if (cloudinaryPublicId) {
      responseUser.cloudinaryPublicId = cloudinaryPublicId;
    }

    return NextResponse.json(responseUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = (await getServerSession(authOptions)) as Session;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        hashedPassword: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.workout.deleteMany({
        where: { userId: userId },
      }),

      prisma.meal.deleteMany({
        where: { userId: userId },
      }),

      prisma.weight.deleteMany({
        where: { userId: userId },
      }),

      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
