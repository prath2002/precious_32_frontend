export type PaymentMethod = "cash" | "credit_card" | "debit_card" | "insurance" | "check" | "bank_transfer" | "other";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: number;
  patient_id: number;
  visit_note_id?: number;
  recorded_by?: number;
  amount: string; // Decimal as string
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number?: string;
  notes?: string;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreate {
  patient_id: number;
  visit_note_id?: number;
  amount: string | number; // Accept both string and number
  payment_method: PaymentMethod;
  status?: PaymentStatus;
  reference_number?: string;
  notes?: string;
  payment_date?: string;
}

export interface PaymentUpdate {
  visit_note_id?: number;
  amount?: string | number;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  reference_number?: string;
  notes?: string;
  payment_date?: string;
}

export interface PatientBalance {
  patient_id: number;
  total_charges: string;
  total_payments: string;
  outstanding_balance: string;
}
