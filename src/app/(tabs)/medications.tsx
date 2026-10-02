import { useEffect, useState, type JSX } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import type { Medication } from '@/lib/staff';
import { loadLinkedPatientRecord } from '@/lib/patient';

function formatDate(value: string | null): string {
  if (!value) return 'No end date set';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function MedicationCard({ medication }: { medication: Medication }): JSX.Element {
  return (
    <CareLoopCard style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationIcon}><CareLoopIcon name="medications" size={21} /></View>
        <View style={styles.medicationCopy}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDose}>{medication.dosage}</Text>
        </View>
        <View style={[styles.statusPill, medication.status === 'current' ? styles.currentPill : styles.pastPill]}>
          <Text style={styles.statusText}>{medication.status === 'current' ? 'Current' : 'Past'}</Text>
        </View>
      </View>
      {medication.instructions ? <Text style={styles.instructionText}>{medication.instructions}</Text> : null}
      <View style={styles.cardDivider} />
      <View style={styles.metaRow}><Text style={styles.metaLabel}>Started</Text><Text style={styles.metaValue}>{formatDate(medication.start_date)}</Text></View>
      <View style={styles.metaRow}><Text style={styles.metaLabel}>Ends</Text><Text style={styles.metaValue}>{formatDate(medication.end_date)}</Text></View>
    </CareLoopCard>
  );
}

export default function MedicationsScreen(): JSX.Element {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void loadLinkedPatientRecord().then((record) => {
      if (active) setMedications(record?.medications ?? []);
    }).catch((reason: Error) => {
      if (active) setError(reason.message || 'Could not load medications.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <PatientAppFrame activeTab="medications" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><CareLoopIcon name="medications" size={24} /></View>
          <View style={styles.headerCopy}><Text style={styles.title}>Medications</Text><Text style={styles.subtitle}>Medication details shared by your care team.</Text></View>
        </View>
        <CareLoopCard style={styles.todayCard}>
          <View style={styles.todayIcon}><CareLoopIcon color={C.blue} name="medications" size={20} /></View>
          <View style={styles.todayCopy}><Text style={styles.todayTitle}>Your medications</Text><Text style={styles.todaySubtitle}>{medications.length} {medications.length === 1 ? 'record' : 'records'}</Text></View>
        </CareLoopCard>
        {loading ? <ActivityIndicator color={C.blue} /> : null}
        {error ? <Text accessibilityRole="alert" style={styles.emptyCopy}>{error}</Text> : null}
        {!loading && !error && medications.length === 0 ? <Text style={styles.emptyCopy}>Medications shared by your care team will appear here.</Text> : null}
        {medications.map((medication) => <MedicationCard key={medication.id} medication={medication} />)}
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 14, maxWidth: 560, paddingBottom: 23, paddingHorizontal: 18, paddingTop: 16, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 2 },
  headerIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  headerCopy: { flex: 1 }, title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 1 },
  todayCard: { alignItems: 'center', flexDirection: 'row', gap: 10, padding: 12 },
  todayIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  todayCopy: { flex: 1 }, todayTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  todaySubtitle: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  medicationCard: { padding: 12 }, medicationHeader: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  medicationIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 21, height: 42, justifyContent: 'center', width: 42 },
  medicationCopy: { flex: 1, minWidth: 0 }, medicationName: { color: C.navyDeep, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  medicationDose: { color: C.secondary, fontSize: 11, lineHeight: 15, marginTop: 1 },
  statusPill: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5 }, currentPill: { backgroundColor: C.greenSurface }, pastPill: { backgroundColor: '#F1F5F8' },
  statusText: { color: C.navy, fontSize: 10, fontWeight: '700' },
  instructionText: { color: C.navy, fontSize: 12, lineHeight: 18, marginTop: 10 },
  cardDivider: { backgroundColor: C.line, height: StyleSheet.hairlineWidth, marginVertical: 9 },
  metaRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', paddingVertical: 3 },
  metaLabel: { color: C.secondary, fontSize: 10, lineHeight: 15 }, metaValue: { color: C.secondary, flex: 1, fontSize: 10, lineHeight: 15, textAlign: 'right' },
  emptyCopy: { color: C.secondary, fontSize: 13, lineHeight: 19, paddingVertical: 10 },
});
