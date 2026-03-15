import { NextRequest, NextResponse } from "next/server";
import { findBestResourceSupplier } from "@/lib/routingAlgorithm";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestingHospitalId, resourceId, requiredQuantity, emergencyPriority, notes } = body;

    if (!requestingHospitalId || !resourceId || !requiredQuantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the best supplier
    const routingResult = await findBestResourceSupplier(
      requestingHospitalId,
      resourceId,
      Number(requiredQuantity),
      Boolean(emergencyPriority)
    );

    if (!routingResult.success || !routingResult.hospital) {
      return NextResponse.json(routingResult);
    }

    // Check if this is a request from sub-branch to main branch
    const requestingHospital = await prisma.hospital.findUnique({
      where: { id: requestingHospitalId }
    });

    const supplyingHospital = routingResult.hospital;
    const isRequestToMain = requestingHospital?.hospitalType === "SUB_BRANCH" &&
                           supplyingHospital.hospitalType === "MAIN_BRANCH" &&
                           requestingHospital.mainHospitalId === supplyingHospital.id;

    // Create the request
    const request = await prisma.request.create({
      data: {
        resourceId,
        requestingHospitalId,
        supplyingHospitalId: supplyingHospital.id,
        quantity: Number(requiredQuantity),
        status: isRequestToMain ? "PENDING" : "APPROVED", // Auto-approve if main branch is requesting from sub-branch or same level
        emergencyPriority: Boolean(emergencyPriority),
        estimatedETA: routingResult.etaMinutes,
        notes: notes || null,
        approvedAt: isRequestToMain ? null : new Date(), // Auto-approve for non-main-to-sub requests
      },
      include: {
        resource: true,
        requestingHospital: true,
        supplyingHospital: true,
      }
    });

    const response = {
      ...routingResult,
      requestId: request.id,
      status: request.status,
      requiresApproval: isRequestToMain,
      message: isRequestToMain
        ? `${routingResult.message} Request submitted for admin approval.`
        : routingResult.message
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing resource request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get all requests for a hospital
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");

    if (!hospitalId) {
      return NextResponse.json({ error: "Hospital ID required" }, { status: 400 });
    }

    const requests = await prisma.request.findMany({
      where: {
        OR: [
          { requestingHospitalId: hospitalId },
          { supplyingHospitalId: hospitalId }
        ]
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

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
