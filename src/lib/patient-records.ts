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
