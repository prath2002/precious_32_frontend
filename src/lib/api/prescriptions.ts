import { Prescription, PrescriptionCreate, PrescriptionUpdate } from "@/types/prescriptions";
import { fetchWithAuth } from "./api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const PRESCRIPTIONS_URL = `${API_URL}/prescriptions`;

export async function getPrescriptions(patientId?: number, visitNoteId?: number): Promise<Prescription[]> {
  let url = PRESCRIPTIONS_URL;
  
  if (patientId) {
    url += `?patient_id=${patientId}`;
  } else if (visitNoteId) {
    url += `?visit_note_id=${visitNoteId}`;
  }
  
  return fetchWithAuth(url);
}

export async function getPrescription(id: number): Promise<Prescription> {
  return fetchWithAuth(`${PRESCRIPTIONS_URL}/${id}`);
}

export async function createPrescription(data: PrescriptionCreate): Promise<Prescription> {
  return fetchWithAuth(PRESCRIPTIONS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePrescription(id: number, data: PrescriptionUpdate): Promise<Prescription> {
  return fetchWithAuth(`${PRESCRIPTIONS_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function cancelPrescription(id: number): Promise<Prescription> {
  return fetchWithAuth(`${PRESCRIPTIONS_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function printPrescription(id: number): Promise<Blob> {
  const response = await fetchWithAuth(`${PRESCRIPTIONS_URL}/${id}/print`, {
    method: "GET",
    headers: {
      Accept: "application/pdf",
    },
  }, true); // Pass true to get the raw response
  
  return response.blob();
}
