export type Hospital = {
  id: string;
  name: string;
  hospitalType: string; // "MAIN_BRANCH" or "SUB_BRANCH"
  mainHospitalId?: string;
  location: string;
  latitude: number;
  longitude: number;
  address: string;
  contactNumber: string;
  distanceFromMain?: number;
  estimatedDeliveryTime?: number;
};

export type HospitalAdmin = {
  id: string;
  hospitalId: string;
  name: string;
  email: string;
  role: string;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  description?: string;
  unit: string;
};

export type InventoryItem = {
  id: string;
  hospitalId: string;
  resourceId: string;
  quantity: number;
};

export type Patient = {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phoneNumber: string;
  address: string;
  medicalHistory?: string;
};

export type PatientRecord = {
  id: string;
  patientId: string;
  hospitalId: string;
  isActive: boolean;
  deletedAt?: Date;
  registrationDate: Date;
};

export type Request = {
  id: string;
  resourceId: string;
  requestingHospitalId: string;
  supplyingHospitalId?: string;
  quantity: number;
  status: string;
  emergencyPriority: boolean;
  estimatedETA?: number;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
};

// AIIMS Hospital Network in Delhi
export const MOCK_HOSPITALS: Hospital[] = [
  // AIIMS Main Branch
  {
    id: "aiims-main",
    name: "AIIMS Delhi Main Hospital",
    hospitalType: "MAIN_BRANCH",
    location: "New Delhi",
    latitude: 28.5672,
    longitude: 77.2100,
    address: "Ansari Nagar, New Delhi - 110029",
    contactNumber: "011-26588500",
  },
  // AIIMS Sub-branches
  {
    id: "aiims-trauma",
    name: "AIIMS Trauma Center",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "aiims-main",
    location: "New Delhi",
    latitude: 28.5675,
    longitude: 77.2105,
    address: "AIIMS Campus, New Delhi - 110029",
    contactNumber: "011-26588501",
    distanceFromMain: 0.5,
    estimatedDeliveryTime: 5,
  },
  {
    id: "aiims-cardiac",
    name: "AIIMS Cardiac Sciences",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "aiims-main",
    location: "New Delhi",
    latitude: 28.5678,
    longitude: 77.2110,
    address: "Cardiac Block, AIIMS Campus, New Delhi - 110029",
    contactNumber: "011-26588502",
    distanceFromMain: 0.8,
    estimatedDeliveryTime: 8,
  },
  {
    id: "aiims-neuro",
    name: "AIIMS Neurosciences Center",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "aiims-main",
    location: "New Delhi",
    latitude: 28.5680,
    longitude: 77.2115,
    address: "Neurosciences Block, AIIMS Campus, New Delhi - 110029",
    contactNumber: "011-26588503",
    distanceFromMain: 1.0,
    estimatedDeliveryTime: 10,
  },

  // Apollo Hospitals Network in Chennai
  {
    id: "apollo-chennai-main",
    name: "Apollo Hospitals Chennai Main",
    hospitalType: "MAIN_BRANCH",
    location: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
    address: "21 Greams Lane, Off Greams Road, Chennai - 600006",
    contactNumber: "044-28290200",
  },
  {
    id: "apollo-chennai-heart",
    name: "Apollo Heart Institute Chennai",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "apollo-chennai-main",
    location: "Chennai",
    latitude: 13.0830,
    longitude: 80.2710,
    address: "Heart Institute, 21 Greams Lane, Chennai - 600006",
    contactNumber: "044-28290201",
    distanceFromMain: 0.3,
    estimatedDeliveryTime: 3,
  },
  {
    id: "apollo-chennai-cancer",
    name: "Apollo Cancer Center Chennai",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "apollo-chennai-main",
    location: "Chennai",
    latitude: 13.0835,
    longitude: 80.2715,
    address: "Cancer Center, 21 Greams Lane, Chennai - 600006",
    contactNumber: "044-28290202",
    distanceFromMain: 0.6,
    estimatedDeliveryTime: 6,
  },

  // Apollo Hospitals Network in Hyderabad
  {
    id: "apollo-hyderabad-main",
    name: "Apollo Hospitals Hyderabad Main",
    hospitalType: "MAIN_BRANCH",
    location: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
    address: "Jubilee Hills, Hyderabad - 500033",
    contactNumber: "040-23607777",
  },
  {
    id: "apollo-hyderabad-drdo",
    name: "Apollo DRDO Hospital Hyderabad",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "apollo-hyderabad-main",
    location: "Hyderabad",
    latitude: 17.3855,
    longitude: 78.4870,
    address: "DRDO Township, Kanchanbagh, Hyderabad - 500058",
    contactNumber: "040-24340000",
    distanceFromMain: 8.5,
    estimatedDeliveryTime: 25,
  },

  // Fortis Healthcare Network in Delhi NCR
  {
    id: "fortis-delhi-main",
    name: "Fortis Hospital Shalimar Bagh Delhi",
    hospitalType: "MAIN_BRANCH",
    location: "New Delhi",
    latitude: 28.7166,
    longitude: 77.1637,
    address: "AA-299, Shaheed Udham Singh Marg, Near TV Tower, Shalimar Bagh, Delhi - 110088",
    contactNumber: "011-45302222",
  },
  {
    id: "fortis-noida",
    name: "Fortis Hospital Noida",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "fortis-delhi-main",
    location: "Noida",
    latitude: 28.5677,
    longitude: 77.3210,
    address: "B-22, Sector 62, Noida - 201301",
    contactNumber: "0120-2400222",
    distanceFromMain: 15.2,
    estimatedDeliveryTime: 35,
  },
  {
    id: "fortis-gurgaon",
    name: "Fortis Memorial Research Institute Gurgaon",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "fortis-delhi-main",
    location: "Gurgaon",
    latitude: 28.4595,
    longitude: 77.0266,
    address: "Sector 44, Opposite HUDA City Centre, Gurgaon - 122002",
    contactNumber: "0124-4962200",
    distanceFromMain: 22.8,
    estimatedDeliveryTime: 45,
  },

  // Government Primary Health Centres
  {
    id: "gov-phc-delhi-main",
    name: "Government District Hospital Delhi",
    hospitalType: "MAIN_BRANCH",
    location: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    address: "Connaught Place, New Delhi - 110001",
    contactNumber: "011-23381428",
  },
  {
    id: "gov-phc-rohini",
    name: "Primary Health Centre Rohini",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "gov-phc-delhi-main",
    location: "Delhi",
    latitude: 28.7325,
    longitude: 77.1200,
    address: "Sector 15, Rohini, Delhi - 110085",
    contactNumber: "011-27554444",
    distanceFromMain: 18.5,
    estimatedDeliveryTime: 40,
  },
  {
    id: "gov-phc-dwarka",
    name: "Primary Health Centre Dwarka",
    hospitalType: "SUB_BRANCH",
    mainHospitalId: "gov-phc-delhi-main",
    location: "Delhi",
    latitude: 28.5823,
    longitude: 77.0500,
    address: "Sector 11, Dwarka, Delhi - 110075",
    contactNumber: "011-25081444",
    distanceFromMain: 12.3,
    estimatedDeliveryTime: 28,
  },
];

