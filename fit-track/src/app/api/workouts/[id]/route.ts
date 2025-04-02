import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single workout by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workout = await prisma.workout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only access their own workouts
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

// PATCH - Update workout
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the workout to verify ownership
    const existingWorkout = await prisma.workout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only update their own workouts
      },
      include: {
        exercises: true,
      },
    });

    if (!existingWorkout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // Parse the request body
    const body = await request.json();
    const { name, date, duration, notes, exercises } = body;

    // Validate input
    if (!name || !date) {
      return NextResponse.json(
        { error: "Name and date are required" },
        { status: 400 }
      );
    }

    // Update workout in a transaction to handle exercise updates
    const result = await prisma.$transaction(async (tx) => {
      // Update the workout
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

      // Get existing exercise IDs to identify deleted exercises
      const existingExerciseIds = existingWorkout.exercises.map((ex) => ex.id);
      const newExerciseIds = exercises.map((ex: { id: string }) => ex.id);

      // Identify exercises to delete (existed before but not in new set)
      const exercisesToDelete = existingExerciseIds.filter(
        (id) => !newExerciseIds.includes(id)
      );

      // Delete removed exercises
      if (exercisesToDelete.length > 0) {
        await tx.exercise.deleteMany({
          where: {
            id: {
              in: exercisesToDelete,
            },
          },
        });
      }

      // Update or create exercises
      for (const exercise of exercises) {
        const { id, name, sets, reps, weight, notes } = exercise;

        // Check if this is an existing exercise (has a valid UUID)
        const isExisting = existingExerciseIds.includes(id);

        if (isExisting) {
          // Update existing exercise
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
          // Create new exercise
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

// DELETE - Delete workout
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the workout to verify ownership
    const workout = await prisma.workout.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only delete their own workouts
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // Delete the workout (exercises will be cascade deleted due to relationship in schema)
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
