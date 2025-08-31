export type DocumentType = "xray" | "lab_result" | "consent_form" | "insurance" | "other";

export interface Document {
  id: number;
  patient_id: number;
  uploaded_by?: number;
  filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  title?: string;
  description?: string;
  document_type: DocumentType;
  upload_date: string;
  updated_at: string;
}

export interface DocumentCreate {
  patient_id: number;
  title?: string;
  description?: string;
  document_type: DocumentType;
}

export interface DocumentUpdate {
  title?: string;
  description?: string;
  document_type?: DocumentType;
}

export interface DocumentUpload {
  patient_id: number;
  file: File;
  title?: string;
  description?: string;
  document_type: DocumentType;
}
