"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function EarlyDiagnosis() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");

  const commonSymptoms = [
    "Fever", "Headache", "Fatigue", "Cough", "Sore throat", "Nausea", "Vomiting",
    "Diarrhea", "Chest pain", "Shortness of breath", "Dizziness", "Joint pain",
    "Muscle pain", "Loss of appetite", "Weight loss", "Rash", "Abdominal pain"
  ];

  const addSymptom = (symptom: string) => {
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setCurrentSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      setError("Please add at least one symptom");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/diagnosis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze symptoms");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to analyze symptoms. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Early Diagnosis</h1>
          <p className="text-slate-300 text-lg">
            Enter your symptoms to get AI-powered health insights and early diagnosis suggestions
          </p>
        </div>

        {/* Symptom Input */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Enter Your Symptoms</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentSymptom}
              onChange={(e) => setCurrentSymptom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSymptom(currentSymptom)}
              placeholder="Type a symptom..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={() => addSymptom(currentSymptom)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>

          {/* Common Symptoms */}
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Common symptoms:</p>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Symptoms */}
          {symptoms.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Selected symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm flex items-center gap-2"
                  >
                    {symptom}
                    <button
                      onClick={() => removeSymptom(symptom)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={analyzeSymptoms}
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze Symptoms"}
          </button>

          {error && (
            <p className="text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold">Analysis Results</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(result.overallRisk)}`}>
                Overall Risk: {result.overallRisk.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4">
              {result.conditions.map((condition, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-blue-400">{condition.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${getRiskColor(condition.riskLevel)}`}>
                        {condition.riskLevel.toUpperCase()}
                      </span>
                      <span className="text-sm text-slate-400">
                        {Math.round(condition.probability * 100)}% probability
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-3">{condition.description}</p>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {condition.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Important:</strong> This is not a substitute for professional medical advice.
                Please consult a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}