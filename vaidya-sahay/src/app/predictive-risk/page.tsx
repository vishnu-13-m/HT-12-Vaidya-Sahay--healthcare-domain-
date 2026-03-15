"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory?: string;
}

export default function PredictiveRisk() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = await response.json();
        // Assuming the API returns patients array
        setPatients(data.patients || data);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  const assessRisk = async () => {
    if (!selectedPatientId) {
      setError("Please select a patient");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/risk/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: selectedPatientId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assess risk");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to assess risk. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Predictive Risk Monitoring</h1>
          <p className="text-slate-300 text-lg">
            Analyze patient health data to predict potential health risks and provide preventive recommendations
          </p>
        </div>

        {/* Patient Selection */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Select Patient</h2>

          <div className="flex gap-4 mb-4">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="">Select a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.patientId}, Age: {patient.age})
                </option>
              ))}
            </select>

            <button
              onClick={assessRisk}
              disabled={loading || !selectedPatientId}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              {loading ? "Analyzing..." : "Assess Risk"}
            </button>
          </div>

          {error && (
            <p className="text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">Risk Assessment Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diabetes Risk */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${getRiskColor(result.diabetes.level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Diabetes Risk</h3>
                  <span className="text-2xl font-bold">{result.diabetes.score}%</span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-current h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.diabetes.score}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.diabetes.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Heart Disease Risk */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${getRiskColor(result.heartDisease.level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Heart Disease Risk</h3>
                  <span className="text-2xl font-bold">{result.heartDisease.score}%</span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-current h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.heartDisease.score}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.heartDisease.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hypertension Risk */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${getRiskColor(result.hypertension.level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Hypertension Risk</h3>
                  <span className="text-2xl font-bold">{result.hypertension.score}%</span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-current h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.hypertension.score}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.hypertension.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Respiratory Risk */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${getRiskColor(result.respiratory.level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Respiratory Issues Risk</h3>
                  <span className="text-2xl font-bold">{result.respiratory.score}%</span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-current h-3 rounded-full transition-all duration-500"
                      style={{ width: `${result.respiratory.score}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.respiratory.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Overall Health Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(result.diabetes.score)}`}>
                    {result.diabetes.score}%
                  </div>
                  <div className="text-sm text-slate-400">Diabetes</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(result.heartDisease.score)}`}>
                    {result.heartDisease.score}%
                  </div>
                  <div className="text-sm text-slate-400">Heart Disease</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(result.hypertension.score)}`}>
                    {result.hypertension.score}%
                  </div>
                  <div className="text-sm text-slate-400">Hypertension</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(result.respiratory.score)}`}>
                    {result.respiratory.score}%
                  </div>
                  <div className="text-sm text-slate-400">Respiratory</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Important:</strong> This assessment is for informational purposes only and should not replace professional medical advice.
                Please consult healthcare providers for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}