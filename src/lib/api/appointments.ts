import {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentType,
  AppointmentTypeCreate,
  AppointmentTypeUpdate,
  BlockOutTimeCreate,
  BlockOutTimeUpdate,
  AppointmentStatus
} from "@/types/appointment";
import { safeFetch, fetchWithAuth } from './api-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Get appointments within a date range
export async function getAppointments(
  token: string,
  startDate: Date,
  endDate: Date,
  dentistId?: number,
  patientId?: number,
  includeBlockOut: boolean = true
): Promise<Appointment[]> {
  const searchParams = new URLSearchParams();
  // Add console logging for debugging
  console.log("Fetching appointments with params:", {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    dentistId,
    patientId,
    includeBlockOut
  });

  searchParams.append("start_date", startDate.toISOString());
  searchParams.append("end_date", endDate.toISOString());
  if (dentistId) searchParams.append("dentist_id", dentistId.toString());
  if (patientId) searchParams.append("patient_id", patientId.toString());
  searchParams.append("include_block_out", includeBlockOut.toString());

  const url = `${API_URL}/appointments?${searchParams.toString()}`;
  console.log(`Fetching from: ${url}`);

  // Use safeFetch with empty array as fallback
  return safeFetch<Appointment[]>(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    [] // Empty array as fallback when offline
  );
}

// Get a single appointment by ID
export async function getAppointment(token: string, appointmentId: number): Promise<Appointment> {
  const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch appointment");
  }

  return response.json();
}

// Create a new appointment
export async function createAppointment(
  token: string,
  appointmentData: AppointmentCreate
): Promise<Appointment> {
  const url = `${API_URL}/appointments`;
  console.log(`Creating appointment:`, appointmentData);

  // Create a mock appointment to use as fallback
  const mockAppointment: Appointment = {
    id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID
    ...appointmentData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Use safeFetch with mock appointment as fallback
  return safeFetch<Appointment>(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    },
    mockAppointment // Mock appointment as fallback when offline
  );
}

// Update an appointment
export async function updateAppointment(
  token: string,
  appointmentId: number,
  appointmentData: AppointmentUpdate
): Promise<Appointment> {
  const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update appointment");
  }

  return response.json();
}

// Cancel an appointment
export async function cancelAppointment(token: string, appointmentId: number): Promise<Appointment> {
  const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to cancel appointment");
  }

  return response.json();
}

// Get appointment types
export async function getAppointmentTypes(token: string): Promise<AppointmentType[]> {
  const url = `${API_URL}/appointments/types`;
  console.log(`Fetching from: ${url}`);

  // Default appointment types to use as fallback when offline
  const defaultTypes: AppointmentType[] = [
    {
      id: 1,
      name: "Regular Checkup",
      description: "Routine dental examination and cleaning",
      duration_minutes: 30,
      color: "#3498db",
      is_active: true
    },
    {
      id: 2,
      name: "Teeth Cleaning",
      description: "Professional teeth cleaning",
      duration_minutes: 45,
      color: "#2ecc71",
      is_active: true
    },
    {
      id: 3,
      name: "Filling",
      description: "Dental filling procedure",
      duration_minutes: 60,
      color: "#e74c3c",
      is_active: true
    },
    {
      id: 4,
      name: "Root Canal",
      description: "Root canal treatment",
      duration_minutes: 90,
      color: "#9b59b6",
      is_active: true
    },
    {
      id: 5,
      name: "Block-Out Time",
      description: "Reserved time slot (not available for appointments)",
      duration_minutes: 60,
      color: "#7f8c8d",
      is_active: true
    }
  ];

  // Use safeFetch with default appointment types as fallback
  return safeFetch<AppointmentType[]>(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    defaultTypes // Default types as fallback when offline
  );
}

// Create a new appointment type
export async function createAppointmentType(
  token: string,
  appointmentTypeData: AppointmentTypeCreate
): Promise<AppointmentType> {
  const url = `${API_URL}/appointments/types`;
  console.log(`Creating appointment type:`, appointmentTypeData);

  // Create a mock appointment type to use as fallback
  const mockAppointmentType: AppointmentType = {
    id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID
    ...appointmentTypeData,
    is_active: true
  };

  // Use safeFetch with mock appointment type as fallback
  return safeFetch<AppointmentType>(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentTypeData),
    },
    mockAppointmentType // Mock type as fallback when offline
  );
}

