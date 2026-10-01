export type PatientReportCategory = 'Lab test' | 'Imaging' | 'Visit summary';

export type PatientReport = {
  id: string;
  title: string;
  category: PatientReportCategory;
  date: string;
  clinician: string;
  status: 'Available';
  preview: string;
  fileName: string;
};

export const PATIENT_REPORTS: readonly PatientReport[] = [
  {
    id: 'ramesh-care-summary',
    title: 'Diabetes care coordination summary',
    category: 'Visit summary',
    date: '13 August 2026',
    clinician: 'Dr. K. Sathwik',
    status: 'Available',
    preview: 'Care coordination summary for Ramesh Kumar · CL-1042. Last recorded care activity: 13 August 2026. Next step: confirm the diabetes review with Dr. K. Sathwik.',
    fileName: 'CL-1042-demo-report.pdf',
  },
];

export type MedicationSchedule = {
  id: string;
  name: string;
  dose: string;
  time: string;
  mealDirection: string;
  scheduleGroup: 'Morning' | 'Evening';
  prescriber: string;
  duration: string;
};

export const MEDICATION_SCHEDULE: readonly MedicationSchedule[] = [
  {
    id: 'morning-demo',
    name: 'Sample medicine A',
    dose: 'Dose set by your care team',
    time: '8:00 AM',
    mealDirection: 'After breakfast · example timing',
    scheduleGroup: 'Morning',
    prescriber: 'Dr. K. Sathwik · sample entry',
    duration: 'Example schedule only',
  },
  {
    id: 'evening-demo',
    name: 'Sample medicine B',
    dose: 'Dose set by your care team',
    time: '8:00 PM',
    mealDirection: 'After dinner · example timing',
    scheduleGroup: 'Evening',
    prescriber: 'Dr. K. Sathwik · sample entry',
    duration: 'Example schedule only',
  },
];
