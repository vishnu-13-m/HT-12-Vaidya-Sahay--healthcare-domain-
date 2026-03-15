import { prisma } from "./prisma";

export interface OptimizationResult {
  resourceId: string;
  resourceName: string;
  requestedQuantity: number;
  optimalSource: {
    hospitalId: string;
    hospitalName: string;
    availableQuantity: number;
    distance: number;
    estimatedTime: number; // in minutes
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  } | null;
  alternativeSources: Array<{
    hospitalId: string;
    hospitalName: string;
    availableQuantity: number;
    distance: number;
    estimatedTime: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  optimizationScore: number; // 0-100, higher is better
  recommendations: string[];
}

export interface WorkflowMetrics {
  totalRequests: number;
  fulfilledRequests: number;
  averageFulfillmentTime: number;
  resourceUtilizationRate: number;
  optimizationEfficiency: number;
}

/**
 * Optimize resource routing for a hospital request
 */
export async function optimizeResourceRouting(
  requestingHospitalId: string,
  resourceId: string,
  requestedQuantity: number,
  isEmergency: boolean = false
): Promise<OptimizationResult> {
  // Get resource details
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  });

  if (!resource) {
    throw new Error("Resource not found");
  }

  // Get requesting hospital details
  const requestingHospital = await prisma.hospital.findUnique({
    where: { id: requestingHospitalId },
    include: { mainHospital: true }
  });

  if (!requestingHospital) {
    throw new Error("Requesting hospital not found");
  }

  // Find all hospitals with the requested resource
  const hospitalsWithResource = await prisma.inventory.findMany({
    where: {
      resourceId,
      quantity: { gte: requestedQuantity }
    },
    include: {
      hospital: true
    }
  });

  if (hospitalsWithResource.length === 0) {
    return {
      resourceId,
      resourceName: resource.name,
      requestedQuantity,
      optimalSource: null,
      alternativeSources: [],
      optimizationScore: 0,
      recommendations: [
        "No hospitals currently have sufficient quantity of this resource",
        "Consider contacting external suppliers",
        "Review inventory management policies"
      ]
    };
  }

  // Calculate distances and priorities for each source
  const sources = await Promise.all(
    hospitalsWithResource.map(async (inventory) => {
      const distance = calculateDistance(
        requestingHospital.latitude,
        requestingHospital.longitude,
        inventory.hospital.latitude,
        inventory.hospital.longitude
      );

      const estimatedTime = calculateEstimatedTime(distance, isEmergency);

      // Calculate priority based on distance, relationship, and availability
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

      if (distance < 10) priority = 'HIGH'; // Within 10km
      else if (distance > 50) priority = 'LOW'; // Over 50km

      // Boost priority for main hospital or sub-branches
      if (inventory.hospital.id === requestingHospital.mainHospitalId ||
          requestingHospital.id === inventory.hospital.mainHospitalId) {
        priority = 'HIGH';
      }

      // Emergency boosts priority
      if (isEmergency && distance < 25) {
        priority = 'HIGH';
      }

      return {
        hospitalId: inventory.hospital.id,
        hospitalName: inventory.hospital.name,
        availableQuantity: inventory.quantity,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        estimatedTime,
        priority
      };
    })
  );

  // Sort sources by priority and distance
  const sortedSources = sources.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.distance - b.distance;
  });

  const optimalSource = sortedSources[0];
  const alternativeSources = sortedSources.slice(1);

  // Calculate optimization score (0-100)
  const optimizationScore = calculateOptimizationScore(optimalSource, requestedQuantity, isEmergency);

  // Generate recommendations
  const recommendations = generateRecommendations(optimalSource, alternativeSources, isEmergency);

  return {
    resourceId,
    resourceName: resource.name,
    requestedQuantity,
    optimalSource,
    alternativeSources,
    optimizationScore,
    recommendations
  };
}

/**
 * Get workflow optimization metrics
 */
export async function getWorkflowMetrics(): Promise<WorkflowMetrics> {
  // Get total requests
  const totalRequests = await prisma.request.count();

  // Get fulfilled requests (delivered or in transit)
  const fulfilledRequests = await prisma.request.count({
    where: {
      status: { in: ['DELIVERED', 'IN_TRANSIT'] }
    }
  });

  // Calculate average fulfillment time (simplified)
  const completedRequests = await prisma.request.findMany({
    where: { status: 'DELIVERED' },
    select: { createdAt: true, updatedAt: true }
  });

  const averageFulfillmentTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, req) => {
        const fulfillmentTime = req.updatedAt.getTime() - req.createdAt.getTime();
        return sum + (fulfillmentTime / (1000 * 60)); // Convert to minutes
      }, 0) / completedRequests.length
    : 0;

  // Calculate resource utilization (simplified - percentage of inventory used)
  const totalInventory = await prisma.inventory.aggregate({
    _sum: { quantity: true }
  });

  const usedInventory = await prisma.request.aggregate({
    where: { status: 'DELIVERED' },
    _sum: { quantity: true }
  });

  const resourceUtilizationRate = totalInventory._sum.quantity && totalInventory._sum.quantity > 0
    ? (usedInventory._sum.quantity || 0) / totalInventory._sum.quantity * 100
    : 0;

  // Calculate optimization efficiency (simplified)
  const optimizationEfficiency = fulfilledRequests > 0 ? (fulfilledRequests / totalRequests) * 100 : 0;

  return {
    totalRequests,
    fulfilledRequests,
    averageFulfillmentTime: Math.round(averageFulfillmentTime),
    resourceUtilizationRate: Math.round(resourceUtilizationRate * 100) / 100,
    optimizationEfficiency: Math.round(optimizationEfficiency * 100) / 100
  };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate estimated delivery time based on distance and emergency status
 */
function calculateEstimatedTime(distance: number, isEmergency: boolean): number {
  // Base time: 30 min + 2 min per km
  let time = 30 + (distance * 2);

  // Emergency reduces time by 30%
  if (isEmergency) {
    time *= 0.7;
  }

  // Add buffer for urban/rural factors (simplified)
  if (distance < 20) {
    time += 10; // Urban traffic
  }

  return Math.round(time);
}

/**
 * Calculate optimization score (0-100)
 */
function calculateOptimizationScore(
  optimalSource: any,
  requestedQuantity: number,
  isEmergency: boolean
): number {
  let score = 100;

  // Distance penalty
  if (optimalSource.distance > 50) score -= 30;
  else if (optimalSource.distance > 25) score -= 15;
  else if (optimalSource.distance > 10) score -= 5;

  // Priority bonus
  if (optimalSource.priority === 'HIGH') score += 10;
  else if (optimalSource.priority === 'LOW') score -= 10;

  // Emergency bonus
  if (isEmergency) score += 5;

  // Availability bonus
  if (optimalSource.availableQuantity >= requestedQuantity * 2) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(
  optimalSource: any,
  alternativeSources: any[],
  isEmergency: boolean
): string[] {
  const recommendations = [];

  if (optimalSource) {
    recommendations.push(`Recommended source: ${optimalSource.hospitalName} (${optimalSource.distance}km, ${optimalSource.estimatedTime}min)`);

    if (isEmergency) {
      recommendations.push("Emergency priority: Expedite delivery and notify receiving hospital");
    }

    if (optimalSource.distance > 30) {
      recommendations.push("Long distance: Consider air ambulance or specialized transport if medically necessary");
    }

    if (alternativeSources.length > 0) {
      recommendations.push(`Alternative sources available: ${alternativeSources.length} option(s)`);
    }
  } else {
    recommendations.push("No optimal source found - consider external procurement");
  }

  return recommendations;
}