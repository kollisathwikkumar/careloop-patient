import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';

import { decodeChatMessage, encodeChatMessage } from '@/lib/chat-message';
import { parseAppointmentDate } from '@/lib/appointment-datetime';
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

export type PatientAppAttachment = { kind: 'image' | 'report'; name: string; mimeType: string; data: string; filePath?: string };
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

async function getAuthenticatedPatientId(): Promise<string | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  const { data, error } = await supabase.from('patients').select('id').eq('auth_user_id', userData.user.id).maybeSingle();
  if (error) throw error;
  return (data as { id: string } | null)?.id ?? null;
}

async function requireLinkedPatientId(): Promise<string> {
  const patientId = await getAuthenticatedPatientId();
  if (!patientId) throw new Error('Sign in and connect your care team to view patient records.');
  return patientId;
}

export async function getActivePatientId(): Promise<string> {
  const linkedPatientId = await requireLinkedPatientId();
  await AsyncStorage.setItem(ACTIVE_PATIENT_KEY, linkedPatientId);
  return linkedPatientId;
}

export async function setActivePatientId(patientId: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_PATIENT_KEY, patientId);
}

async function loadPatient(patientId: string): Promise<PatientAppPatient> {
  const [patientResult, appointmentResult, planResult, followUpResult] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('appointments').select('id, patient_id, scheduled_at, status, purpose, notes').eq('patient_id', patientId).in('status', ['upcoming', 'overdue', 'missed']).order('scheduled_at'),
    supabase.from('care_plans').select('actions').eq('patient_id', patientId).eq('status', 'active').order('review_date').limit(1),
    supabase.from('follow_up_events').select('outcome, next_steps, attempted_at').eq('patient_id', patientId).order('attempted_at', { ascending: false }).limit(1),
  ]);
  if (patientResult.error) throw patientResult.error;
  if (appointmentResult.error) throw appointmentResult.error;
  if (planResult.error) throw planResult.error;
  if (followUpResult.error) throw followUpResult.error;

  const patient = patientResult.data as PatientRow;
  const appointments = (appointmentResult.data ?? []) as AppointmentRow[];
  const appointment = appointments.find((item) => item.status === 'upcoming' || item.status === 'overdue') ?? appointments.find((item) => item.status === 'missed') ?? null;
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

export async function getPatientAppPatient(patientId?: string): Promise<PatientAppPatient> {
  const activePatientId = await requireLinkedPatientId();
  if (patientId && patientId !== activePatientId) throw new Error('Patient access is not permitted.');
  return loadPatient(activePatientId);
}

export async function getPatientAppPatients(): Promise<PatientAppPatient[]> {
  const patientId = await requireLinkedPatientId();
  return [await loadPatient(patientId)];
}

export async function patchPatientAppPatient(
  patch: Partial<Pick<PatientAppPatient, 'nextFollowup' | 'weekday' | 'time' | 'response' | 'status'>>,
  patientId?: string,
): Promise<PatientAppPatient> {
  const activePatientId = await requireLinkedPatientId();
  if (patientId && patientId !== activePatientId) throw new Error('Patient access is not permitted.');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in is required to update your appointment.');
  const { data: appointmentRows, error: appointmentError } = await supabase.from('appointments').select('id, patient_id, scheduled_at, status, purpose, notes').eq('patient_id', activePatientId).in('status', ['upcoming', 'overdue', 'missed']).order('scheduled_at');
  if (appointmentError) throw appointmentError;
  const appointmentData = ((appointmentRows ?? []) as AppointmentRow[]).find((item) => item.status === 'upcoming' || item.status === 'overdue') ?? ((appointmentRows ?? []) as AppointmentRow[]).find((item) => item.status === 'missed') ?? null;

  const nextScheduledAt = patch.response === 'Reschedule requested' && patch.nextFollowup && patch.time
    ? parseAppointmentDate(patch.nextFollowup, patch.time)
    : null;
  if (!appointmentData && (patch.response === 'Confirmed' || patch.response === 'Reschedule requested')) {
    throw new Error('There is no appointment available to respond to.');
  }
  if (patch.response === 'Confirmed' || patch.response === 'Reschedule requested') {
    const { error } = await supabase.rpc('respond_to_appointment', {
      target_appointment_id: (appointmentData as AppointmentRow).id,
      response: patch.response === 'Confirmed' ? 'confirmed' : 'reschedule_requested',
      requested_scheduled_at: patch.response === 'Reschedule requested' ? nextScheduledAt : null,
    });
    if (error) throw error;
  }

  return loadPatient(activePatientId);
}

