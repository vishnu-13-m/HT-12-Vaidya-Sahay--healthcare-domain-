import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, action, adminId, notes } = body;

    if (!requestId || !action || !adminId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the request
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        requestingHospital: true,
        supplyingHospital: true,
        resource: true
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify admin belongs to the supplying hospital
    const admin = await prisma.hospitalAdmin.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.hospitalId !== request.supplyingHospitalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the request
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        approvedBy: adminId,
        approvedAt: new Date(),
        notes: notes || null,
      },
      include: {
        requestingHospital: true,
        supplyingHospital: true,
        resource: true,
      }
    });

    // If approved, update inventory
    if (action === "APPROVE") {
      // Decrease inventory at supplying hospital
      await prisma.inventory.updateMany({
        where: {
          hospitalId: request.supplyingHospitalId,
          resourceId: request.resourceId
        },
        data: {
          quantity: {
            decrement: request.quantity
          }
        }
      });

      // Increase inventory at requesting hospital (simulating transfer)
      await prisma.inventory.upsert({
        where: {
          hospitalId_resourceId: {
            hospitalId: request.requestingHospitalId!,
            resourceId: request.resourceId
          }
        },
        update: {
          quantity: {
            increment: request.quantity
          }
        },
        create: {
          hospitalId: request.requestingHospitalId!,
          resourceId: request.resourceId,
          quantity: request.quantity
        }
      });
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Request ${action.toLowerCase()}d successfully`
    });
  } catch (error) {
    console.error("Error processing admin action:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");

    if (!hospitalId) {
      return NextResponse.json({ error: "Hospital ID required" }, { status: 400 });
    }

    // Get pending requests for this hospital
    const requests = await prisma.request.findMany({
      where: {
        supplyingHospitalId: hospitalId,
        status: "PENDING"
      },
      include: {
        requestingHospital: true,
        supplyingHospital: true,
        resource: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get hospital inventory
    const inventory = await prisma.inventory.findMany({
      where: { hospitalId },
      include: {
        resource: true
      }
    });

    // Get patient registrations
    const patients = await prisma.patientRecord.count({
      where: { hospitalId, isActive: true }
    });

    return NextResponse.json({
      pendingRequests: requests,
      inventory,
      totalPatients: patients
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}