import { NextRequest, NextResponse } from "next/server";

interface DiagnosisResult {
  conditions: Array<{
    name: string;
    probability: number;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
  }>;
  overallRisk: 'low' | 'medium' | 'high';
}

// Simple rule-based diagnosis system
// In a real application, this would be replaced with AI/ML models
const symptomToConditions: Record<string, Array<{
  condition: string;
  weight: number;
  description: string;
  recommendations: string[];
}>> = {
  "fever": [
    { condition: "Viral Infection", weight: 0.8, description: "Common viral infections like flu or common cold", recommendations: ["Rest and hydration", "Over-the-counter fever reducers", "Monitor temperature", "Seek medical attention if fever >103°F"] },
    { condition: "Bacterial Infection", weight: 0.6, description: "Bacterial infections requiring antibiotics", recommendations: ["Consult a doctor", "Complete prescribed antibiotics", "Rest and fluids"] },
    { condition: "COVID-19", weight: 0.4, description: "Respiratory infection caused by SARS-CoV-2", recommendations: ["Get tested", "Isolate if positive", "Monitor symptoms closely"] }
  ],
  "headache": [
    { condition: "Tension Headache", weight: 0.7, description: "Most common type of headache", recommendations: ["Rest in a quiet room", "Apply cold or warm compress", "Over-the-counter pain relievers"] },
    { condition: "Migraine", weight: 0.5, description: "Severe headache with additional symptoms", recommendations: ["Identify triggers", "Use prescribed migraine medication", "Rest in dark room"] },
    { condition: "Dehydration", weight: 0.4, description: "Headache caused by insufficient fluid intake", recommendations: ["Increase water intake", "Rest and hydrate", "Electrolyte drinks if needed"] }
  ],
  "fatigue": [
    { condition: "Anemia", weight: 0.6, description: "Low red blood cell count", recommendations: ["Iron-rich diet", "Blood tests", "Consult doctor for supplements"] },
    { condition: "Sleep Apnea", weight: 0.5, description: "Breathing interruptions during sleep", recommendations: ["Maintain healthy weight", "Sleep study", "CPAP therapy if diagnosed"] },
    { condition: "Depression", weight: 0.4, description: "Mental health condition causing persistent fatigue", recommendations: ["Talk therapy", "Exercise regularly", "Consider medication"] }
  ],
  "cough": [
    { condition: "Common Cold", weight: 0.8, description: "Viral upper respiratory infection", recommendations: ["Rest and fluids", "Honey and lemon", "Over-the-counter cold medicine"] },
    { condition: "Bronchitis", weight: 0.6, description: "Inflammation of the bronchial tubes", recommendations: ["Humidifier", "Cough syrup", "Avoid irritants"] },
    { condition: "Asthma", weight: 0.4, description: "Chronic respiratory condition", recommendations: ["Use inhaler as prescribed", "Avoid triggers", "Regular check-ups"] }
  ],
  "chest pain": [
    { condition: "Heart Attack", weight: 0.9, description: "Emergency medical condition", recommendations: ["Call emergency services immediately", "Do not drive yourself", "CPR if person is unconscious"] },
    { condition: "Angina", weight: 0.7, description: "Chest pain due to reduced blood flow to heart", recommendations: ["Rest immediately", "Use prescribed nitroglycerin", "Call doctor"] },
    { condition: "GERD", weight: 0.3, description: "Acid reflux causing chest discomfort", recommendations: ["Avoid trigger foods", "Eat smaller meals", "Antacids"] }
  ]
};

function getRiskLevel(probability: number): 'low' | 'medium' | 'high' {
  if (probability >= 0.7) return 'high';
  if (probability >= 0.4) return 'medium';
  return 'low';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms }: { symptoms: string[] } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: "Symptoms array is required" }, { status: 400 });
    }

    // Normalize symptoms to lowercase
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase());

    // Calculate condition scores
    const conditionScores: Record<string, {
      totalScore: number;
      count: number;
      description: string;
      recommendations: string[];
    }> = {};

    for (const symptom of normalizedSymptoms) {
      const conditions = symptomToConditions[symptom];
      if (conditions) {
        for (const { condition, weight, description, recommendations } of conditions) {
          if (!conditionScores[condition]) {
            conditionScores[condition] = {
              totalScore: 0,
              count: 0,
              description,
              recommendations
            };
          }
          conditionScores[condition].totalScore += weight;
          conditionScores[condition].count += 1;
        }
      }
    }

    // Convert to final results
    const conditions = Object.entries(conditionScores)
      .map(([name, data]) => ({
        name,
        probability: Math.min(data.totalScore / data.count, 1), // Cap at 1
        riskLevel: getRiskLevel(data.totalScore / data.count),
        description: data.description,
        recommendations: data.recommendations
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // Top 5 conditions

    // Calculate overall risk
    const maxProbability = Math.max(...conditions.map(c => c.probability));
    const overallRisk = getRiskLevel(maxProbability);

    const result: DiagnosisResult = {
      conditions,
      overallRisk
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Diagnosis analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}