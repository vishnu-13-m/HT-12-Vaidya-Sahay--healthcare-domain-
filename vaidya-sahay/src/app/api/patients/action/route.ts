import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Soft delete patient record from a specific hospital
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const hospitalId = searchParams.get("hospitalId");

    if (!patientId || !hospitalId) {
      return NextResponse.json({ error: "Patient ID and Hospital ID required" }, { status: 400 });
    }

    // Check if patient record exists
    const record = await prisma.patientRecord.findUnique({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId
        }
      }
    });

    if (!record) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    // Soft delete the record
    await prisma.patientRecord.update({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId
        }
      },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Patient record deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting patient record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Restore patient record
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const hospitalId = searchParams.get("hospitalId");

    if (!patientId || !hospitalId) {
      return NextResponse.json({ error: "Patient ID and Hospital ID required" }, { status: 400 });
    }

    // Check if there are other active records for this patient
    const activeRecords = await prisma.patientRecord.findMany({
      where: {
        patientId,
        isActive: true
      }
    });

    if (activeRecords.length === 0) {
      return NextResponse.json({
        error: "Cannot restore record: No active records exist for this patient in other branches"
      }, { status: 400 });
    }

    // Restore the record
    await prisma.patientRecord.update({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId
        }
      },
      data: {
        isActive: true,
        deletedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: "Patient record restored successfully"
    });
  } catch (error) {
    console.error("Error restoring patient record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}