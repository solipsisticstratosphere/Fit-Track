import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTypedServerSession } from "@/lib/session";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getTypedServerSession();
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getTypedServerSession();
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

    const result = await prisma.$queryRaw`
      SELECT "cloudinaryPublicId" FROM "Meal" WHERE id = ${id}
    `;
    const cloudinaryId = result[0]?.cloudinaryPublicId;

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

    let imageUrl = existingMeal.imageUrl;
    let cloudinaryPublicId = cloudinaryId;

    if (image) {
      if (cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(cloudinaryId);
        } catch (error) {
          console.error("Error deleting previous image:", error);
        }
      }

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = `data:${image.type};base64,${buffer.toString(
        "base64"
      )}`;

      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        folder: "fit-track/meals",
        public_id: `meal_${session.user.id}_${Date.now()}`,
        overwrite: true,
        resource_type: "image",
      });

      imageUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    await prisma.meal.update({
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

    if (cloudinaryPublicId) {
      await prisma.$executeRaw`UPDATE "Meal" SET "cloudinaryPublicId" = ${cloudinaryPublicId} WHERE id = ${id}`;
    }

    const finalMeal = await prisma.meal.findUnique({
      where: { id },
    });

    return NextResponse.json(finalMeal);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getTypedServerSession();
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

    const result = await prisma.$queryRaw`
      SELECT "cloudinaryPublicId" FROM "Meal" WHERE id = ${id}
    `;
    const cloudinaryId = result[0]?.cloudinaryPublicId;

    if (cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(cloudinaryId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
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
