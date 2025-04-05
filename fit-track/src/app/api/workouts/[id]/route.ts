import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTypedServerSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getTypedServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workout = await prisma.workout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        exercises: true,
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json({ workout });
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getTypedServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingWorkout = await prisma.workout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        exercises: true,
      },
    });

    if (!existingWorkout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, date, duration, notes, exercises } = body;

    if (!name || !date) {
      return NextResponse.json(
        { error: "Name and date are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedWorkout = await tx.workout.update({
        where: {
          id: params.id,
        },
        data: {
          name,
          date: new Date(date),
          duration,
          notes,
        },
      });

      const existingExerciseIds = existingWorkout.exercises.map((ex) => ex.id);
      const newExerciseIds = exercises.map((ex: { id: string }) => ex.id);

      const exercisesToDelete = existingExerciseIds.filter(
        (id) => !newExerciseIds.includes(id)
      );

      if (exercisesToDelete.length > 0) {
        await tx.exercise.deleteMany({
          where: {
            id: {
              in: exercisesToDelete,
            },
          },
        });
      }

      for (const exercise of exercises) {
        const { id, name, sets, reps, weight, notes } = exercise;

        const isExisting = existingExerciseIds.includes(id);

        if (isExisting) {
          await tx.exercise.update({
            where: {
              id,
            },
            data: {
              name,
              sets,
              reps,
              weight,
              notes,
              updatedAt: new Date(),
            },
          });
        } else {
          await tx.exercise.create({
            data: {
              id,
              name,
              sets,
              reps,
              weight,
              notes,
              workoutId: params.id,
            },
          });
        }
      }

      return updatedWorkout;
    });

    return NextResponse.json({ success: true, workout: result });
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getTypedServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workout = await prisma.workout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only delete their own workouts
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    await prisma.workout.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
