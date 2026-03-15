import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        inventories: {
          include: {
            resource: true
          }
        },
        subBranches: true,
        mainHospital: true,
        admins: true
      }
    });
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
