import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppointmentSchedule } from '@/lib/appointment';
import { supabase } from '@/lib/supabase';
import type { Appointment, CarePlan, Medication, Patient, Report, Test } from '@/lib/staff';

const PENDING_CONNECTION_KEY = '@careloop/pending-connection-code';

export async function savePendingConnectionCode(code: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_CONNECTION_KEY, code.trim().toUpperCase());
}

export async function redeemPendingConnectionCode(code?: string): Promise<string | null> {
  const pendingCode = code?.trim() || await AsyncStorage.getItem(PENDING_CONNECTION_KEY);
  if (!pendingCode) return null;
  const { data, error } = await supabase.rpc('redeem_connection_code', { invitation_code: pendingCode });
  if (error) throw error;
  await AsyncStorage.removeItem(PENDING_CONNECTION_KEY);
  return data as string;
}

export type PatientConnectivitySnapshot = {
  patient_id: string;
  organisation_id: string;
  connection_id: string;
  care_team_id: string;
  connection_status: 'active' | 'withdrawn' | 'revoked';
  consent_version: string;
  consented_at: string;
  connected_at: string;
};

export async function getPatientConnectivitySnapshot(): Promise<PatientConnectivitySnapshot | null> {
  const { data, error } = await supabase.rpc('get_patient_connectivity_snapshot');
  if (error) throw error;
  const snapshot = (Array.isArray(data) ? data[0] : data) as PatientConnectivitySnapshot | null;
  return snapshot?.connection_status === 'active' ? snapshot : null;
}

export async function redeemPatientConnection(input: { code?: string; qrPayload?: string }): Promise<PatientConnectivitySnapshot> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in before connecting your care team.');

  let patientId: string | null = null;
  if (input.qrPayload) {
    const { data, error } = await supabase.rpc('redeem_connection_qr_payload', { qr_payload: input.qrPayload.trim() });
    if (error) throw error;
    patientId = data as string | null;
  } else if (input.code) {
    const { data, error } = await supabase.rpc('redeem_connection_code', { invitation_code: input.code.trim().toUpperCase() });
    if (error) throw error;
    patientId = data as string | null;
  } else {
    throw new Error('Scan a care-team QR code or enter its connection code.');
  }

  const snapshot = await getPatientConnectivitySnapshot();
  if (!patientId || !snapshot || snapshot.patient_id !== patientId) {
    throw new Error('The connection was not confirmed. Ask your care team for a current code.');
  }
  await AsyncStorage.removeItem(PENDING_CONNECTION_KEY);
  return snapshot;
}

export async function loadLinkedAppointment(): Promise<AppointmentSchedule | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;
    const { data: patient, error: patientError } = await supabase.from('patients').select('id').eq('auth_user_id', userData.user.id).maybeSingle();
    if (patientError || !patient) return null;
    const { data: appointments, error } = await supabase.from('appointments').select('scheduled_at, status').eq('patient_id', patient.id).in('status', ['upcoming', 'overdue']).order('scheduled_at').limit(1);
    if (error || !appointments?.[0]) return null;
    const scheduledAt = new Date(appointments[0].scheduled_at as string);
    if (Number.isNaN(scheduledAt.getTime())) return null;
    return {
      date: scheduledAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      weekday: scheduledAt.toLocaleDateString('en-US', { weekday: 'long' }),
      time: scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      status: 'confirmed',
    };
  } catch {
    return null;
  }
}

export type LinkedPatientRecord = {
  patient: Patient;
  appointments: Appointment[];
  tests: Test[];
  reports: Report[];
  medications: Medication[];
  carePlans: CarePlan[];
};

export async function loadLinkedPatientRecord(): Promise<LinkedPatientRecord | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: patient, error: patientError } = await supabase.from('patients').select('*').eq('auth_user_id', userData.user.id).maybeSingle();
  if (patientError || !patient) return null;
  const [appointments, tests, reports, medications, carePlans] = await Promise.all([
    supabase.from('appointments').select('*').eq('patient_id', patient.id).order('scheduled_at'),
    supabase.from('tests').select('*').eq('patient_id', patient.id).order('test_date', { ascending: false }),
    supabase.from('reports').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false }),
    supabase.from('medications').select('*').eq('patient_id', patient.id).order('status'),
    supabase.from('care_plans').select('*').eq('patient_id', patient.id).order('review_date'),
  ]);
  const failed = [appointments, tests, reports, medications, carePlans].find((result) => result.error);
  if (failed?.error) throw failed.error;
  return { patient: patient as Patient, appointments: (appointments.data ?? []) as Appointment[], tests: (tests.data ?? []) as Test[], reports: (reports.data ?? []) as Report[], medications: (medications.data ?? []) as Medication[], carePlans: (carePlans.data ?? []) as CarePlan[] };
}
