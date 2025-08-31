import { Prescription } from "./prescriptions";
import { Payment } from "./payments";

export type VisitNoteStatus = "draft" | "completed" | "cancelled";

export interface VisitNote {
  id: number;
  patient_id: number;
  appointment_id?: number;
  dentist_id?: number;
  chief_complaint?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: string;
  status: VisitNoteStatus;
  created_at: string;
  updated_at: string;
}

export interface VisitNoteWithRelations extends VisitNote {
  prescriptions: Prescription[];
  payments: Payment[];
}

export interface VisitNoteCreate {
  patient_id: number;
  appointment_id?: number;
  dentist_id?: number;
  chief_complaint?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: string;
  status?: VisitNoteStatus;
}

export interface VisitNoteUpdate {
  appointment_id?: number;
  dentist_id?: number;
  chief_complaint?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: string;
  status?: VisitNoteStatus;
}
