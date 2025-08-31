export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export interface AppointmentTypeBase {
  name: string;
  description?: string;
  duration_minutes: number;
  color: string;
}

export interface AppointmentTypeCreate extends AppointmentTypeBase {
  // Extends AppointmentTypeBase with no additional fields
}

export interface AppointmentTypeUpdate {
  name?: string;
  description?: string;
  duration_minutes?: number;
  color?: string;
  is_active?: boolean;
}

export interface AppointmentType extends AppointmentTypeBase {
  id: number;
  is_active: boolean;
}

export interface AppointmentBase {
  patient_id: number;
  dentist_id: number;
  appointment_type_id: number;
  start_time: string; // ISO format datetime
  end_time: string; // ISO format datetime
  status: AppointmentStatus;
  notes?: string;
  is_block_out: boolean;
}

export interface AppointmentCreate extends AppointmentBase {
  // Extends AppointmentBase with no additional fields
}

export interface AppointmentUpdate {
  patient_id?: number;
  dentist_id?: number;
  appointment_type_id?: number;
  start_time?: string; // ISO format datetime
  end_time?: string; // ISO format datetime
  status?: AppointmentStatus;
  notes?: string;
  is_block_out?: boolean;
}

export interface Appointment extends AppointmentBase {
  id: number;
  created_at: string; // ISO format datetime
  updated_at: string; // ISO format datetime
}

export interface BlockOutTimeCreate {
  dentist_id: number;
  start_time: string; // ISO format datetime
  end_time: string; // ISO format datetime
  notes?: string;
}

export interface BlockOutTimeUpdate {
  start_time?: string; // ISO format datetime
  end_time?: string; // ISO format datetime
  notes?: string;
}

export interface DateRange {
  start_date: string; // ISO format date
  end_date: string; // ISO format date
}
