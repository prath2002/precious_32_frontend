export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum BloodType {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export interface PatientBase {
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO format date
  gender: Gender;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface PatientCreate extends PatientBase {
  blood_type?: BloodType;
  allergies?: string;
  medical_conditions?: string;
  current_medications?: string;
  dental_history?: string;
  last_dental_visit?: string; // ISO format date
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // ISO format date
  gender?: Gender;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  blood_type?: BloodType;
  allergies?: string;
  medical_conditions?: string;
  current_medications?: string;
  dental_history?: string;
  last_dental_visit?: string; // ISO format date
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  is_active?: boolean;
}

export interface Patient extends PatientBase {
  id: number;
  is_active: boolean;
  created_at: string; // ISO format date
  updated_at: string; // ISO format date
  blood_type?: BloodType;
  allergies?: string;
  medical_conditions?: string;
  current_medications?: string;
  dental_history?: string;
  last_dental_visit?: string; // ISO format date
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
}