export const MOCK_HOSPITAL_ADMINS: HospitalAdmin[] = [
  // AIIMS Admins
  {
    id: "admin-aiims-main",
    hospitalId: "aiims-main",
    name: "Dr. Randeep Guleria",
    email: "randeep.guleria@aiims.edu",
    role: "ADMIN",
  },
  {
    id: "admin-aiims-trauma",
    hospitalId: "aiims-trauma",
    name: "Dr. Sushma Sagar",
    email: "sushma.sagar@aiims.edu",
    role: "ADMIN",
  },

  // Apollo Chennai Admins
  {
    id: "admin-apollo-chennai",
    hospitalId: "apollo-chennai-main",
    name: "Dr. Prathap Reddy",
    email: "prathap.reddy@apollohospitals.com",
    role: "ADMIN",
  },
  {
    id: "admin-apollo-hyderabad",
    hospitalId: "apollo-hyderabad-main",
    name: "Dr. Sangita Reddy",
    email: "sangita.reddy@apollohospitals.com",
    role: "ADMIN",
  },

  // Fortis Admins
  {
    id: "admin-fortis-delhi",
    hospitalId: "fortis-delhi-main",
    name: "Dr. Ashutosh Raghuvanshi",
    email: "ashutosh.raghuvanshi@fortishealthcare.com",
    role: "ADMIN",
  },

  // Government Hospital Admins
  {
    id: "admin-gov-delhi",
    hospitalId: "gov-phc-delhi-main",
    name: "Dr. Rajesh Bhushan",
    email: "rajesh.bhushan@gov.in",
    role: "ADMIN",
  },
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: "r1",
    name: "O+ Blood",
    type: "Blood",
    description: "O Positive Blood Units",
    unit: "units"
  },
  {
    id: "r2",
    name: "O- Blood",
    type: "Blood",
    description: "O Negative Blood Units (Universal Donor)",
    unit: "units"
  },
  {
    id: "r3",
    name: "Oxygen Cylinder (50L)",
    type: "Equipment",
    description: "Medical grade oxygen cylinder",
    unit: "cylinders"
  },
  {
    id: "r4",
    name: "Ventilator",
    type: "Equipment",
    description: "Mechanical ventilator for ICU",
    unit: "units"
  },
  {
    id: "r5",
    name: "Remdesivir 100mg",
    type: "Medicine",
    description: "Antiviral injection for COVID-19 treatment",
    unit: "vials"
  },
  {
    id: "r6",
    name: "A+ Blood",
    type: "Blood",
    description: "A Positive Blood Units",
    unit: "units"
  },
  {
    id: "r7",
    name: "B+ Blood",
    type: "Blood",
    description: "B Positive Blood Units",
    unit: "units"
  },
  {
    id: "r8",
    name: "AB+ Blood",
    type: "Blood",
    description: "AB Positive Blood Units (Universal Recipient)",
    unit: "units"
  },
  {
    id: "r9",
    name: "Surgical Masks (N95)",
    type: "Equipment",
    description: "N95 grade surgical masks",
    unit: "boxes"
  },
  {
    id: "r10",
    name: "ICU Bed",
    type: "Equipment",
    description: "Intensive Care Unit bed with monitoring",
    unit: "beds"
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  // AIIMS Main Hospital - Well stocked
  { id: "i-aiims-main-1", hospitalId: "aiims-main", resourceId: "r1", quantity: 150 },
  { id: "i-aiims-main-2", hospitalId: "aiims-main", resourceId: "r2", quantity: 100 },
  { id: "i-aiims-main-3", hospitalId: "aiims-main", resourceId: "r3", quantity: 50 },
  { id: "i-aiims-main-4", hospitalId: "aiims-main", resourceId: "r4", quantity: 20 },
  { id: "i-aiims-main-5", hospitalId: "aiims-main", resourceId: "r5", quantity: 500 },
  { id: "i-aiims-main-6", hospitalId: "aiims-main", resourceId: "r6", quantity: 120 },
  { id: "i-aiims-main-7", hospitalId: "aiims-main", resourceId: "r7", quantity: 90 },
  { id: "i-aiims-main-8", hospitalId: "aiims-main", resourceId: "r8", quantity: 60 },
  { id: "i-aiims-main-9", hospitalId: "aiims-main", resourceId: "r9", quantity: 1000 },
  { id: "i-aiims-main-10", hospitalId: "aiims-main", resourceId: "r10", quantity: 30 },

  // AIIMS Trauma Center
  { id: "i-aiims-trauma-1", hospitalId: "aiims-trauma", resourceId: "r1", quantity: 80 },
  { id: "i-aiims-trauma-2", hospitalId: "aiims-trauma", resourceId: "r2", quantity: 60 },
  { id: "i-aiims-trauma-3", hospitalId: "aiims-trauma", resourceId: "r3", quantity: 25 },
  { id: "i-aiims-trauma-4", hospitalId: "aiims-trauma", resourceId: "r4", quantity: 8 },
  { id: "i-aiims-trauma-5", hospitalId: "aiims-trauma", resourceId: "r5", quantity: 200 },
  { id: "i-aiims-trauma-9", hospitalId: "aiims-trauma", resourceId: "r9", quantity: 300 },

  // AIIMS Cardiac Sciences
  { id: "i-aiims-cardiac-2", hospitalId: "aiims-cardiac", resourceId: "r2", quantity: 40 },
  { id: "i-aiims-cardiac-3", hospitalId: "aiims-cardiac", resourceId: "r3", quantity: 15 },
  { id: "i-aiims-cardiac-4", hospitalId: "aiims-cardiac", resourceId: "r4", quantity: 6 },
  { id: "i-aiims-cardiac-5", hospitalId: "aiims-cardiac", resourceId: "r5", quantity: 150 },
  { id: "i-aiims-cardiac-7", hospitalId: "aiims-cardiac", resourceId: "r7", quantity: 25 },
  { id: "i-aiims-cardiac-8", hospitalId: "aiims-cardiac", resourceId: "r8", quantity: 15 },
  { id: "i-aiims-cardiac-10", hospitalId: "aiims-cardiac", resourceId: "r10", quantity: 6 },

  // AIIMS Neurosciences
  { id: "i-aiims-neuro-1", hospitalId: "aiims-neuro", resourceId: "r1", quantity: 22 },
  { id: "i-aiims-neuro-3", hospitalId: "aiims-neuro", resourceId: "r3", quantity: 8 },
  { id: "i-aiims-neuro-4", hospitalId: "aiims-neuro", resourceId: "r4", quantity: 4 },
  { id: "i-aiims-neuro-6", hospitalId: "aiims-neuro", resourceId: "r6", quantity: 18 },
  { id: "i-aiims-neuro-9", hospitalId: "aiims-neuro", resourceId: "r9", quantity: 200 },

  // Apollo Chennai Main
  { id: "i-apollo-chennai-1", hospitalId: "apollo-chennai-main", resourceId: "r1", quantity: 120 },
  { id: "i-apollo-chennai-2", hospitalId: "apollo-chennai-main", resourceId: "r2", quantity: 80 },
  { id: "i-apollo-chennai-3", hospitalId: "apollo-chennai-main", resourceId: "r3", quantity: 40 },
  { id: "i-apollo-chennai-4", hospitalId: "apollo-chennai-main", resourceId: "r4", quantity: 15 },
  { id: "i-apollo-chennai-5", hospitalId: "apollo-chennai-main", resourceId: "r5", quantity: 400 },
  { id: "i-apollo-chennai-6", hospitalId: "apollo-chennai-main", resourceId: "r6", quantity: 100 },
  { id: "i-apollo-chennai-7", hospitalId: "apollo-chennai-main", resourceId: "r7", quantity: 70 },
  { id: "i-apollo-chennai-8", hospitalId: "apollo-chennai-main", resourceId: "r8", quantity: 45 },
  { id: "i-apollo-chennai-9", hospitalId: "apollo-chennai-main", resourceId: "r9", quantity: 800 },
  { id: "i-apollo-chennai-10", hospitalId: "apollo-chennai-main", resourceId: "r10", quantity: 25 },

  // Apollo Heart Institute Chennai
  { id: "i-apollo-heart-2", hospitalId: "apollo-chennai-heart", resourceId: "r2", quantity: 50 },
  { id: "i-apollo-heart-3", hospitalId: "apollo-chennai-heart", resourceId: "r3", quantity: 20 },
  { id: "i-apollo-heart-4", hospitalId: "apollo-chennai-heart", resourceId: "r4", quantity: 10 },
  { id: "i-apollo-heart-5", hospitalId: "apollo-chennai-heart", resourceId: "r5", quantity: 250 },
  { id: "i-apollo-heart-7", hospitalId: "apollo-chennai-heart", resourceId: "r7", quantity: 35 },
  { id: "i-apollo-heart-8", hospitalId: "apollo-chennai-heart", resourceId: "r8", quantity: 20 },

  // Apollo Cancer Center Chennai
  { id: "i-apollo-cancer-5", hospitalId: "apollo-chennai-cancer", resourceId: "r5", quantity: 300 },
  { id: "i-apollo-cancer-9", hospitalId: "apollo-chennai-cancer", resourceId: "r9", quantity: 400 },
  { id: "i-apollo-cancer-10", hospitalId: "apollo-chennai-cancer", resourceId: "r10", quantity: 12 },

  // Apollo Hyderabad Main
  { id: "i-apollo-hyd-1", hospitalId: "apollo-hyderabad-main", resourceId: "r1", quantity: 100 },
  { id: "i-apollo-hyd-2", hospitalId: "apollo-hyderabad-main", resourceId: "r2", quantity: 70 },
  { id: "i-apollo-hyd-3", hospitalId: "apollo-hyderabad-main", resourceId: "r3", quantity: 35 },
  { id: "i-apollo-hyd-4", hospitalId: "apollo-hyderabad-main", resourceId: "r4", quantity: 12 },
  { id: "i-apollo-hyd-5", hospitalId: "apollo-hyderabad-main", resourceId: "r5", quantity: 350 },
  { id: "i-apollo-hyd-6", hospitalId: "apollo-hyderabad-main", resourceId: "r6", quantity: 85 },
  { id: "i-apollo-hyd-7", hospitalId: "apollo-hyderabad-main", resourceId: "r7", quantity: 60 },
  { id: "i-apollo-hyd-8", hospitalId: "apollo-hyderabad-main", resourceId: "r8", quantity: 40 },
  { id: "i-apollo-hyd-9", hospitalId: "apollo-hyderabad-main", resourceId: "r9", quantity: 700 },
  { id: "i-apollo-hyd-10", hospitalId: "apollo-hyderabad-main", resourceId: "r10", quantity: 20 },

  // Apollo DRDO Hyderabad
  { id: "i-apollo-drdo-1", hospitalId: "apollo-hyderabad-drdo", resourceId: "r1", quantity: 40 },
  { id: "i-apollo-drdo-2", hospitalId: "apollo-hyderabad-drdo", resourceId: "r2", quantity: 30 },
  { id: "i-apollo-drdo-3", hospitalId: "apollo-hyderabad-drdo", resourceId: "r3", quantity: 15 },
  { id: "i-apollo-drdo-5", hospitalId: "apollo-hyderabad-drdo", resourceId: "r5", quantity: 120 },
  { id: "i-apollo-drdo-6", hospitalId: "apollo-hyderabad-drdo", resourceId: "r6", quantity: 35 },
  { id: "i-apollo-drdo-9", hospitalId: "apollo-hyderabad-drdo", resourceId: "r9", quantity: 250 },

  // Fortis Delhi Main
  { id: "i-fortis-delhi-1", hospitalId: "fortis-delhi-main", resourceId: "r1", quantity: 90 },
  { id: "i-fortis-delhi-2", hospitalId: "fortis-delhi-main", resourceId: "r2", quantity: 65 },
  { id: "i-fortis-delhi-3", hospitalId: "fortis-delhi-main", resourceId: "r3", quantity: 30 },
  { id: "i-fortis-delhi-4", hospitalId: "fortis-delhi-main", resourceId: "r4", quantity: 10 },
  { id: "i-fortis-delhi-5", hospitalId: "fortis-delhi-main", resourceId: "r5", quantity: 300 },
  { id: "i-fortis-delhi-6", hospitalId: "fortis-delhi-main", resourceId: "r6", quantity: 75 },
  { id: "i-fortis-delhi-7", hospitalId: "fortis-delhi-main", resourceId: "r7", quantity: 55 },
  { id: "i-fortis-delhi-8", hospitalId: "fortis-delhi-main", resourceId: "r8", quantity: 35 },
  { id: "i-fortis-delhi-9", hospitalId: "fortis-delhi-main", resourceId: "r9", quantity: 600 },
  { id: "i-fortis-delhi-10", hospitalId: "fortis-delhi-main", resourceId: "r10", quantity: 18 },

  // Fortis Noida
  { id: "i-fortis-noida-1", hospitalId: "fortis-noida", resourceId: "r1", quantity: 50 },
  { id: "i-fortis-noida-2", hospitalId: "fortis-noida", resourceId: "r2", quantity: 35 },
  { id: "i-fortis-noida-3", hospitalId: "fortis-noida", resourceId: "r3", quantity: 18 },
  { id: "i-fortis-noida-5", hospitalId: "fortis-noida", resourceId: "r5", quantity: 150 },
  { id: "i-fortis-noida-6", hospitalId: "fortis-noida", resourceId: "r6", quantity: 40 },
  { id: "i-fortis-noida-9", hospitalId: "fortis-noida", resourceId: "r9", quantity: 300 },

  // Fortis Gurgaon
  { id: "i-fortis-gurgaon-1", hospitalId: "fortis-gurgaon", resourceId: "r1", quantity: 45 },
  { id: "i-fortis-gurgaon-2", hospitalId: "fortis-gurgaon", resourceId: "r2", quantity: 30 },
  { id: "i-fortis-gurgaon-3", hospitalId: "fortis-gurgaon", resourceId: "r3", quantity: 15 },
  { id: "i-fortis-gurgaon-4", hospitalId: "fortis-gurgaon", resourceId: "r4", quantity: 6 },
  { id: "i-fortis-gurgaon-5", hospitalId: "fortis-gurgaon", resourceId: "r5", quantity: 120 },
  { id: "i-fortis-gurgaon-6", hospitalId: "fortis-gurgaon", resourceId: "r6", quantity: 35 },
  { id: "i-fortis-gurgaon-9", hospitalId: "fortis-gurgaon", resourceId: "r9", quantity: 250 },
  { id: "i-fortis-gurgaon-10", hospitalId: "fortis-gurgaon", resourceId: "r10", quantity: 8 },

  // Government Hospitals - Limited resources
  { id: "i-gov-delhi-1", hospitalId: "gov-phc-delhi-main", resourceId: "r1", quantity: 30 },
  { id: "i-gov-delhi-2", hospitalId: "gov-phc-delhi-main", resourceId: "r2", quantity: 20 },
  { id: "i-gov-delhi-3", hospitalId: "gov-phc-delhi-main", resourceId: "r3", quantity: 8 },
  { id: "i-gov-delhi-5", hospitalId: "gov-phc-delhi-main", resourceId: "r5", quantity: 50 },
  { id: "i-gov-delhi-9", hospitalId: "gov-phc-delhi-main", resourceId: "r9", quantity: 100 },

  // PHC Rohini
  { id: "i-gov-rohini-1", hospitalId: "gov-phc-rohini", resourceId: "r1", quantity: 15 },
  { id: "i-gov-rohini-2", hospitalId: "gov-phc-rohini", resourceId: "r2", quantity: 10 },
  { id: "i-gov-rohini-3", hospitalId: "gov-phc-rohini", resourceId: "r3", quantity: 4 },
  { id: "i-gov-rohini-9", hospitalId: "gov-phc-rohini", resourceId: "r9", quantity: 50 },

  // PHC Dwarka
  { id: "i-gov-dwarka-1", hospitalId: "gov-phc-dwarka", resourceId: "r1", quantity: 12 },
  { id: "i-gov-dwarka-2", hospitalId: "gov-phc-dwarka", resourceId: "r2", quantity: 8 },
  { id: "i-gov-dwarka-5", hospitalId: "gov-phc-dwarka", resourceId: "r5", quantity: 25 },
  { id: "i-gov-dwarka-9", hospitalId: "gov-phc-dwarka", resourceId: "r9", quantity: 40 },
];
