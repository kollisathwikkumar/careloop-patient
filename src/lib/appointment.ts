import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppointmentStatus = 'confirmed' | 'reschedule-requested';

export type AppointmentSchedule = Readonly<{
  date: string;
  weekday: string;
  time: string;
  status: AppointmentStatus;
}>;

export const DEFAULT_APPOINTMENT: AppointmentSchedule = {
  date: '28 September 2026',
  weekday: 'Monday',
  time: '10:30 AM',
  status: 'confirmed',
};

export const RESCHEDULE_DATES: readonly Pick<AppointmentSchedule, 'date' | 'weekday'>[] = [
  { date: '28 September 2026', weekday: 'Monday' },
  { date: '30 September 2026', weekday: 'Wednesday' },
  { date: '12 October 2026', weekday: 'Monday' },
];

export const RESCHEDULE_TIMES: readonly string[] = ['10:30 AM', '2:00 PM', '4:30 PM'];

const STORAGE_KEY = '@careloop/follow-up-appointment';
let cachedAppointment: AppointmentSchedule = DEFAULT_APPOINTMENT;

export function isAppointmentChanged(appointment: AppointmentSchedule): boolean {
  return appointment.date !== DEFAULT_APPOINTMENT.date || appointment.time !== DEFAULT_APPOINTMENT.time;
}

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return value === 'confirmed' || value === 'reschedule-requested';
}

function parseAppointment(value: string | null): AppointmentSchedule | null {
  if (!value) {
    return null;
  }

  const [date, weekday, time, status] = value.split('|');
  if (!date || !weekday || !time || !status || !isAppointmentStatus(status)) {
    return null;
  }

  return { date, weekday, time, status };
}

export async function loadAppointment(): Promise<AppointmentSchedule> {
  try {
    const stored = parseAppointment(await AsyncStorage.getItem(STORAGE_KEY));
    if (stored) {
      cachedAppointment = stored;
    }
  } catch {
    // The dashboard remains usable with the default appointment when storage is unavailable.
  }

  return cachedAppointment;
}

export async function saveAppointment(appointment: AppointmentSchedule): Promise<void> {
  cachedAppointment = appointment;
  await AsyncStorage.setItem(STORAGE_KEY, [appointment.date, appointment.weekday, appointment.time, appointment.status].join('|'));
}
