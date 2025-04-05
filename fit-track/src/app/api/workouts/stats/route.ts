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
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  try {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (from && isNaN(fromDate?.getTime() || 0)) {
      return NextResponse.json(
        { error: "Invalid 'from' date parameter" },
        { status: 400 }
      );
    }

    if (to && isNaN(toDate?.getTime() || 0)) {
      return NextResponse.json(
        { error: "Invalid 'to' date parameter" },
        { status: 400 }
      );
    }

    const whereClause: { userId: string; date?: { gte?: Date; lte?: Date } } = {
      userId: session.user.id,
    };

    if (fromDate) {
      whereClause.date = {
        ...whereClause.date,
        gte: fromDate,
      };
    }

    if (toDate) {
      whereClause.date = {
        ...whereClause.date,
        lte: toDate,
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

    let query = `
      SELECT e."name", 
             AVG(e."weight") as "avgWeight", 
             MAX(e."weight") as "maxWeight", 
             AVG(e."reps") as "avgReps"
      FROM "Exercise" e
      JOIN "Workout" w ON e."workoutId" = w."id"
      WHERE w."userId" = $1
    `;

    const queryParams: (string | Date)[] = [session.user.id];
    let paramIndex = 2;

    if (fromDate) {
      query += ` AND w."date" >= $${paramIndex}`;
      queryParams.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      query += ` AND w."date" <= $${paramIndex}`;
      queryParams.push(toDate);
    }

    query += `
      GROUP BY e."name"
      ORDER BY "maxWeight" DESC
      LIMIT 5
    `;

    const exerciseStats = await prisma.$queryRawUnsafe(query, ...queryParams);

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
