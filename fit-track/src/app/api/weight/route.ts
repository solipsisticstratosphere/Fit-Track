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

    const weights = await prisma.weight.findMany({
      where: whereClause,
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({ weights });
  } catch (error) {
    console.error("Error retrieving weight entries:", error);
    return NextResponse.json(
      { error: "Failed to retrieve weight entries" },
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
    const body = await req.json();

    if (!body.weight) {
      return NextResponse.json(
        { error: "Weight is required" },
        { status: 400 }
      );
    }

    const weightEntry = await prisma.weight.create({
      data: {
        weight: parseFloat(body.weight),
        date: body.date ? new Date(body.date) : new Date(),
        notes: body.notes || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(weightEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating weight entry:", error);
    return NextResponse.json(
      { error: "Failed to create weight entry" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getTypedServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Weight entry ID is required" },
        { status: 400 }
      );
    }

    const existingEntry = await prisma.weight.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Weight entry not found" },
        { status: 404 }
      );
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this entry" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updatedEntry = await prisma.weight.update({
      where: { id },
      data: {
        weight: body.weight !== undefined ? parseFloat(body.weight) : undefined,
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating weight entry:", error);
    return NextResponse.json(
      { error: "Failed to update weight entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getTypedServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Weight entry ID is required" },
        { status: 400 }
      );
    }

    const existingEntry = await prisma.weight.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Weight entry not found" },
        { status: 404 }
      );
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this entry" },
        { status: 403 }
      );
    }

    await prisma.weight.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    return NextResponse.json(
      { error: "Failed to delete weight entry" },
      { status: 500 }
    );
  }
}
