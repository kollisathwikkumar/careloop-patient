import { type JSX } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import { MEDICATION_SCHEDULE, type MedicationSchedule } from '@/lib/patient-records';

function MedicationCard({ medication }: { medication: MedicationSchedule }): JSX.Element {
  return (
    <CareLoopCard style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationIcon}>
          <CareLoopIcon name="medications" size={21} />
        </View>
        <View style={styles.medicationCopy}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDose}>{medication.dose}</Text>
        </View>
        <View style={styles.timePill}>
          <CareLoopIcon color={C.blue} name="clock" size={14} />
          <Text style={styles.timeText}>{medication.time}</Text>
        </View>
      </View>
      <View style={styles.instructionRow}>
        <CareLoopIcon color={C.green} name="check" size={16} />
        <Text style={styles.instructionText}>{medication.mealDirection}</Text>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Prescriber</Text>
        <Text style={styles.metaValue}>{medication.prescriber}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Duration</Text>
        <Text style={styles.metaValue}>{medication.duration}</Text>
      </View>
    </CareLoopCard>
  );
}

export default function MedicationsScreen(): JSX.Element {
  const groups = (['Morning', 'Evening'] as const).map((group) => ({
    title: group,
    items: MEDICATION_SCHEDULE.filter((medication) => medication.scheduleGroup === group),
  }));

  return (
    <PatientAppFrame activeTab="medications" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <CareLoopIcon name="medications" size={24} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Medications</Text>
            <Text style={styles.subtitle}>See what’s scheduled and when to take it.</Text>
          </View>
        </View>

        <View accessibilityLabel="Demo schedule notice" style={styles.demoNotice}>
          <CareLoopIcon color={C.amber} name="info" size={19} />
          <View style={styles.demoCopy}>
            <Text style={styles.demoTitle}>DEMO SCHEDULE</Text>
            <Text style={styles.demoText}>Sample medicines and timings are for layout only. Follow your own prescription and confirm directions with your care team.</Text>
          </View>
        </View>

        <CareLoopCard style={styles.todayCard}>
          <View style={styles.todayIcon}><CareLoopIcon color={C.blue} name="calendar" size={20} /></View>
          <View style={styles.todayCopy}>
            <Text style={styles.todayTitle}>Today’s schedule</Text>
            <Text style={styles.todaySubtitle}>{MEDICATION_SCHEDULE.length} example reminders · local demo content</Text>
          </View>
        </CareLoopCard>

        {groups.map(({ title, items }) => items.length > 0 ? (
          <View key={title} style={styles.group}>
            <View style={styles.groupHeading}>
              <Text style={styles.groupTitle}>{title}</Text>
              <Text style={styles.groupCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
            </View>
            {items.map((medication) => <MedicationCard key={medication.id} medication={medication} />)}
          </View>
        ) : null)}

        <View style={styles.reminderNote}>
          <CareLoopIcon color={C.blue} name="reminder" size={19} />
          <Text style={styles.reminderText}>Reminder notifications and prescription syncing will be connected when your care account is linked.</Text>
        </View>
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 14, maxWidth: 560, paddingBottom: 23, paddingHorizontal: 18, paddingTop: 16, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 2 },
  headerIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  headerCopy: { flex: 1 },
  title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 1 },
  demoNotice: { alignItems: 'flex-start', backgroundColor: C.amberSurface, borderColor: '#F8E2BD', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 11 },
  demoCopy: { flex: 1 },
  demoTitle: { color: '#985900', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, lineHeight: 14 },
  demoText: { color: '#845E2B', fontSize: 11, lineHeight: 16, marginTop: 2 },
  todayCard: { alignItems: 'center', flexDirection: 'row', gap: 10, padding: 12 },
  todayIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  todayCopy: { flex: 1 },
  todayTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  todaySubtitle: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  group: { gap: 9 },
  groupHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  groupTitle: { color: C.navy, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  groupCount: { color: C.secondary, fontSize: 11, fontWeight: '600' },
  medicationCard: { padding: 12 },
  medicationHeader: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  medicationIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 21, height: 42, justifyContent: 'center', width: 42 },
  medicationCopy: { flex: 1, minWidth: 0 },
  medicationName: { color: C.navyDeep, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  medicationDose: { color: C.secondary, fontSize: 10, lineHeight: 15, marginTop: 1 },
  timePill: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 14, flexDirection: 'row', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  timeText: { color: C.blue, fontSize: 11, fontWeight: '800', lineHeight: 15 },
  instructionRow: { alignItems: 'center', backgroundColor: C.greenSurface, borderRadius: 12, flexDirection: 'row', gap: 6, marginTop: 10, paddingHorizontal: 9, paddingVertical: 7 },
  instructionText: { color: C.navy, flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 16 },
  cardDivider: { backgroundColor: C.line, height: StyleSheet.hairlineWidth, marginVertical: 9 },
  metaRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', paddingVertical: 3 },
  metaLabel: { color: C.secondary, fontSize: 10, lineHeight: 15 },
  metaValue: { color: C.secondary, flex: 1, fontSize: 10, lineHeight: 15, textAlign: 'right' },
  reminderNote: { alignItems: 'flex-start', backgroundColor: C.surfaceBlue, borderRadius: 15, flexDirection: 'row', gap: 9, paddingHorizontal: 11, paddingVertical: 10 },
  reminderText: { color: C.secondary, flex: 1, fontSize: 11, lineHeight: 16 },
});
