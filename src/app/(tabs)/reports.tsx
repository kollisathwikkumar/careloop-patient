import { useRouter } from 'expo-router';
import { type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import { PATIENT_REPORTS, type PatientReport } from '@/lib/patient-records';

function ReportCard({ report, onPress }: { report: PatientReport; onPress: () => void }): JSX.Element {
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

        <View accessibilityLabel="Demo data notice" style={styles.demoNotice}>
          <CareLoopIcon color={C.amber} name="info" size={19} />
          <View style={styles.demoCopy}>
            <Text style={styles.demoTitle}>DEMO DATA</Text>
            <Text style={styles.demoText}>These sample entries show the screen layout. They are not your medical results.</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <CareLoopCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{PATIENT_REPORTS.length}</Text>
            <Text style={styles.summaryLabel}>Sample reports</Text>
          </CareLoopCard>
          <CareLoopCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>Ready</Text>
            <Text style={styles.summaryLabel}>Report details</Text>
          </CareLoopCard>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your reports</Text>
          <Text style={styles.sectionCount}>{PATIENT_REPORTS.length} examples</Text>
        </View>

        <View style={styles.reportList}>
          {PATIENT_REPORTS.map((report) => (
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
  demoNotice: { alignItems: 'flex-start', backgroundColor: C.amberSurface, borderColor: '#F8E2BD', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 11 },
  demoCopy: { flex: 1 },
  demoTitle: { color: '#985900', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, lineHeight: 14 },
  demoText: { color: '#845E2B', fontSize: 11, lineHeight: 16, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 74, padding: 10 },
  summaryValue: { color: C.navyDeep, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  summaryLabel: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  sectionTitle: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  sectionCount: { color: C.secondary, fontSize: 11, fontWeight: '600' },
  reportList: { gap: 10 },
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
