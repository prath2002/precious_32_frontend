import { Document, DocumentUpdate } from "@/types/documents";
import { fetchWithAuth } from "./api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const DOCUMENTS_URL = `${API_URL}/documents`;
const PATIENT_DOCUMENTS_URL = `${API_URL}/patients`;

export async function getDocuments(patientId?: number): Promise<Document[]> {
  const url = patientId 
    ? `${DOCUMENTS_URL}?patient_id=${patientId}` 
    : DOCUMENTS_URL;
  
  return fetchWithAuth(url);
}

export async function getPatientDocuments(patientId: number): Promise<Document[]> {
  return fetchWithAuth(`${PATIENT_DOCUMENTS_URL}/${patientId}/documents`);
}

export async function downloadDocument(id: number): Promise<Blob> {
  const response = await fetchWithAuth(`${DOCUMENTS_URL}/${id}`, {
    method: "GET",
  }, true); // Pass true to get the raw response
  
  return response.blob();
}

export async function updateDocument(id: number, data: DocumentUpdate): Promise<Document> {
  return fetchWithAuth(`${DOCUMENTS_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(id: number): Promise<boolean> {
  return fetchWithAuth(`${DOCUMENTS_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function uploadDocument(
  patientId: number, 
  file: File, 
  metadata: { title?: string; description?: string; document_type: string }
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  
  if (metadata.title) {
    formData.append("title", metadata.title);
  }
  
  if (metadata.description) {
    formData.append("description", metadata.description);
  }
  
  formData.append("document_type", metadata.document_type);
  
  return fetchWithAuth(`${PATIENT_DOCUMENTS_URL}/${patientId}/documents`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header, let the browser set it with the boundary
    headers: {},
  });
}
