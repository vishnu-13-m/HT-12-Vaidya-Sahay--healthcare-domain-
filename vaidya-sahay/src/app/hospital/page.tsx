"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Hospital, Resource, Patient, PatientRecord } from "@/lib/db";
import { RoutingResult } from "@/lib/routingAlgorithm";

interface OptimizationResult {
  resourceId: string;
  resourceName: string;
  requestedQuantity: number;
  optimalSource: {
    hospitalId: string;
    hospitalName: string;
    availableQuantity: number;
    distance: number;
    estimatedTime: number;
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
  optimizationScore: number;
  recommendations: string[];
}

interface WorkflowMetrics {
  totalRequests: number;
  fulfilledRequests: number;
  averageFulfillmentTime: number;
  resourceUtilizationRate: number;
  optimizationEfficiency: number;
}

function WorkflowOptimization({ hospitals, resources }: { hospitals: Hospital[], resources: Resource[] }) {
  const [requestingHospitalId, setRequestingHospitalId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [error, setError] = useState("");

  const optimizeWorkflow = async () => {
    if (!requestingHospitalId || !resourceId || !quantity) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workflow/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestingHospitalId,
          resourceId,
          requestedQuantity: quantity,
          isEmergency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize workflow");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to optimize workflow. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/workflow/optimize?action=metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  useState(() => {
    fetchMetrics();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-green-400 bg-green-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'LOW': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Dashboard */}
      {metrics && (
        <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
          <h3 className="text-xl font-semibold text-white mb-6">Workflow Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{metrics.totalRequests}</div>
              <div className="text-sm text-slate-400">Total Requests</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{metrics.fulfilledRequests}</div>
              <div className="text-sm text-slate-400">Fulfilled</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{metrics.averageFulfillmentTime}min</div>
              <div className="text-sm text-slate-400">Avg Fulfillment</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{metrics.resourceUtilizationRate}%</div>
              <div className="text-sm text-slate-400">Utilization</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-400">{metrics.optimizationEfficiency}%</div>
              <div className="text-sm text-slate-400">Efficiency</div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Form */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
          <h2 className="text-2xl font-semibold mb-6 text-white text-center">
            Optimize Resource Routing
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Requesting Hospital
              </label>
              <select
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                value={requestingHospitalId}
                onChange={(e) => setRequestingHospitalId(e.target.value)}
              >
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Resource Needed
              </label>
              <select
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              >
                <option value="">Select Resource</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="emergency"
                className="mr-2"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
              />
              <label htmlFor="emergency" className="text-sm text-slate-400">
                Emergency Priority
              </label>
            </div>

            <button
              onClick={optimizeWorkflow}
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              {loading ? "Optimizing..." : "Optimize Workflow"}
            </button>

            {error && (
              <p className="text-red-400 mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="glass p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
          {result ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Optimization Results</h3>
                <div className="text-3xl font-bold text-green-400 mb-1">{result.optimizationScore}%</div>
                <div className="text-sm text-slate-400">Optimization Score</div>
              </div>

              {result.optimalSource ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Optimal Source</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-white">{result.optimalSource.hospitalName}</p>
                      <p className="text-slate-400">Distance: {result.optimalSource.distance} km</p>
                      <p className="text-slate-400">ETA: {result.optimalSource.estimatedTime} minutes</p>
                      <p className="text-slate-400">Available: {result.optimalSource.availableQuantity} units</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getPriorityColor(result.optimalSource.priority)}`}>
                        {result.optimalSource.priority} Priority
                      </span>
                    </div>
                  </div>

                  {result.alternativeSources.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Alternative Sources</h4>
                      <div className="space-y-2">
                        {result.alternativeSources.slice(0, 3).map((source, index) => (
                          <div key={index} className="p-3 bg-slate-800/50 rounded border border-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="text-white text-sm">{source.hospitalName}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(source.priority)}`}>
                                {source.priority}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {source.distance}km • {source.estimatedTime}min • {source.availableQuantity} units
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <p>No optimal source found for the requested resource.</p>
                  <p className="text-sm mt-2">Consider checking inventory levels or contacting external suppliers.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Configure optimization parameters to generate intelligent routing recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Request[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);

  const [requestingHospitalId, setRequestingHospitalId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [emergencyPriority, setEmergencyPriority] = useState(false);
  const [notes, setNotes] = useState("");

  // Patient registration form
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState(25);
  const [patientGender, setPatientGender] = useState("MALE");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [patientMedicalHistory, setPatientMedicalHistory] = useState("");
  const [registrationHospitalId, setRegistrationHospitalId] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'approvals' | 'patients' | 'admin' | 'workflow'>('request');
  const [selectedHospital, setSelectedHospital] = useState("");

  useEffect(() => {
    fetchHospitals();
    fetchResources();
  }, []);

  const fetchHospitals = async () => {
    const res = await fetch("/api/hospitals");
    const data = await res.json();
    setHospitals(data);
  };

  const fetchResources = async () => {
    const res = await fetch("/api/resources");
    const data = await res.json();
    setResources(data);
  };

  const fetchRequests = async (hospitalId: string) => {
    const res = await fetch(`/api/resources/request?hospitalId=${hospitalId}`);
    const data = await res.json();
    setRequests(data);
  };

  const fetchPendingApprovals = async (hospitalId: string) => {
    const res = await fetch(`/api/approvals?hospitalId=${hospitalId}`);
    const data = await res.json();
    setPendingApprovals(data);
  };

  const fetchPatients = async (hospitalId: string) => {
    const res = await fetch(`/api/patients?hospitalId=${hospitalId}`);
    const data = await res.json();
    setPatients(data);
  };

  const fetchAdminData = async (hospitalId: string) => {
    const res = await fetch(`/api/admin?hospitalId=${hospitalId}`);
    const data = await res.json();
    setPendingApprovals(data.pendingRequests || []);
    setInventory(data.inventory || []);
    setTotalPatients(data.totalPatients || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/resources/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestingHospitalId,
          resourceId,
          requiredQuantity: quantity,
          emergencyPriority,
          notes
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean, adminId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action: approved ? "APPROVE" : "REJECT",
          adminId,
          notes: approved ? "Approved for dispatch" : "Request rejected"
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Refresh pending approvals
        if (selectedHospital) {
          fetchAdminData(selectedHospital);
        }
        alert(data.message);
      } else {
        alert(data.error || "Approval failed");
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Network error occurred");
    }
  };

  const handlePatientRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patientName,
          age: patientAge,
          gender: patientGender,
          phoneNumber: patientPhone,
          address: patientAddress,
          medicalHistory: patientMedicalHistory,
          hospitalId: registrationHospitalId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        // Reset form
        setPatientName("");
        setPatientAge(25);
        setPatientGender("MALE");
        setPatientPhone("");
        setPatientAddress("");
        setPatientMedicalHistory("");
        setRegistrationHospitalId("");
        // Refresh patients list
        if (registrationHospitalId) {
          fetchPatients(registrationHospitalId);
        }
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering patient:", error);
      alert("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-950/40 text-yellow-400 border-yellow-800';
      case 'APPROVED': return 'bg-blue-950/40 text-blue-400 border-blue-800';
      case 'IN_TRANSIT': return 'bg-purple-950/40 text-purple-400 border-purple-800';
      case 'DELIVERED': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800';
      case 'REJECTED': return 'bg-red-950/40 text-red-400 border-red-800';
      default: return 'bg-slate-950/40 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <header className="mb-12 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Vaidya Sahay
          </h1>
          <p className="text-slate-400 text-sm mt-1">Hospital Resource Network</p>
        </div>
        <Link href="/" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
          Back Home
        </Link>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-3 rounded-lg font-medium transition text-sm ${
            activeTab === 'request'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Request Resources
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 rounded-lg font-medium transition text-sm ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Request History
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-3 rounded-lg font-medium transition text-sm ${
            activeTab === 'approvals'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-3 rounded-lg font-medium transition text-sm ${
            activeTab === 'patients'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Patient Registration
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-3 rounded-lg font-medium transition text-sm ${
            activeTab === 'admin'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Admin Dashboard
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-3 rounded-lg font-medium transition text-sm ${
            activeTab === 'workflow'
              ? 'bg-green-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Workflow Optimization
        </button>
      </div>

      {activeTab === 'request' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">
               Request Medical Resource
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Requesting Hospital
                </label>
                <select
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={requestingHospitalId}
                  onChange={(e) => setRequestingHospitalId(e.target.value)}
                >
                  <option value="" disabled>Select Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.hospitalType === "MAIN_BRANCH" ? "(Main)" : "(Sub-branch)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Resource Needed
                </label>
                <select
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                >
                  <option value="" disabled>Select Resource</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Quantity Required
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the request..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="emergency"
                  className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-800"
                  checked={emergencyPriority}
                  onChange={(e) => setEmergencyPriority(e.target.checked)}
                />
                <label htmlFor="emergency" className="text-sm font-medium text-red-400 cursor-pointer">
                  Emergency Priority Mode (Life-saving)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                  <span className="animate-pulse">Analyzing Routing Options...</span>
                ) : (
                  "Initiate AI Resource Routing"
                )}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-6">
            {result ? (
              <div className={`p-8 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500 ${result.success ? "bg-emerald-950/40 border-emerald-800" : "bg-red-950/40 border-red-800"}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${result.success ? "text-emerald-400" : "text-red-400"}`}>
                  {result.success ? (
                    <><span className="text-2xl">✓</span> Routing Success</>
                  ) : (
                    <><span className="text-2xl">✗</span> Routing Failed</>
                  )}
                </h3>

                <div className="space-y-4">
                  <p className="text-slate-300 font-medium">{result.message}</p>

                  {result.hospital && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Dispatched From:</span>
                        <span className="font-bold text-white">{result.hospital.name}</span>
                      </div>
                      {result.distanceKm !== undefined && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400 text-sm">Distance:</span>
                          <span className="text-white">{result.distanceKm.toFixed(1)} km</span>
                        </div>
                      )}
                      {result.etaMinutes !== undefined && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400 text-sm">ETA:</span>
                          <span className="text-indigo-400 font-bold">{result.etaMinutes} mins</span>
                        </div>
                      )}
                      {result.availableQuantity !== undefined && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                          <span className="text-slate-400 text-sm">Available stock:</span>
                          <span className="text-emerald-400 font-semibold">{result.availableQuantity} Units</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-slate-800/50 border-dashed rounded-2xl bg-slate-900/20">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <p>Select parameters and request resources to generate an intelligent AI routing response based on proximity and inventory.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
            <h3 className="text-xl font-semibold mb-4 text-white">Select Hospital to View Request History</h3>
            <select
              className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value);
                if (e.target.value) {
                  fetchRequests(e.target.value);
                } else {
                  setRequests([]);
                }
              }}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.hospitalType === "MAIN_BRANCH" ? "(Main)" : "(Branch)"}
                </option>
              ))}
            </select>
          </div>

          {requests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Request History</h3>
              {requests.map((request) => (
                <div key={request.id} className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {request.resource.name} ({request.resource.type})
                      </h4>
                      <p className="text-slate-400">Quantity: {request.quantity}</p>
                      <p className="text-slate-400">
                        From: {request.requestingHospital.name} → To: {request.supplyingHospital.name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white ml-2">{new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                    {request.estimatedETA && (
                      <div>
                        <span className="text-slate-400">ETA:</span>
                        <span className="text-indigo-400 ml-2">{request.estimatedETA} mins</span>
                      </div>
                    )}
                    {request.emergencyPriority && (
                      <div>
                        <span className="text-red-400 font-medium">🚨 Emergency Priority</span>
                      </div>
                    )}
                  </div>

                  {request.notes && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">Notes:</span>
                      <p className="text-white text-sm mt-1">{request.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedHospital && requests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No request history found for this hospital.
            </div>
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
            <h3 className="text-xl font-semibold mb-4 text-white">Select Hospital to View Pending Approvals</h3>
            <select
              className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value);
                if (e.target.value) {
                  fetchPendingApprovals(e.target.value);
                } else {
                  setPendingApprovals([]);
                }
              }}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.hospitalType === "MAIN_BRANCH" ? "(Main)" : "(Branch)"}
                </option>
              ))}
            </select>
          </div>

          {pendingApprovals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Pending Approvals</h3>
              {pendingApprovals.map((request) => (
                <div key={request.id} className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {request.resource.name} ({request.resource.type})
                      </h4>
                      <p className="text-slate-400">Quantity: {request.quantity}</p>
                      <p className="text-slate-400">
                        Requested by: {request.requestingHospital.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(request.id, true, "admin1")} // Using admin1 for demo
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(request.id, false, "admin1")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white ml-2">{new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                    {request.estimatedETA && (
                      <div>
                        <span className="text-slate-400">ETA:</span>
                        <span className="text-indigo-400 ml-2">{request.estimatedETA} mins</span>
                      </div>
                    )}
                  </div>

                  {request.emergencyPriority && (
                    <div className="mt-4">
                      <span className="text-red-400 font-medium">🚨 Emergency Priority Request</span>
                    </div>
                  )}

                  {request.notes && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">Request Notes:</span>
                      <p className="text-white text-sm mt-1">{request.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedHospital && pendingApprovals.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No pending approvals for this hospital.
            </div>
          )}
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">
              Patient Registration
            </h2>
            <form onSubmit={handlePatientRegistration} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient's full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="150"
                    className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Gender
                  </label>
                  <select
                    required
                    className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Address
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  placeholder="Enter complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Medical History (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={patientMedicalHistory}
                  onChange={(e) => setPatientMedicalHistory(e.target.value)}
                  placeholder="Enter any relevant medical history"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Registering Hospital
                </label>
                <select
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={registrationHospitalId}
                  onChange={(e) => setRegistrationHospitalId(e.target.value)}
                >
                  <option value="" disabled>Select Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.location})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                  <span className="animate-pulse">Registering Patient...</span>
                ) : (
                  "Register Patient"
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
              <h3 className="text-xl font-semibold mb-4 text-white">Select Hospital to View Patients</h3>
              <select
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedHospital}
                onChange={(e) => {
                  setSelectedHospital(e.target.value);
                  if (e.target.value) {
                    fetchPatients(e.target.value);
                  } else {
                    setPatients([]);
                  }
                }}
              >
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.location})
                  </option>
                ))}
              </select>
            </div>

            {patients.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-xl font-semibold text-white">Registered Patients</h3>
                {patients.map((patientRecord) => (
                  <div key={patientRecord.id} className="glass p-4 rounded-xl border border-slate-800 shadow-lg bg-slate-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{patientRecord.patient.name}</h4>
                        <p className="text-slate-400">ID: {patientRecord.patient.patientId}</p>
                      </div>
                      <span className="text-sm text-slate-400">
                        {new Date(patientRecord.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Age:</span>
                        <span className="text-white ml-2">{patientRecord.patient.age}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Gender:</span>
                        <span className="text-white ml-2">{patientRecord.patient.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white ml-2">{patientRecord.patient.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Status:</span>
                        <span className={`ml-2 ${patientRecord.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {patientRecord.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
            <h3 className="text-xl font-semibold mb-4 text-white">Select Hospital for Admin Dashboard</h3>
            <select
              className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value);
                if (e.target.value) {
                  fetchAdminData(e.target.value);
                } else {
                  setPendingApprovals([]);
                  setInventory([]);
                  setTotalPatients(0);
                }
              }}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.location}) - {h.hospitalType === "MAIN_BRANCH" ? "Main" : "Sub-branch"}
                </option>
              ))}
            </select>
          </div>

          {selectedHospital && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50 text-center">
                <h4 className="text-lg font-semibold text-white mb-2">Total Patients</h4>
                <p className="text-3xl font-bold text-blue-400">{totalPatients}</p>
              </div>
              <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50 text-center">
                <h4 className="text-lg font-semibold text-white mb-2">Pending Approvals</h4>
                <p className="text-3xl font-bold text-yellow-400">{pendingApprovals.length}</p>
              </div>
              <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50 text-center">
                <h4 className="text-lg font-semibold text-white mb-2">Inventory Items</h4>
                <p className="text-3xl font-bold text-green-400">{inventory.length}</p>
              </div>
            </div>
          )}

          {pendingApprovals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Pending Resource Requests</h3>
              {pendingApprovals.map((request) => (
                <div key={request.id} className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {request.resource.name} ({request.resource.type})
                      </h4>
                      <p className="text-slate-400">Quantity: {request.quantity}</p>
                      <p className="text-slate-400">
                        Requested by: {request.requestingHospital.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(request.id, true, "admin1")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(request.id, false, "admin1")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white ml-2">{new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                    {request.estimatedETA && (
                      <div>
                        <span className="text-slate-400">ETA:</span>
                        <span className="text-indigo-400 ml-2">{request.estimatedETA} mins</span>
                      </div>
                    )}
                  </div>

                  {request.emergencyPriority && (
                    <div className="mt-4">
                      <span className="text-red-400 font-medium">🚨 Emergency Priority Request</span>
                    </div>
                  )}

                  {request.notes && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">Request Notes:</span>
                      <p className="text-white text-sm mt-1">{request.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {inventory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Hospital Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <div key={item.id} className="glass p-4 rounded-xl border border-slate-800 shadow-lg bg-slate-900/50">
                    <h4 className="text-lg font-semibold text-white mb-2">{item.resource.name}</h4>
                    <p className="text-slate-400 text-sm mb-1">{item.resource.type}</p>
                    <p className="text-2xl font-bold text-green-400">{item.quantity} {item.resource.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'workflow' && (
        <WorkflowOptimization hospitals={hospitals} resources={resources} />
      )}
    </div>
  );
}
