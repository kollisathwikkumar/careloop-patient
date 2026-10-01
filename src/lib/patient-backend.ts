import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

export type PatientAppPatient = {
  id: string;
  name: string;
  program: string;
  nextFollowup: string;
  weekday: string;
  time: string;
  doctor: string;
  department: string;
  assigned: string;
  response: string;
  status: string;
  reminder: string;
  nextAction: string;
  updatedAt: string;
};

export type PatientAppAttachment = { kind: 'image' | 'report'; name: string; mimeType: string; data: string };
export type PatientAppMessage = { id: string; patientId: string; sender: 'patient' | 'care-team'; text: string; createdAt: string; attachment?: PatientAppAttachment };

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string;
  condition: string | null;
  assigned_doctor_id: string | null;
  assigned_staff_id: string | null;
  department?: string | null;
  created_at: string;
};

type AppointmentRow = {
  id: string;
  patient_id: string;
  scheduled_at: string;
  status: string;
  purpose: string;
  notes: string | null;
};

type ProfileRow = { id: string; full_name: string | null; department: string | null };
type CarePlanRow = { actions: string | null };
type FollowUpRow = { outcome: string; next_steps: string | null; attempted_at: string };
type ActivityRow = { id: string; patient_id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; summary: string; created_at: string };

const ACTIVE_PATIENT_KEY = '@careloop/active-patient.v1';
const DEFAULT_PATIENT_ID = 'CL-1042';

function formatDate(value: string | null): { date: string; weekday: string; time: string } {
  if (!value) return { date: 'Not scheduled', weekday: 'To be confirmed', time: 'To be confirmed' };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: 'Not scheduled', weekday: 'To be confirmed', time: 'To be confirmed' };
  return {
    date: parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    weekday: parsed.toLocaleDateString('en-US', { weekday: 'long' }),
    time: parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

function parseAppointmentDate(date: string, time: string): string {
  const parsed = new Date(`${date} ${time}`);
  if (Number.isNaN(parsed.getTime())) throw new Error('The appointment date or time is invalid.');
  return parsed.toISOString();
}

async function getAuthenticatedPatientId(): Promise<string | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  const { data, error } = await supabase.from('patients').select('id').eq('auth_user_id', userData.user.id).maybeSingle();
  if (error) throw error;
  return (data as { id: string } | null)?.id ?? null;
}

export async function getActivePatientId(): Promise<string> {
  const linkedPatientId = await getAuthenticatedPatientId();
  if (linkedPatientId) {
    await AsyncStorage.setItem(ACTIVE_PATIENT_KEY, linkedPatientId);
    return linkedPatientId;
  }
  return (await AsyncStorage.getItem(ACTIVE_PATIENT_KEY)) ?? DEFAULT_PATIENT_ID;
}

export async function setActivePatientId(patientId: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_PATIENT_KEY, patientId);
}

