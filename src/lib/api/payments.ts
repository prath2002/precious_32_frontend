import { Payment, PaymentCreate, PaymentUpdate, PatientBalance } from "@/types/payments";
import { fetchWithAuth } from "./api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const PAYMENTS_URL = `${API_URL}/payments`;

export async function getPayments(patientId?: number, visitNoteId?: number): Promise<Payment[]> {
  let url = PAYMENTS_URL;
  
  if (patientId) {
    url += `?patient_id=${patientId}`;
  } else if (visitNoteId) {
    url += `?visit_note_id=${visitNoteId}`;
  }
  
  return fetchWithAuth(url);
}

export async function getPayment(id: number): Promise<Payment> {
  return fetchWithAuth(`${PAYMENTS_URL}/${id}`);
}

export async function createPayment(data: PaymentCreate): Promise<Payment> {
  return fetchWithAuth(PAYMENTS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePayment(id: number, data: PaymentUpdate): Promise<Payment> {
  return fetchWithAuth(`${PAYMENTS_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePayment(id: number): Promise<boolean> {
  return fetchWithAuth(`${PAYMENTS_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function getPatientBalance(patientId: number): Promise<PatientBalance> {
  return fetchWithAuth(`${PAYMENTS_URL}/patient/${patientId}/balance`);
}
