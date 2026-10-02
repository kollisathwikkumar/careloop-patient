import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import type { PatientReport } from '@/lib/patient-records';
import { loadLinkedPatientRecord } from '@/lib/patient';

type LinkedReport = PatientReport & { filePath: string };

function ReportCard({ report, onPress }: { report: LinkedReport; onPress: () => void }): JSX.Element {
  return (
    <Pressable accessibilityLabel={`View ${report.title} details`} accessibilityRole="button" onPress={onPress}>
      <CareLoopCard style={styles.reportCard}>
        <View style={styles.reportIcon}>
          <CareLoopIcon color={C.blue} name="reports" size={22} />
        </View>
        <View style={styles.reportCopy}>
          <View style={styles.reportHeading}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <CareLoopIcon color={C.secondary} name="chevron" size={17} />
          </View>
          <Text style={styles.reportMeta}>{report.category} · {report.date}</Text>
          <Text numberOfLines={2} style={styles.reportPreview}>{report.preview}</Text>
          <View style={styles.availablePill}>
            <CareLoopIcon color={C.green} name="check" size={13} />
            <Text style={styles.availableText}>{report.status}</Text>
          </View>
        </View>
      </CareLoopCard>
    </Pressable>
  );
}

export default function ReportsScreen(): JSX.Element {
  const router = useRouter();
  const [reports, setReports] = useState<LinkedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadLinkedPatientRecord().then((record) => {
      if (!active) return;
      const tests = new Map((record?.tests ?? []).map((test) => [test.id, test]));
      setReports((record?.reports ?? []).map((report) => ({
        id: report.id,
        title: report.file_name,
        category: tests.has(report.test_id) ? 'Lab test' : 'Visit summary',
        date: new Date(report.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }),
        clinician: 'Care team',
        status: 'Available',
        preview: tests.get(report.test_id)?.name ?? 'Shared by your care team.',
        fileName: report.file_name,
        filePath: report.file_path,
      })));
      setError(null);
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your reports.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <PatientAppFrame activeTab="reports" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <CareLoopIcon name="reports" size={24} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>Your test and visit documents in one place.</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <CareLoopCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{reports.length}</Text>
            <Text style={styles.summaryLabel}>Available reports</Text>
          </CareLoopCard>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your reports</Text>
          <Text style={styles.sectionCount}>{reports.length} {reports.length === 1 ? 'report' : 'reports'}</Text>
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.emptyCopy}>{error}</Text> : null}
        {loading ? <Text style={styles.emptyCopy}>Loading your care-team reports…</Text> : null}
        {!loading && !error && reports.length === 0 ? <Text style={styles.emptyCopy}>Reports shared by your care team will appear here.</Text> : null}
        <View style={styles.reportList}>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              onPress={() => router.push({ pathname: '/report-detail', params: { id: report.id } })}
              report={report}
            />
          ))}
        </View>
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 14, maxWidth: 560, paddingBottom: 22, paddingHorizontal: 18, paddingTop: 16, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 2 },
  headerIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  headerCopy: { flex: 1 },
  title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 1 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 74, padding: 10 },
  summaryValue: { color: C.navyDeep, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  summaryLabel: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  sectionTitle: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  sectionCount: { color: C.secondary, fontSize: 11, fontWeight: '600' },
  reportList: { gap: 10 },
  emptyCopy: { color: C.secondary, fontSize: 13, lineHeight: 19, paddingVertical: 10 },
  reportCard: { alignItems: 'flex-start', flexDirection: 'row', gap: 11, padding: 12 },
  reportIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  reportCopy: { flex: 1, minWidth: 0 },
  reportHeading: { alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: 'space-between' },
  reportTitle: { color: C.navyDeep, flex: 1, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  reportMeta: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  reportPreview: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  availablePill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.greenSurface, borderRadius: 12, flexDirection: 'row', gap: 4, marginTop: 7, paddingHorizontal: 8, paddingVertical: 4 },
  availableText: { color: C.green, fontSize: 10, fontWeight: '700', lineHeight: 14 },
});
