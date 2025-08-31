export type PrescriptionStatus = "active" | "completed" | "cancelled";

export interface Prescription {
  id: number;
  patient_id: number;
  visit_note_id?: number;
  dentist_id?: number;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  quantity?: string;
  refills: number;
  instructions?: string;
  notes?: string;
  status: PrescriptionStatus;
  prescribed_date: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionCreate {
  patient_id: number;
  visit_note_id?: number;
  dentist_id?: number;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  quantity?: string;
  refills?: number;
  instructions?: string;
  notes?: string;
  status?: PrescriptionStatus;
}

export interface PrescriptionUpdate {
  visit_note_id?: number;
  drug_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: string;
  refills?: number;
  instructions?: string;
  notes?: string;
  status?: PrescriptionStatus;
}

export interface PrescriptionPrint extends Prescription {
  patient_name: string;
  patient_dob: string;
  dentist_name: string;
}
