export type AppointmentStatus = 'upcoming' | 'completed' | 'missed' | 'cancelled' | 'overdue';
export type TestStatus = 'pending' | 'completed' | 'overdue';

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  scheduled_at: string;
  purpose: string;
  status: AppointmentStatus;
  notes: string | null;
};

export type CarePlan = {
  id: string;
  patient_id: string;
  title: string;
  goal: string;
  actions: string;
  responsible_profile_id: string | null;
  review_date: string;
  status: 'active' | 'completed' | 'paused';
};

export type Medication = {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  instructions: string;
  start_date: string;
  end_date: string | null;
  status: 'current' | 'past';
};

export type Patient = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  condition: string | null;
  notes: string | null;
  assigned_doctor_id: string | null;
  assigned_staff_id: string | null;
  created_at: string;
};

export type Report = {
  id: string;
  patient_id: string;
  test_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  created_at: string;
};

export type Test = {
  id: string;
  patient_id: string;
  name: string;
  test_date: string;
  status: TestStatus;
  notes: string | null;
};
