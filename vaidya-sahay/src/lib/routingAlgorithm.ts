import { prisma } from "./prisma";

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth ratio in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Assume average speed is 40 km/h in city traffic
function estimateTimeOfArrivalMinutes(distanceKm: number): number {
  return Math.round((distanceKm / 40) * 60);
}

export type RoutingResult = {
  success: boolean;
  hospital?: any;
  availableQuantity?: number;
  distanceKm?: number;
  etaMinutes?: number;
  message: string;
};

export async function findBestResourceSupplier(
  requestingHospitalId: string,
  resourceId: string,
  requiredQuantity: number,
  emergencyPriority: boolean
): Promise<RoutingResult> {
  try {
    // Get requesting hospital
    const requestingHospital = await prisma.hospital.findUnique({
      where: { id: requestingHospitalId }
    });

    if (!requestingHospital) {
      return { success: false, message: "Requesting hospital not found" };
    }

    // 1. Check Main Hospital Inventory first (as per requirements)
    // Find the main hospital for this network
    let mainHospital = null;
    if (requestingHospital.hospitalType === "SUB_BRANCH" && requestingHospital.mainHospitalId) {
      mainHospital = await prisma.hospital.findUnique({
        where: { id: requestingHospital.mainHospitalId }
      });
    } else if (requestingHospital.hospitalType === "MAIN_BRANCH") {
      mainHospital = requestingHospital;
    }

    if (mainHospital && mainHospital.id !== requestingHospitalId) {
      const mainInventory = await prisma.inventory.findFirst({
        where: {
          hospitalId: mainHospital.id,
          resourceId: resourceId
        }
      });

      if (mainInventory && mainInventory.quantity >= requiredQuantity) {
        const distance = calculateDistance(
          requestingHospital.latitude,
          requestingHospital.longitude,
          mainHospital.latitude,
          mainHospital.longitude
        );

        return {
          success: true,
          hospital: mainHospital,
          availableQuantity: mainInventory.quantity,
          distanceKm: distance,
          etaMinutes: estimateTimeOfArrivalMinutes(distance),
          message: `Resource available at Main Branch (${mainHospital.name}). Dispatching immediately.`
        };
      }
    }

    // 2. Scan all sub-branches in the same network
    const networkHospitals = await prisma.hospital.findMany({
      where: {
        OR: [
          { id: requestingHospital.mainHospitalId || requestingHospitalId },
          { mainHospitalId: requestingHospital.mainHospitalId || requestingHospitalId }
        ]
      }
    });

    let bestCandidate: RoutingResult | null = null;
    let bestScore = -Infinity;

    for (const hospital of networkHospitals) {
      // Skip if it's the requesting hospital
      if (hospital.id === requestingHospitalId) continue;

      const inventory = await prisma.inventory.findFirst({
        where: {
          hospitalId: hospital.id,
          resourceId: resourceId
        }
      });

      // Only consider if they have enough quantity (or at least some quantity if it's an emergency)
      if (inventory && inventory.quantity > 0) {
        const distance = calculateDistance(
          requestingHospital.latitude,
          requestingHospital.longitude,
          hospital.latitude,
          hospital.longitude
        );
        const eta = estimateTimeOfArrivalMinutes(distance);
        const isEnough = inventory.quantity >= requiredQuantity;

        // Scoring weights
        const quantityScore = inventory.quantity * 2;
        const distanceScore = -distance * 5; // Closer is better
        const priorityBonus = emergencyPriority && eta < 30 ? 1000 : 0; // Huge bonus if it's an emergency and can arrive in < 30m
        const fullFulfillmentBonus = isEnough ? 500 : 0;

        const totalScore = quantityScore + distanceScore + priorityBonus + fullFulfillmentBonus;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestCandidate = {
            success: true,
            hospital: hospital,
            availableQuantity: inventory.quantity,
            distanceKm: distance,
            etaMinutes: eta,
            message: isEnough
              ? `Best match found: ${hospital.name}. Meets required quantity.`
              : `Partial match found: ${hospital.name}. Only ${inventory.quantity} available.`
          };
        }
      }
    }

    if (bestCandidate) {
      return bestCandidate;
    }

    return { success: false, message: "Resource not available in any branch within the network." };
  } catch (error) {
    console.error("Error in routing algorithm:", error);
    return { success: false, message: "Internal server error during routing." };
  }
}

