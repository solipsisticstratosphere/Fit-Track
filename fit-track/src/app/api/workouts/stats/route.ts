import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

  try {
    const whereClause: { userId: string; date?: { gte?: Date; lte?: Date } } = {
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

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        duration: true,
      },
    });

    const count = workouts.length;

    const workoutsWithDuration = workouts.filter((w) => w.duration !== null);
    const avgDuration =
      workoutsWithDuration.length > 0
        ? Math.round(
            workoutsWithDuration.reduce(
              (sum, workout) => sum + (workout.duration || 0),
              0
            ) / workoutsWithDuration.length
          )
        : 0;

    const exerciseStats = await prisma.$queryRaw`
      SELECT e."name", 
             AVG(e."weight") as "avgWeight", 
             MAX(e."weight") as "maxWeight", 
             AVG(e."reps") as "avgReps"
      FROM "Exercise" e
      JOIN "Workout" w ON e."workoutId" = w."id"
      WHERE w."userId" = ${session.user.id}
        ${from ? `AND w."date" >= ${new Date(from)}` : ""}
        ${to ? `AND w."date" <= ${new Date(to)}` : ""}
      GROUP BY e."name"
      ORDER BY "maxWeight" DESC
      LIMIT 5
    `;

    return NextResponse.json({
      count,
      avgDuration,
      exerciseStats,
    });
  } catch (error) {
    console.error("Error retrieving workout statistics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve workout statistics" },
      { status: 500 }
    );
  }
}
