import { NextRequest, NextResponse } from "next/server";
import { optimizeResourceRouting, getWorkflowMetrics } from "@/lib/workflow-optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestingHospitalId,
      resourceId,
      requestedQuantity,
      isEmergency = false
    }: {
      requestingHospitalId: string;
      resourceId: string;
      requestedQuantity: number;
      isEmergency?: boolean;
    } = body;

    if (!requestingHospitalId || !resourceId || !requestedQuantity) {
      return NextResponse.json({
        error: "Missing required fields: requestingHospitalId, resourceId, requestedQuantity"
      }, { status: 400 });
    }

    if (requestedQuantity <= 0) {
      return NextResponse.json({ error: "Requested quantity must be positive" }, { status: 400 });
    }

    const result = await optimizeResourceRouting(
      requestingHospitalId,
      resourceId,
      requestedQuantity,
      isEmergency
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Workflow optimization error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await getWorkflowMetrics();
      return NextResponse.json(metrics);
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
  } catch (error) {
    console.error("Workflow metrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}