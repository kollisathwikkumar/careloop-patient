import { getActivePatientId, getPatientAppPatient, patchPatientAppPatient } from '@/lib/patient-backend';

export type AppointmentStatus = 'confirmed' | 'reschedule-requested' | 'awaiting-confirmation' | 'not-scheduled';

export type AppointmentSchedule = Readonly<{
  date: string;
  weekday: string;
  time: string;
  status: AppointmentStatus;
}>;

export const DEFAULT_APPOINTMENT: AppointmentSchedule = {
  date: 'Not scheduled',
  weekday: 'To be confirmed',
  time: 'To be confirmed',
  status: 'not-scheduled',
};

export function getRescheduleDates(): readonly Pick<AppointmentSchedule, 'date' | 'weekday'>[] {
  const today = new Date();
  return [7, 14, 21].map((daysAhead) => {
    const candidate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysAhead);
    return {
      date: candidate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      weekday: candidate.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  });
}

export const RESCHEDULE_TIMES: readonly string[] = ['10:30 AM', '2:00 PM', '4:30 PM'];

export function isAppointmentChanged(appointment: AppointmentSchedule): boolean {
  return appointment.date !== DEFAULT_APPOINTMENT.date || appointment.time !== DEFAULT_APPOINTMENT.time;
}

export async function loadAppointment(patientId?: string): Promise<AppointmentSchedule> {
  const linkedPatientId = patientId ?? await getActivePatientId();
  const patient = await getPatientAppPatient(linkedPatientId);
  return {
    date: patient.nextFollowup,
    weekday: patient.weekday,
    time: patient.time,
    status: patient.status === 'upcoming' && patient.response === 'Confirmed' ? 'confirmed' : patient.status === 'not-scheduled' ? 'not-scheduled' : patient.response === 'Reschedule requested' ? 'reschedule-requested' : 'awaiting-confirmation',
  };
}

export async function saveAppointment(appointment: AppointmentSchedule, patientId: string): Promise<void> {
  await patchPatientAppPatient({
    nextFollowup: appointment.date,
    weekday: appointment.weekday,
    time: appointment.time,
    response: appointment.status === 'confirmed' ? 'Confirmed' : 'Reschedule requested',
    status: appointment.status === 'confirmed' ? 'Confirmed' : 'Reschedule Requested',
  }, patientId);
}
