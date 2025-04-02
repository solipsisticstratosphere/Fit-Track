import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

interface AuthSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

type RouteParams = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = (await getServerSession(authOptions)) as AuthSession | null;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    const meal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    if (meal.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this meal" },
        { status: 403 }
      );
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error retrieving meal:", error);
    return NextResponse.json(
      { error: "Failed to retrieve meal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = (await getServerSession(authOptions)) as AuthSession | null;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    const existingMeal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!existingMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    if (existingMeal.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this meal" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const date = formData.get("date") as string;
    const calories = formData.get("calories") as string;
    const protein = formData.get("protein") as string;
    const carbs = formData.get("carbs") as string;
    const fat = formData.get("fat") as string;
    const notes = formData.get("notes") as string;
    const image = formData.get("image") as File;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // TODO:  process image upload
    let imageUrl = existingMeal.imageUrl;
    if (image) {
      imageUrl = "/placeholder-meal.jpg";
    }

    const updatedMeal = await prisma.meal.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        calories: calories ? parseInt(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        notes: notes || null,
        imageUrl,
      },
    });

    return NextResponse.json(updatedMeal);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = (await getServerSession(authOptions)) as AuthSession | null;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    const existingMeal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!existingMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    if (existingMeal.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this meal" },
        { status: 403 }
      );
    }

    await prisma.meal.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
