import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    const originalWorkout = await prisma.workout.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!originalWorkout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    if (originalWorkout.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this workout" },
        { status: 403 }
      );
    }

    const newWorkout = await prisma.workout.create({
      data: {
        name: `${originalWorkout.name} (Copy)`,
        date: new Date().toISOString(),
        duration: originalWorkout.duration,
        notes: originalWorkout.notes,
        userId: session.user.id,
        exercises: {
          create: originalWorkout.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            notes: exercise.notes,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json(newWorkout, { status: 201 });
  } catch (error) {
    console.error("Error copying workout:", error);
    return NextResponse.json(
      { error: "Failed to copy workout" },
      { status: 500 }
    );
  }
}
