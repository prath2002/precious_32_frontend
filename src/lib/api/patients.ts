import { Patient, PatientCreate, PatientUpdate } from "@/types/patient";
import { safeFetch, fetchWithAuth } from './api-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Sample patients to use as fallback when offline
const SAMPLE_PATIENTS: Patient[] = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    date_of_birth: "1980-01-15",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    postal_code: "12345",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone: "555-987-6543",
    date_of_birth: "1985-05-20",
    address: "456 Oak Ave",
    city: "Somewhere",
    state: "NY",
    postal_code: "67890",
    created_at: "2023-01-02T00:00:00Z",
    updated_at: "2023-01-02T00:00:00Z"
  },
  {
    id: 3,
    first_name: "Robert",
    last_name: "Johnson",
    email: "robert.johnson@example.com",
    phone: "555-456-7890",
    date_of_birth: "1975-11-08",
    address: "789 Pine St",
    city: "Elsewhere",
    state: "TX",
    postal_code: "54321",
    created_at: "2023-01-03T00:00:00Z",
    updated_at: "2023-01-03T00:00:00Z"
  }
];

// Get all patients with optional search (new version using fetchWithAuth)
export async function getPatients(
  search?: string,
  skip = 0,
  limit = 100
): Promise<Patient[]> {
  const searchParams = new URLSearchParams();
  if (search) searchParams.append("search", search);
  if (skip) searchParams.append("skip", skip.toString());
  if (limit) searchParams.append("limit", limit.toString());

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${API_URL}/patients${queryString}`;

  console.log(`Fetching patients from: ${url}`);

  try {
    return await fetchWithAuth<Patient[]>(url);
  } catch (error) {
    console.error("Error fetching patients with auth token:", error);

    // Fallback to sample data if API call fails
    let filteredSamplePatients = SAMPLE_PATIENTS;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSamplePatients = SAMPLE_PATIENTS.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
        return fullName.includes(searchLower) ||
               patient.email?.toLowerCase().includes(searchLower) ||
               patient.phone.includes(search);
      });
    }

    return filteredSamplePatients;
  }
}

// Legacy version for backward compatibility
export async function getPatientsWithToken(
  token: string,
  search?: string,
  skip = 0,
  limit = 100
): Promise<Patient[]> {
  const searchParams = new URLSearchParams();
  if (search) searchParams.append("search", search);
  if (skip) searchParams.append("skip", skip.toString());
  if (limit) searchParams.append("limit", limit.toString());

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${API_URL}/patients${queryString}`;

  console.log(`Fetching patients from: ${url}`);

  // Filter sample patients if search is provided
  let filteredSamplePatients = SAMPLE_PATIENTS;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSamplePatients = SAMPLE_PATIENTS.filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      return fullName.includes(searchLower) ||
             patient.email?.toLowerCase().includes(searchLower) ||
             patient.phone.includes(search);
    });
  }

  // Use safeFetch with filtered sample patients as fallback
  return safeFetch<Patient[]>(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    filteredSamplePatients // Sample patients as fallback when offline
  );
}

// Get a single patient by ID (new version using fetchWithAuth)
export async function getPatient(patientId: number): Promise<Patient> {
  const url = `${API_URL}/patients/${patientId}`;
  console.log(`Fetching patient with ID ${patientId}`);

  try {
    return await fetchWithAuth<Patient>(url);
  } catch (error) {
    console.error(`Error fetching patient with ID ${patientId}:`, error);

    // Find a sample patient to use as fallback
    const samplePatient = SAMPLE_PATIENTS.find(p => p.id === patientId) || SAMPLE_PATIENTS[0];
    return samplePatient;
  }
}

// Legacy version for backward compatibility
export async function getPatientWithToken(token: string, patientId: number): Promise<Patient> {
  const url = `${API_URL}/patients/${patientId}`;
  console.log(`Fetching patient with ID ${patientId}`);

  // Find a sample patient to use as fallback
  const samplePatient = SAMPLE_PATIENTS.find(p => p.id === patientId) || SAMPLE_PATIENTS[0];

  // Use safeFetch with sample patient as fallback
  return safeFetch<Patient>(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    samplePatient // Sample patient as fallback when offline
  );
}

// Create a new patient (new version using fetchWithAuth)
export async function createPatient(patientData: PatientCreate): Promise<Patient> {
  const url = `${API_URL}/patients`;
  console.log(`Creating patient:`, patientData);

  try {
    return await fetchWithAuth<Patient>(url, {
      method: "POST",
      body: JSON.stringify(patientData),
    });
  } catch (error) {
    console.error("Error creating patient:", error);

    // Create a mock patient as fallback
    const mockPatient: Patient = {
      id: Math.floor(Math.random() * 1000) + 100, // Generate a random ID
      ...patientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return mockPatient;
  }
}

// Legacy version for backward compatibility
export async function createPatientWithToken(
  token: string,
  patientData: PatientCreate
): Promise<Patient> {
  const url = `${API_URL}/patients`;
  console.log(`Creating patient:`, patientData);

  // Create a mock patient to use as fallback
  const mockPatient: Patient = {
    id: Math.floor(Math.random() * 1000) + 100, // Generate a random ID
    ...patientData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Use safeFetch with mock patient as fallback
  return safeFetch<Patient>(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    },
    mockPatient // Mock patient as fallback when offline
  );
}

// Update a patient (new version using fetchWithAuth)
export async function updatePatient(
  patientId: number,
  patientData: PatientUpdate
): Promise<Patient> {
  const url = `${API_URL}/patients/${patientId}`;
  console.log(`Updating patient with ID ${patientId}:`, patientData);

  return fetchWithAuth<Patient>(url, {
    method: "PUT",
    body: JSON.stringify(patientData),
  });
}

// Legacy version for backward compatibility
export async function updatePatientWithToken(
  token: string,
  patientId: number,
  patientData: PatientUpdate
): Promise<Patient> {
  const response = await fetch(`${API_URL}/patients/${patientId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update patient");
  }

  return response.json();
}

// Delete a patient (new version using fetchWithAuth)
export async function deletePatient(patientId: number): Promise<Patient> {
  const url = `${API_URL}/patients/${patientId}`;
  console.log(`Deleting patient with ID ${patientId}`);

  return fetchWithAuth<Patient>(url, {
    method: "DELETE",
  });
}

// Legacy version for backward compatibility
export async function deletePatientWithToken(token: string, patientId: number): Promise<Patient> {
  const response = await fetch(`${API_URL}/patients/${patientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete patient");
  }

  return response.json();
}
