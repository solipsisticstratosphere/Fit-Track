import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTypedServerSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getTypedServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : undefined;

  try {
    const whereClause: { userId: string; date?: { gte?: Date; lte?: Date } } = {
      userId: session.user.id,
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (from || to) {
      whereClause.date = {};

      if (from) {
        whereClause.date.gte = new Date(from);
      }

      if (to) {
        whereClause.date.lte = new Date(to);
      }
    }

    const meals = await prisma.meal.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json({ meals });
  } catch (error) {
    console.error("Error retrieving meals:", error);
    return NextResponse.json(
      { error: "Failed to retrieve meals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getTypedServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const date = formData.get("date") as string;
    const calories = formData.get("calories") as string;
    const protein = formData.get("protein") as string;
    const carbs = formData.get("carbs") as string;
    const fat = formData.get("fat") as string;
    const notes = formData.get("notes") as string;
    const image = formData.get("image") as File;

    if (!name || !date) {
      return NextResponse.json(
        { error: "Name and date are required" },
        { status: 400 }
      );
    }

    // TODO:  process image upload to a storage service

    let imageUrl = null;
    if (image) {
      imageUrl = "/placeholder-meal.jpg";
    }

    const meal = await prisma.meal.create({
      data: {
        name,
        date: new Date(date),
        calories: calories ? parseInt(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        notes: notes || null,
        imageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}
