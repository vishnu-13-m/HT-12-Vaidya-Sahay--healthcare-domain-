"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Patient {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string;
}

interface PatientRecord {
  id: string;
  patient: Patient;
  hospital: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<'register' | 'view'>('register');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    medicalHistory: '',
    hospitalId: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      setHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchPatients = async (hospitalId: string) => {
    try {
      const res = await fetch(`/api/patients?hospitalId=${hospitalId}`);
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({
          name: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: '', medicalHistory: '', hospitalId: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (patientId: string, hospitalId: string) => {
    if (!confirm('Are you sure you want to delete this patient record? It can be restored if records exist in other branches.')) {
      return;
    }

    try {
      const res = await fetch(`/api/patients/action?patientId=${patientId}&hospitalId=${hospitalId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        // Refresh patients list
        if (formData.hospitalId) {
          fetchPatients(formData.hospitalId);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Deletion failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const handleRestoreRecord = async (patientId: string, hospitalId: string) => {
    try {
      const res = await fetch(`/api/patients/action?patientId=${patientId}&hospitalId=${hospitalId}`, {
        method: 'PATCH'
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        // Refresh patients list
        if (formData.hospitalId) {
          fetchPatients(formData.hospitalId);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Restoration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <header className="mb-12 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Vaidya Sahay
          </h1>
          <p className="text-slate-400 text-sm mt-1">Patient Management System</p>
        </div>
        <Link href="/" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
          Back Home
        </Link>
      </header>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'register'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Patient Registration
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'view'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          View Patients
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-400' : 'bg-red-950/40 border border-red-800 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {activeTab === 'register' && (
        <div className="glass p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50 max-w-4xl">
          <h2 className="text-2xl font-semibold mb-6 text-white text-center">
            Register New Patient
          </h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Gender
                </label>
                <select
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Registration Hospital *
                </label>
                <select
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.hospitalType === "MAIN_BRANCH" ? "(Main)" : "(Branch)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Address
              </label>
              <textarea
                rows={3}
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Medical History
              </label>
              <textarea
                rows={4}
                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                placeholder="Enter any relevant medical history, allergies, or previous conditions..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <span className="animate-pulse">Registering Patient...</span>
              ) : (
                "Register Patient (Distributed Across Network)"
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
            <h3 className="text-xl font-semibold mb-4 text-white">Select Hospital to View Patients</h3>
            <select
              className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.hospitalId}
              onChange={(e) => {
                setFormData({...formData, hospitalId: e.target.value});
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
                  {h.name} {h.hospitalType === "MAIN_BRANCH" ? "(Main)" : "(Branch)"}
                </option>
              ))}
            </select>
          </div>

          {patients.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Registered Patients</h3>
              {patients.map((record) => (
                <div key={record.id} className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{record.patient.name}</h4>
                      <p className="text-slate-400">ID: {record.patient.uniqueId}</p>
                      <p className="text-slate-400">Email: {record.patient.email}</p>
                      {record.patient.phoneNumber && <p className="text-slate-400">Phone: {record.patient.phoneNumber}</p>}
                    </div>
                    <div className="flex space-x-2">
                      {!record.isActive && (
                        <button
                          onClick={() => handleRestoreRecord(record.patient.id, record.hospital.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecord(record.patient.id, record.hospital.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                      >
                        {record.isActive ? 'Delete' : 'Permanently Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {record.patient.dateOfBirth && (
                      <div>
                        <span className="text-slate-400">Date of Birth:</span>
                        <span className="text-white ml-2">{new Date(record.patient.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {record.patient.gender && (
                      <div>
                        <span className="text-slate-400">Gender:</span>
                        <span className="text-white ml-2">{record.patient.gender}</span>
                      </div>
                    )}
                    {record.patient.address && (
                      <div className="md:col-span-2">
                        <span className="text-slate-400">Address:</span>
                        <span className="text-white ml-2">{record.patient.address}</span>
                      </div>
                    )}
                    {record.patient.medicalHistory && (
                      <div className="md:col-span-2">
                        <span className="text-slate-400">Medical History:</span>
                        <p className="text-white ml-2 mt-1">{record.patient.medicalHistory}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.isActive
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950/40 text-red-400 border border-red-800'
                    }`}>
                      {record.isActive ? 'Active' : 'Deleted'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.hospitalId && patients.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No patient records found for this hospital.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
