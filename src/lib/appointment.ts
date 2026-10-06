import { getActivePatientId, getPatientAppPatient, patchPatientAppPatient } from '@/lib/patient-backend';

export type AppointmentStatus = 'confirmed' | 'reschedule-requested' | 'awaiting-confirmation' | 'missed' | 'not-scheduled';

export type AppointmentSchedule = Readonly<{
  date: string;
  weekday: string;
  time: string;
  status: AppointmentStatus;
}>;

export type RescheduleCalendarCell = Readonly<{
  date: string;
  day: number;
  weekday: string;
  disabled: boolean;
}>;

export type RescheduleCalendarMonth = Readonly<{
  key: string;
  label: string;
  cells: readonly (RescheduleCalendarCell | null)[];
}>;

export const DEFAULT_APPOINTMENT: AppointmentSchedule = {
  date: 'Not scheduled',
  weekday: 'To be confirmed',
  time: 'To be confirmed',
  status: 'not-scheduled',
};

function formatRescheduleDate(candidate: Date): Pick<AppointmentSchedule, 'date' | 'weekday'> {
  return {
    date: candidate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    weekday: candidate.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

export function getRescheduleCalendarMonths(): readonly RescheduleCalendarMonth[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayStart = new Date(currentYear, today.getMonth(), today.getDate());
  return Array.from({ length: 12 - today.getMonth() }, (_value, monthOffset) => {
    const month = today.getMonth() + monthOffset;
    const firstDay = new Date(currentYear, month, 1);
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    const leadingEmptyCells = firstDay.getDay();
    const cells = Array.from({ length: leadingEmptyCells + daysInMonth }, (_cell, index) => {
      if (index < leadingEmptyCells) return null;
      const day = index - leadingEmptyCells + 1;
      const candidate = new Date(currentYear, month, day);
      return { ...formatRescheduleDate(candidate), day, disabled: candidate < todayStart };
    });
    return {
      key: `${currentYear}-${month}`,
      label: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      cells,
    };
  });
}

export function getRescheduleDates(): readonly Pick<AppointmentSchedule, 'date' | 'weekday'>[] {
  return getRescheduleCalendarMonths().flatMap((month) => month.cells.filter((cell): cell is RescheduleCalendarCell => cell !== null && !cell.disabled).map(({ date, weekday }) => ({ date, weekday })));
}

function formatRescheduleTime(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

export const RESCHEDULE_TIMES: readonly string[] = Array.from({ length: 17 }, (_value, index) => formatRescheduleTime((9 * 60) + (index * 30)));

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
    status: patient.status === 'missed' ? 'missed' : patient.status === 'upcoming' && patient.response === 'Confirmed' ? 'confirmed' : patient.status === 'not-scheduled' ? 'not-scheduled' : patient.response === 'Reschedule requested' ? 'reschedule-requested' : 'awaiting-confirmation',
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
