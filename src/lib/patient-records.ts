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
    id: 'blood-panel-demo',
    title: 'Blood test panel',
    category: 'Lab test',
    date: '21 September 2026',
    clinician: 'Dr. K. Sathwik',
    status: 'Available',
    preview: 'Example report entry. Verified test results are not connected in this demo.',
    fileName: 'blood-test-panel-demo.pdf',
  },
  {
    id: 'imaging-demo',
    title: 'Imaging report',
    category: 'Imaging',
    date: '18 September 2026',
    clinician: 'City Care Hospital',
    status: 'Available',
    preview: 'Example imaging entry. Open the detail page to see the report layout.',
    fileName: 'imaging-report-demo.pdf',
  },
  {
    id: 'visit-summary-demo',
    title: 'Follow-up visit summary',
    category: 'Visit summary',
    date: '21 September 2026',
    clinician: 'Dr. K. Sathwik',
    status: 'Available',
    preview: 'Example visit summary. Patient-specific clinical notes are not connected.',
    fileName: 'follow-up-summary-demo.pdf',
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