export async function getPatientReportUrl(filePath: string): Promise<string | null> {
  const patientId = await requireLinkedPatientId();
  if (!filePath.startsWith(`${patientId}/`)) throw new Error('Report access is not permitted.');
  const { data, error } = await supabase.storage.from('careloop-reports').createSignedUrl(filePath, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function getPatientAppMessages(patientId?: string): Promise<PatientAppMessage[]> {
  const activePatientId = await requireLinkedPatientId();
  if (patientId && patientId !== activePatientId) throw new Error('Patient access is not permitted.');
  const [{ data: userData }, messages, activity] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('care_team_messages').select('id, patient_id, sender_id, body, created_at').eq('patient_id', activePatientId).order('created_at').limit(60),
    supabase.from('activity_log').select('id, patient_id, actor_id, action, entity_type, entity_id, summary, created_at').eq('patient_id', activePatientId).eq('entity_type', 'message').order('created_at'),
  ]);
  if (messages.error) throw messages.error;
  if (activity.error) throw activity.error;
  const currentMessages = await Promise.all(((messages.data ?? []) as { id: string; patient_id: string; sender_id: string; body: string; created_at: string }[]).map(async (row) => {
    const content = decodeChatMessage(row.body);
    const attachmentUrl = content.attachment?.kind === 'image'
      ? await getPatientReportUrl(content.attachment.filePath)
      : null;
    return {
      id: row.id,
      patientId: row.patient_id,
      sender: row.sender_id === userData.user?.id ? 'patient' as const : 'care-team' as const,
      text: content.text,
      createdAt: row.created_at,
      ...(content.attachment ? { attachment: { kind: content.attachment.kind, name: content.attachment.name, mimeType: content.attachment.mimeType, data: attachmentUrl ?? '', filePath: content.attachment.filePath } } : {}),
    };
  }));
  const legacyMessages = ((activity.data ?? []) as ActivityRow[]).map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    sender: row.actor_id && row.actor_id === userData.user?.id ? 'patient' as const : 'care-team' as const,
    text: row.summary,
    createdAt: row.created_at,
  }));
  return [...currentMessages, ...legacyMessages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function sendPatientAppMessage(input: Omit<PatientAppMessage, 'id' | 'createdAt'>): Promise<PatientAppMessage> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in is required to send a message.');
  const patientId = await requireLinkedPatientId();
  if (input.patientId !== patientId) throw new Error('Patient access is not permitted.');
  let attachment: { kind: 'image' | 'report'; name: string; mimeType: string; filePath: string } | undefined;
  if (input.attachment?.kind === 'report') {
    const path = input.attachment.filePath;
    if (!path?.startsWith(`${patientId}/`)) throw new Error('Choose a report from your connected care record.');
    attachment = { kind: 'report', name: input.attachment.name, mimeType: input.attachment.mimeType, filePath: path };
  } else if (input.attachment?.kind === 'image') {
    const match = input.attachment.data.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw new Error('Choose a supported image (JPEG, PNG, or WebP).');
    const bytes = decode(match[2]);
    if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('Images must be 8 MB or smaller.');
    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    const filePath = `${patientId}/messages/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('careloop-reports').upload(filePath, bytes, {
      contentType: match[1],
      upsert: false,
    });
    if (uploadError) throw uploadError;
    attachment = { kind: 'image', name: input.attachment.name, mimeType: match[1], filePath };
  }
  const body = encodeChatMessage({
    text: input.text,
    ...(attachment ? { attachment } : {}),
  });
  const { data, error } = await supabase.from('care_team_messages').insert({ patient_id: patientId, sender_id: userData.user.id, body }).select('id, patient_id, sender_id, body, created_at').single();
  if (error) throw error;
  const row = data as { id: string; patient_id: string; sender_id: string; body: string; created_at: string };
  const content = decodeChatMessage(row.body);
  return { id: row.id, patientId: row.patient_id, sender: 'patient', text: content.text, createdAt: row.created_at, ...(input.attachment ? { attachment: input.attachment } : {}) };
}
