import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, approved, adminId, notes } = body;

    if (!requestId || approved === undefined || !adminId) {
      return NextResponse.json({ error: "Request ID, approval status, and admin ID are required" }, { status: 400 });
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

    // Check if admin belongs to the supplying hospital
    const admin = await prisma.hospitalAdmin.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.hospitalId !== request.supplyingHospitalId) {
      return NextResponse.json({ error: "Unauthorized: Admin does not belong to supplying hospital" }, { status: 403 });
    }

    // Update request status
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        approvedBy: adminId,
        approvedAt: new Date(),
        notes: notes || request.notes
      },
      include: {
        resource: true,
        requestingHospital: true,
        supplyingHospital: true,
      }
    });

    // If approved, update inventory (reduce quantity at supplying hospital)
    if (approved) {
      const inventory = await prisma.inventory.findFirst({
        where: {
          hospitalId: request.supplyingHospitalId,
          resourceId: request.resourceId
        }
      });

      if (inventory && inventory.quantity >= request.quantity) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity - request.quantity,
            lastUpdated: new Date()
          }
        });

        // Update status to IN_TRANSIT
        await prisma.request.update({
          where: { id: requestId },
          data: { status: "IN_TRANSIT" }
        });
      } else {
        return NextResponse.json({ error: "Insufficient inventory for approval" }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: approved ? "Request approved and dispatched" : "Request rejected"
    });
  } catch (error) {
    console.error("Error processing approval:", error);
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

    // Get pending requests for this hospital (as supplier)
    const pendingRequests = await prisma.request.findMany({
      where: {
        supplyingHospitalId: hospitalId,
        status: "PENDING"
      },
      include: {
        resource: true,
        requestingHospital: true,
        supplyingHospital: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}