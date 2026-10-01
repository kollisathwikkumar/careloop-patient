import { getPatientAppPatient as getDemoPatient, patchPatientAppPatient as patchDemoPatient } from '@/lib/patient-backend';

export type AppointmentStatus = 'confirmed' | 'reschedule-requested' | 'awaiting-confirmation';

export type AppointmentSchedule = Readonly<{
  date: string;
  weekday: string;
  time: string;
  status: AppointmentStatus;
}>;

export const DEFAULT_APPOINTMENT: AppointmentSchedule = {
  date: '24 September 2026',
  weekday: 'Thursday',
  time: '10:30 AM',
  status: 'confirmed',
};

export const RESCHEDULE_DATES: readonly Pick<AppointmentSchedule, 'date' | 'weekday'>[] = [
  { date: '28 September 2026', weekday: 'Monday' },
  { date: '30 September 2026', weekday: 'Wednesday' },
  { date: '12 October 2026', weekday: 'Monday' },
];

export const RESCHEDULE_TIMES: readonly string[] = ['10:30 AM', '2:00 PM', '4:30 PM'];

let cachedAppointment: AppointmentSchedule = DEFAULT_APPOINTMENT;

export function isAppointmentChanged(appointment: AppointmentSchedule): boolean {
  return appointment.date !== DEFAULT_APPOINTMENT.date || appointment.time !== DEFAULT_APPOINTMENT.time;
}

export async function loadAppointment(patientId = 'CL-1042'): Promise<AppointmentSchedule> {
  try {
    const patient = await getDemoPatient(patientId);
    cachedAppointment = {
      date: patient.nextFollowup,
      weekday: patient.weekday,
      time: patient.time,
      status: patient.response === 'Confirmed' ? 'confirmed' : patient.response === 'Reschedule requested' ? 'reschedule-requested' : 'awaiting-confirmation',
    };
  } catch {
    // The patient demo can still open when the local demo API is starting.
  }

  return cachedAppointment;
}

export async function saveAppointment(appointment: AppointmentSchedule, patientId = 'CL-1042'): Promise<void> {
  const patient = await patchDemoPatient({
    nextFollowup: appointment.date,
    weekday: appointment.weekday,
    time: appointment.time,
    response: appointment.status === 'confirmed' ? 'Confirmed' : 'Reschedule requested',
    status: appointment.status === 'confirmed' ? 'Confirmed' : 'Reschedule Requested',
  }, patientId);
  cachedAppointment = { date: patient.nextFollowup, weekday: patient.weekday, time: patient.time, status: appointment.status };
}
