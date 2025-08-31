import { VisitNote, VisitNoteCreate, VisitNoteUpdate, VisitNoteWithRelations } from "@/types/visit-notes";
import { fetchWithAuth } from "./api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const VISIT_NOTES_URL = `${API_URL}/visit-notes`;

export async function getVisitNotes(patientId?: number): Promise<VisitNote[]> {
  const url = patientId 
    ? `${VISIT_NOTES_URL}?patient_id=${patientId}` 
    : VISIT_NOTES_URL;
  
  return fetchWithAuth(url);
}

export async function getVisitNote(id: number): Promise<VisitNoteWithRelations> {
  return fetchWithAuth(`${VISIT_NOTES_URL}/${id}`);
}

export async function createVisitNote(data: VisitNoteCreate): Promise<VisitNote> {
  return fetchWithAuth(VISIT_NOTES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVisitNote(id: number, data: VisitNoteUpdate): Promise<VisitNote> {
  return fetchWithAuth(`${VISIT_NOTES_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteVisitNote(id: number): Promise<VisitNote> {
  return fetchWithAuth(`${VISIT_NOTES_URL}/${id}`, {
    method: "DELETE",
  });
}
