import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate unique patient ID
function generatePatientId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PT-${year}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      age,
      gender,
      phoneNumber,
      address,
      medicalHistory,
      hospitalId
    } = body;

    if (!name || !age || !gender || !phoneNumber || !address || !hospitalId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate patient ID
    const patientId = generatePatientId();

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        patientId,
        name,
        age: parseInt(age),
        gender,
        phoneNumber,
        address,
        medicalHistory: medicalHistory || null,
      }
    });

    // Get the hospital and find its network
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    // Find all hospitals in the same network
    const networkHospitals = await prisma.hospital.findMany({
      where: {
        OR: [
          { id: hospital.mainHospitalId || hospitalId },
          { mainHospitalId: hospital.mainHospitalId || hospitalId }
        ]
      }
    });

    // Create patient records for all hospitals in the network
    const patientRecords = await Promise.all(
      networkHospitals.map(networkHospital =>
        prisma.patientRecord.create({
          data: {
            patientId: patient.id,
            hospitalId: networkHospital.id,
            registrationDate: new Date(),
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      patient,
      patientRecords,
      message: `Patient registered successfully at ${hospital.name} and replicated across ${networkHospitals.length} hospital branches.`
    });
  } catch (error) {
    console.error("Error registering patient:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");
    const patientId = searchParams.get("patientId");

    if (patientId) {
      // Get specific patient with records across all hospitals
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          records: {
            include: {
              hospital: true
            }
          }
        }
      });

      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      return NextResponse.json(patient);
    }

    if (hospitalId) {
      // Get all active patients for a specific hospital
      const patients = await prisma.patientRecord.findMany({
        where: {
          hospitalId,
          isActive: true
        },
        include: {
          patient: true,
          hospital: true
        },
        orderBy: {
          registrationDate: 'desc'
        }
      });

      return NextResponse.json(patients);
    }

    return NextResponse.json({ error: "Hospital ID or Patient ID required" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
