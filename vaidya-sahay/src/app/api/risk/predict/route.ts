import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RiskAssessment {
  diabetes: {
    score: number;
    level: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  heartDisease: {
    score: number;
    level: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  hypertension: {
    score: number;
    level: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  respiratory: {
    score: number;
    level: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function calculateDiabetesRisk(age: number, medicalHistory: string = ""): { score: number; recommendations: string[] } {
  let score = 0;

  // Age factor
  if (age > 45) score += 30;
  else if (age > 35) score += 20;
  else if (age > 25) score += 10;

  // Medical history factors
  const history = medicalHistory.toLowerCase();
  if (history.includes('diabetes') || history.includes('high blood sugar')) score += 40;
  if (history.includes('obesity') || history.includes('overweight')) score += 25;
  if (history.includes('family history') || history.includes('genetic')) score += 20;
  if (history.includes('gestational diabetes')) score += 15;

  score = Math.min(score, 100);

  const recommendations = [];
  if (score >= 70) {
    recommendations.push("Schedule immediate consultation with endocrinologist");
    recommendations.push("Get comprehensive blood glucose testing");
    recommendations.push("Start lifestyle modifications immediately");
  } else if (score >= 40) {
    recommendations.push("Annual diabetes screening");
    recommendations.push("Weight management and regular exercise");
    recommendations.push("Balanced diet with controlled carbohydrates");
  } else {
    recommendations.push("Maintain healthy lifestyle");
    recommendations.push("Regular health check-ups");
    recommendations.push("Monitor blood sugar levels periodically");
  }

  return { score, recommendations };
}

function calculateHeartDiseaseRisk(age: number, gender: string, medicalHistory: string = ""): { score: number; recommendations: string[] } {
  let score = 0;

  // Age and gender factors
  if (gender.toLowerCase() === 'male') {
    if (age > 45) score += 25;
    else if (age > 35) score += 15;
  } else {
    if (age > 55) score += 25;
    else if (age > 45) score += 15;
  }

  // Medical history factors
  const history = medicalHistory.toLowerCase();
  if (history.includes('hypertension') || history.includes('high blood pressure')) score += 30;
  if (history.includes('cholesterol') || history.includes('hyperlipidemia')) score += 25;
  if (history.includes('smoking') || history.includes('tobacco')) score += 20;
  if (history.includes('diabetes')) score += 15;
  if (history.includes('family history') || history.includes('heart disease')) score += 20;

  score = Math.min(score, 100);

  const recommendations = [];
  if (score >= 70) {
    recommendations.push("Immediate cardiology consultation");
    recommendations.push("Cardiac risk assessment and stress testing");
    recommendations.push("Aggressive risk factor modification");
  } else if (score >= 40) {
    recommendations.push("Regular blood pressure monitoring");
    recommendations.push("Cholesterol and lipid profile testing");
    recommendations.push("Quit smoking if applicable");
    recommendations.push("Regular exercise and heart-healthy diet");
  } else {
    recommendations.push("Annual cardiovascular risk assessment");
    recommendations.push("Maintain healthy blood pressure");
    recommendations.push("Regular physical activity");
  }

  return { score, recommendations };
}

function calculateHypertensionRisk(age: number, medicalHistory: string = ""): { score: number; recommendations: string[] } {
  let score = 0;

  // Age factor
  if (age > 50) score += 25;
  else if (age > 40) score += 15;
  else if (age > 30) score += 10;

  // Medical history factors
  const history = medicalHistory.toLowerCase();
  if (history.includes('hypertension') || history.includes('high blood pressure')) score += 40;
  if (history.includes('kidney disease') || history.includes('renal')) score += 25;
  if (history.includes('diabetes')) score += 15;
  if (history.includes('obesity')) score += 15;
  if (history.includes('stress') || history.includes('anxiety')) score += 10;

  score = Math.min(score, 100);

  const recommendations = [];
  if (score >= 70) {
    recommendations.push("Immediate blood pressure evaluation");
    recommendations.push("24-hour ambulatory blood pressure monitoring");
    recommendations.push("Consultation with hypertension specialist");
  } else if (score >= 40) {
    recommendations.push("Regular home blood pressure monitoring");
    recommendations.push("Dietary changes (DASH diet)");
    recommendations.push("Weight reduction if overweight");
    recommendations.push("Stress management techniques");
  } else {
    recommendations.push("Annual blood pressure screening");
    recommendations.push("Healthy diet and regular exercise");
    recommendations.push("Limit salt intake");
  }

  return { score, recommendations };
}

function calculateRespiratoryRisk(age: number, medicalHistory: string = ""): { score: number; recommendations: string[] } {
  let score = 0;

  // Age factor
  if (age > 60) score += 20;
  else if (age > 40) score += 10;

  // Medical history factors
  const history = medicalHistory.toLowerCase();
  if (history.includes('asthma') || history.includes('copd') || history.includes('bronchitis')) score += 35;
  if (history.includes('smoking') || history.includes('tobacco')) score += 30;
  if (history.includes('allergy') || history.includes('hay fever')) score += 15;
  if (history.includes('pneumonia') || history.includes('respiratory infection')) score += 20;
  if (history.includes('occupational exposure') || history.includes('chemical exposure')) score += 15;

  score = Math.min(score, 100);

  const recommendations = [];
  if (score >= 70) {
    recommendations.push("Immediate pulmonary evaluation");
    recommendations.push("Pulmonary function testing");
    recommendations.push("Smoking cessation program if applicable");
  } else if (score >= 40) {
    recommendations.push("Regular respiratory check-ups");
    recommendations.push("Avoid environmental triggers");
    recommendations.push("Annual flu vaccination");
    recommendations.push("Pneumococcal vaccination");
  } else {
    recommendations.push("Maintain good respiratory hygiene");
    recommendations.push("Regular exercise to improve lung capacity");
    recommendations.push("Avoid exposure to pollutants");
  }

  return { score, recommendations };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId }: { patientId: string } = body;

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Fetch patient data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Calculate risks based on patient data
    const diabetes = calculateDiabetesRisk(patient.age, patient.medicalHistory || "");
    const heartDisease = calculateHeartDiseaseRisk(patient.age, patient.gender, patient.medicalHistory || "");
    const hypertension = calculateHypertensionRisk(patient.age, patient.medicalHistory || "");
    const respiratory = calculateRespiratoryRisk(patient.age, patient.medicalHistory || "");

    const result: RiskAssessment = {
      diabetes: {
        score: diabetes.score,
        level: getRiskLevel(diabetes.score),
        recommendations: diabetes.recommendations
      },
      heartDisease: {
        score: heartDisease.score,
        level: getRiskLevel(heartDisease.score),
        recommendations: heartDisease.recommendations
      },
      hypertension: {
        score: hypertension.score,
        level: getRiskLevel(hypertension.score),
        recommendations: hypertension.recommendations
      },
      respiratory: {
        score: respiratory.score,
        level: getRiskLevel(respiratory.score),
        recommendations: respiratory.recommendations
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Risk prediction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}