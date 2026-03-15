import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, hospitalId } = body;

    if (!patientId || !hospitalId) {
      return NextResponse.json({ error: "Patient ID and Hospital ID required" }, { status: 400 });
    }

    // Check if patient record exists and is deleted at this hospital
    const existingRecord = await prisma.patientRecord.findUnique({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId
        }
      }
    });

    if (existingRecord && existingRecord.isActive) {
      return NextResponse.json({ error: "Patient record is already active at this hospital" }, { status: 400 });
    }

    // Find the patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get the hospital
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    // Check if patient exists in other branches of the same network
    const networkHospitals = await prisma.hospital.findMany({
      where: {
        OR: [
          { id: hospital.mainHospitalId || hospitalId },
          { mainHospitalId: hospital.mainHospitalId || hospitalId }
        ]
      }
    });

    const otherHospitalIds = networkHospitals
      .filter(h => h.id !== hospitalId)
      .map(h => h.id);

    const existingRecords = await prisma.patientRecord.findMany({
      where: {
        patientId,
        hospitalId: { in: otherHospitalIds },
        isActive: true
      },
      include: {
        hospital: true
      }
    });

    if (existingRecords.length === 0) {
      return NextResponse.json({
        error: "Patient record not found in any other branch",
        availableIn: []
      }, { status: 404 });
    }

    // Restore the record
    const restoredRecord = await prisma.patientRecord.upsert({
      where: {
        patientId_hospitalId: {
          patientId,
          hospitalId
        }
      },
      update: {
        isActive: true,
        deletedAt: null,
      },
      create: {
        patientId,
        hospitalId,
        isActive: true,
      },
      include: {
        patient: true,
        hospital: true
      }
    });

    return NextResponse.json({
      success: true,
      restoredRecord,
      restoredFrom: existingRecords.map(r => r.hospital.name),
      message: `Patient record restored from ${existingRecords.length} other branch(es)`
    });
  } catch (error) {
    console.error("Error recovering patient record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }

    // Find all active records for this patient
    const records = await prisma.patientRecord.findMany({
      where: {
        patientId,
        isActive: true
      },
      include: {
        hospital: true
      }
    });

    // Find hospitals where the patient is missing
    const allHospitals = await prisma.hospital.findMany();
    const registeredHospitalIds = records.map(r => r.hospitalId);
    const missingHospitals = allHospitals.filter(h => !registeredHospitalIds.includes(h.id));

    return NextResponse.json({
      patientId,
      activeRecords: records,
      missingIn: missingHospitals.map(h => ({
        id: h.id,
        name: h.name,
        location: h.location
      }))
    });
  } catch (error) {
    console.error("Error checking patient recovery status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}