import { useLocalSearchParams, useRouter } from 'expo-router';
import { type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import { PATIENT_REPORTS } from '@/lib/patient-records';

export default function ReportDetailScreen(): JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const report = PATIENT_REPORTS.find((item) => item.id === id);

  return (
    <PatientAppFrame activeTab="reports" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to reports" accessibilityRole="button" onPress={() => router.replace('/reports')} style={styles.backButton}>
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Report details</Text>
            <Text style={styles.subtitle}>Review the document information.</Text>
          </View>
        </View>

        {report ? (
          <>
            <View style={styles.demoNotice}>
              <CareLoopIcon color={C.amber} name="info" size={19} />
              <Text style={styles.demoText}>DEMO DATA · Example layout only. This is not a verified medical result.</Text>
            </View>

            <CareLoopCard style={styles.reportHero}>
              <View style={styles.largeIcon}>
                <CareLoopIcon name="reports" size={27} />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportCategory}>{report.category}</Text>
              <View style={styles.statusPill}>
                <CareLoopIcon color={C.green} name="check" size={15} />
                <Text style={styles.statusText}>{report.status}</Text>
              </View>
            </CareLoopCard>

            <Text style={styles.sectionTitle}>Report information</Text>
            <CareLoopCard style={styles.informationCard}>
              <InfoRow label="Report date" value={report.date} />
              <View style={styles.divider} />
              <InfoRow label="Added by" value={report.clinician} />
              <View style={styles.divider} />
              <InfoRow label="Document" value={report.fileName} />
            </CareLoopCard>

            <Text style={styles.sectionTitle}>Summary</Text>
            <CareLoopCard style={styles.summaryCard}>
              <Text style={styles.summaryText}>{report.preview}</Text>
              <Text style={styles.summaryFootnote}>Your care team’s verified report and interpretation will appear here when connected.</Text>
            </CareLoopCard>

            <View style={styles.contactCard}>
              <CareLoopIcon color={C.blue} name="doctor" size={20} />
              <Text style={styles.contactText}>For questions about a real report, contact your care team.</Text>
            </View>
          </>
        ) : (
          <CareLoopCard style={styles.notFoundCard}>
            <View style={styles.largeIcon}><CareLoopIcon name="reports" size={27} /></View>
            <Text style={styles.notFoundTitle}>Report not found</Text>
            <Text style={styles.summaryText}>This report may have been removed or the link may be out of date.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/reports')} style={styles.backToReports}>
              <Text style={styles.backToReportsText}>Back to reports</Text>
            </Pressable>
          </CareLoopCard>
        )}
      </ScrollView>
    </PatientAppFrame>
  );
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 13, maxWidth: 560, paddingBottom: 24, paddingHorizontal: 18, paddingTop: 14, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 3 },
  backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 8, width: 27 },
  backChevron: { color: C.navy, fontSize: 38, fontWeight: '300', lineHeight: 40, marginTop: -4 },
  headerCopy: { flex: 1 },
  title: { color: C.navyDeep, fontSize: 24, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: C.secondary, fontSize: 12, lineHeight: 18, marginTop: 1 },
  demoNotice: { alignItems: 'center', backgroundColor: C.amberSurface, borderColor: '#F8E2BD', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 9, paddingHorizontal: 11, paddingVertical: 10 },
  demoText: { color: '#845E2B', flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 16 },
  reportHero: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 19 },
  largeIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  reportTitle: { color: C.navyDeep, fontSize: 17, fontWeight: '800', lineHeight: 23, marginTop: 10, textAlign: 'center' },
  reportCategory: { color: C.secondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  statusPill: { alignItems: 'center', backgroundColor: C.greenSurface, borderRadius: 14, flexDirection: 'row', gap: 4, marginTop: 10, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { color: C.green, fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: C.navy, fontSize: 15, fontWeight: '800', lineHeight: 20, marginTop: 2 },
  informationCard: { paddingHorizontal: 13, paddingVertical: 2 },
  infoRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between', paddingVertical: 12 },
  infoLabel: { color: C.secondary, fontSize: 12, lineHeight: 17 },
  infoValue: { color: C.navy, flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17, textAlign: 'right' },
  divider: { backgroundColor: C.line, height: StyleSheet.hairlineWidth },
  summaryCard: { padding: 14 },
  summaryText: { color: C.navy, fontSize: 13, lineHeight: 19 },
  summaryFootnote: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 8 },
  contactCard: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 16, flexDirection: 'row', gap: 9, paddingHorizontal: 12, paddingVertical: 11 },
  contactText: { color: C.navy, flex: 1, fontSize: 11, lineHeight: 16 },
  notFoundCard: { alignItems: 'center', gap: 9, padding: 22 },
  notFoundTitle: { color: C.navyDeep, fontSize: 17, fontWeight: '800' },
  backToReports: { alignItems: 'center', backgroundColor: C.blue, borderRadius: 15, marginTop: 3, minHeight: 42, justifyContent: 'center', paddingHorizontal: 16 },
  backToReportsText: { color: C.surface, fontSize: 13, fontWeight: '700' },
});