async function loadPatient(patientId: string): Promise<PatientAppPatient> {
  const [patientResult, appointmentResult, planResult, followUpResult] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('appointments').select('id, patient_id, scheduled_at, status, purpose, notes').eq('patient_id', patientId).order('scheduled_at').limit(5),
    supabase.from('care_plans').select('actions').eq('patient_id', patientId).eq('status', 'active').order('review_date').limit(1),
    supabase.from('follow_up_events').select('outcome, next_steps, attempted_at').eq('patient_id', patientId).order('attempted_at', { ascending: false }).limit(1),
  ]);
  if (patientResult.error) throw patientResult.error;
  if (appointmentResult.error) throw appointmentResult.error;
  if (planResult.error) throw planResult.error;
  if (followUpResult.error) throw followUpResult.error;

  const patient = patientResult.data as PatientRow;
  const appointments = (appointmentResult.data ?? []) as AppointmentRow[];
  const appointment = appointments.find((item) => ['upcoming', 'overdue'].includes(item.status)) ?? appointments[0] ?? null;
  const activePlan = ((planResult.data ?? []) as CarePlanRow[])[0] ?? null;
  const latestFollowUp = ((followUpResult.data ?? []) as FollowUpRow[])[0] ?? null;
  const profileIds = [patient.assigned_doctor_id, patient.assigned_staff_id].filter((id): id is string => Boolean(id));
  const profileResult = profileIds.length > 0 ? await supabase.from('profiles').select('id, full_name, department').in('id', profileIds) : { data: [], error: null };
  if (profileResult.error) throw profileResult.error;
  const profiles = (profileResult.data ?? []) as ProfileRow[];
  const doctor = profiles.find((profile) => profile.id === patient.assigned_doctor_id);
  const staff = profiles.find((profile) => profile.id === patient.assigned_staff_id);
  const schedule = formatDate(appointment?.scheduled_at ?? null);
  const outcome = latestFollowUp?.outcome ?? '';
  const response = outcome.toLowerCase().includes('reschedule') ? 'Reschedule requested' : outcome.toLowerCase().includes('confirm') ? 'Confirmed' : appointment?.status === 'upcoming' ? 'Awaiting confirmation' : 'No response';

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`.trim(),
    program: patient.condition ?? 'Follow-up care',
    nextFollowup: schedule.date,
    weekday: schedule.weekday,
    time: schedule.time,
    doctor: doctor?.full_name ?? 'Care team',
    department: doctor?.department ?? patient.department ?? 'Care coordination',
    assigned: staff?.full_name ?? 'Care team',
    response,
    status: appointment?.status ?? 'not-scheduled',
    reminder: appointment?.notes ?? 'Your next care-team update will appear here.',
    nextAction: latestFollowUp?.next_steps ?? activePlan?.actions ?? 'Your care team’s next step will appear here.',
    updatedAt: latestFollowUp?.attempted_at ?? patient.created_at,
  };
}

export async function getPatientAppPatient(patientId = DEFAULT_PATIENT_ID): Promise<PatientAppPatient> {
  const activePatientId = await getAuthenticatedPatientId();
  return loadPatient(activePatientId ?? patientId);
}

export async function getPatientAppPatients(): Promise<PatientAppPatient[]> {
  const patientId = await getAuthenticatedPatientId();
  if (!patientId) return [];
  return [await loadPatient(patientId)];
}

export async function patchPatientAppPatient(
  patch: Partial<Pick<PatientAppPatient, 'nextFollowup' | 'weekday' | 'time' | 'response' | 'status'>>,
  patientId = DEFAULT_PATIENT_ID,
): Promise<PatientAppPatient> {
  const activePatientId = (await getAuthenticatedPatientId()) ?? patientId;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in is required to update your appointment.');
  const { data: appointmentData, error: appointmentError } = await supabase.from('appointments').select('id, patient_id, scheduled_at, status, purpose, notes').eq('patient_id', activePatientId).order('scheduled_at').limit(1).maybeSingle();
  if (appointmentError) throw appointmentError;

  const nextScheduledAt = patch.nextFollowup && patch.time ? parseAppointmentDate(patch.nextFollowup, patch.time) : null;
  if (appointmentData) {
    const update: { scheduled_at?: string; status?: string; notes?: string | null } = {};
    if (nextScheduledAt) update.scheduled_at = nextScheduledAt;
    if (patch.response === 'Confirmed') update.status = 'upcoming';
    if (patch.response === 'Reschedule requested') update.status = 'upcoming';
    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from('appointments').update(update).eq('id', (appointmentData as AppointmentRow).id).eq('patient_id', activePatientId);
      if (error) throw error;
    }
  }

  if (patch.response === 'Confirmed' || patch.response === 'Reschedule requested') {
    const outcome = patch.response === 'Confirmed' ? 'Patient confirmed attendance' : 'Reschedule requested';
    const nextSteps = patch.response === 'Confirmed' ? 'Review readings at appointment.' : `Requested ${patch.nextFollowup ?? 'a new date'} at ${patch.time ?? 'a new time'}.`;
    const { error } = await supabase.from('follow_up_events').insert({ patient_id: activePatientId, appointment_id: appointmentData ? (appointmentData as AppointmentRow).id : null, attempted_at: new Date().toISOString(), outcome, next_steps: nextSteps, recorded_by: userData.user.id });
    if (error) throw error;
  }

  return loadPatient(activePatientId);
}

export async function getPatientReportUrl(filePath = 'CL-1042-demo-report.pdf'): Promise<string | null> {
  const { data, error } = await supabase.storage.from('careloop-reports').createSignedUrl(filePath, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function getPatientAppMessages(patientId = DEFAULT_PATIENT_ID): Promise<PatientAppMessage[]> {
  const activePatientId = (await getAuthenticatedPatientId()) ?? patientId;
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('activity_log').select('id, patient_id, actor_id, action, entity_type, entity_id, summary, created_at').eq('patient_id', activePatientId).eq('entity_type', 'message').order('created_at');
  if (error) throw error;
  return ((data ?? []) as ActivityRow[]).map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    sender: row.actor_id && row.actor_id === userData.user?.id ? 'patient' : 'care-team',
    text: row.summary,
    createdAt: row.created_at,
  }));
}

export async function sendPatientAppMessage(input: Omit<PatientAppMessage, 'id' | 'createdAt'>): Promise<PatientAppMessage> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in is required to send a message.');
  const summary = input.text || (input.attachment ? `Attachment shared: ${input.attachment.name}` : 'Message sent');
  const { data, error } = await supabase.from('activity_log').insert({ patient_id: input.patientId, actor_id: userData.user.id, action: 'message_sent', entity_type: 'message', entity_id: `message-${Date.now()}`, summary }).select('id, patient_id, actor_id, action, entity_type, entity_id, summary, created_at').single();
  if (error) throw error;
  const row = data as ActivityRow;
  return { id: row.id, patientId: row.patient_id, sender: 'patient', text: input.text, createdAt: row.created_at, ...(input.attachment ? { attachment: input.attachment } : {}) };
}