// Update an appointment type
export async function updateAppointmentType(
  token: string,
  appointmentTypeId: number,
  appointmentTypeData: AppointmentTypeUpdate
): Promise<AppointmentType> {
  const response = await fetch(`${API_URL}/appointments/types/${appointmentTypeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentTypeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update appointment type");
  }

  return response.json();
}

// Delete an appointment type
export async function deleteAppointmentType(
  token: string,
  appointmentTypeId: number
): Promise<AppointmentType> {
  const response = await fetch(`${API_URL}/appointments/types/${appointmentTypeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete appointment type");
  }

  return response.json();
}

// Create a block-out time
export async function createBlockOutTime(
  token: string,
  blockOutData: BlockOutTimeCreate
): Promise<Appointment> {
  const url = `${API_URL}/appointments/block-out`;
  console.log(`Creating block-out time:`, blockOutData);

  // Create a mock block-out time to use as fallback
  const mockBlockOut: Appointment = {
    id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID
    patient_id: 0,
    dentist_id: blockOutData.dentist_id,
    appointment_type_id: 5, // Use the Block-Out Time type ID
    start_time: blockOutData.start_time,
    end_time: blockOutData.end_time,
    notes: blockOutData.notes || "",
    is_block_out: true,
    status: AppointmentStatus.SCHEDULED,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Use safeFetch with mock block-out time as fallback
  return safeFetch<Appointment>(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(blockOutData),
    },
    mockBlockOut // Mock block-out time as fallback when offline
  );
}

// Update a block-out time
export async function updateBlockOutTime(
  token: string,
  appointmentId: number,
  blockOutData: BlockOutTimeUpdate
): Promise<Appointment> {
  const response = await fetch(`${API_URL}/appointments/block-out/${appointmentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(blockOutData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update block-out time");
  }

  return response.json();
}

// Get appointments for a specific patient (new version using fetchWithAuth)
export async function getPatientAppointments(
  patientId: number,
  startDate?: Date,
  endDate?: Date,
  status?: AppointmentStatus
): Promise<Appointment[]> {
  const searchParams = new URLSearchParams();

  if (startDate) searchParams.append("start_date", startDate.toISOString());
  if (endDate) searchParams.append("end_date", endDate.toISOString());
  if (status) searchParams.append("status", status);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${API_URL}/appointments/patient/${patientId}${queryString}`;

  console.log(`Fetching patient appointments from: ${url}`);

  try {
    return await fetchWithAuth<Appointment[]>(url);
  } catch (error) {
    console.error(`Error fetching appointments for patient ${patientId}:`, error);
    return [];
  }
}

// Legacy version for backward compatibility
export async function getPatientAppointmentsWithToken(
  token: string,
  patientId: number,
  startDate?: Date,
  endDate?: Date,
  status?: AppointmentStatus
): Promise<Appointment[]> {
  const searchParams = new URLSearchParams();

  if (startDate) searchParams.append("start_date", startDate.toISOString());
  if (endDate) searchParams.append("end_date", endDate.toISOString());
  if (status) searchParams.append("status", status);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const url = `${API_URL}/appointments/patient/${patientId}${queryString}`;

  console.log(`Fetching patient appointments from: ${url}`);

  return safeFetch<Appointment[]>(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    [] // Empty array as fallback when offline
  );
}

// Get appointments for the dashboard
export async function getDashboardAppointments(
  token: string,
  days: number = 7,
  dentistId?: number,
  includeBlockOut: boolean = true,
  includePast: boolean = false
): Promise<Appointment[]> {
  const searchParams = new URLSearchParams();

  searchParams.append("days", days.toString());
  if (dentistId) searchParams.append("dentist_id", dentistId.toString());
  searchParams.append("include_block_out", includeBlockOut.toString());
  searchParams.append("include_past", includePast.toString());

  const url = `${API_URL}/appointments/dashboard?${searchParams.toString()}`;

  console.log(`Fetching dashboard appointments from: ${url}`);

  return safeFetch<Appointment[]>(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    [] // Empty array as fallback when offline
  );
}
