const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const;

/** Convert the patient-facing English date/time labels to an unambiguous local-time ISO timestamp. */
export function parseAppointmentDate(date: string, time: string): string {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const namedDate = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(date.trim());
  const year = isoDate ? Number(isoDate[1]) : Number(namedDate?.[3]);
  const month = isoDate ? Number(isoDate[2]) - 1 : MONTHS.indexOf((namedDate?.[2] ?? '').toLowerCase() as typeof MONTHS[number]);
  const day = isoDate ? Number(isoDate[3]) : Number(namedDate?.[1]);
  const clock12 = /^(1[0-2]|[1-9]):([0-5]\d)\s*(AM|PM)$/i.exec(time.trim());
  const clock24 = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!Number.isInteger(year) || year < 1000 || month < 0 || month > 11 || !Number.isInteger(day) || day < 1 || day > 31 || (!clock12 && !clock24)) {
    throw new Error('The appointment date or time is invalid.');
  }
  const displayedHour = Number(clock12?.[1] ?? clock24?.[1]);
  const hour = clock12 ? (displayedHour % 12) + (clock12[3]?.toUpperCase() === 'PM' ? 12 : 0) : displayedHour;
  const minute = Number(clock12?.[2] ?? clock24?.[2]);
  const parsed = new Date(year, month, day, hour, minute, 0, 0);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month || parsed.getDate() !== day) {
    throw new Error('The appointment date or time is invalid.');
  }
  return parsed.toISOString();
}
