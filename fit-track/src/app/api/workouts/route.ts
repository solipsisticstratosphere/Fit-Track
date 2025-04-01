import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/workouts - Get workouts with optional filtering
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const name = url.searchParams.get("name");
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : undefined;

  try {
    const whereClause: Record<string, any> = {
      userId: session.user.id,
    };

    if (from) {
      whereClause.date = {
        ...whereClause.date,
        gte: new Date(from),
      };
    }

    if (to) {
      whereClause.date = {
        ...whereClause.date,
        lte: new Date(to),
      };
    }

    if (name) {
      whereClause.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      include: {
        exercises: true,
      },
      orderBy: {
        date: "desc",
      },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error("Error retrieving workouts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve workouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (!body.name || !body.date) {
      return NextResponse.json(
        { error: "Name and date are required" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        name: body.name,
        date: new Date(body.date),
        duration: body.duration || null,
        notes: body.notes || null,
        userId: session.user.id,
        exercises: {
          create:
            body.exercises?.map((exercise: any) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight || null,
              notes: exercise.notes || null,
            })) || [],
        },
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
