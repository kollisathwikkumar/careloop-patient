import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_APPOINTMENT, isAppointmentChanged, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame, type CareLoopIconName } from '@/components/careloop-ui';

type JourneyState = 'completed' | 'upcoming' | 'planned';

type JourneyItemProps = {
  date: string;
  description: string;
  icon: CareLoopIconName;
  label: string;
  state: JourneyState;
  time: string;
  connectorColor?: string;
  onPress?: () => void;
};

function JourneyItem({ date, description, icon, label, state, time, connectorColor, onPress }: JourneyItemProps): JSX.Element {
  const stateLabel = state === 'completed' ? 'Completed' : state === 'upcoming' ? 'Upcoming' : 'Planned';
  const nodeColor = state === 'completed' ? C.green : state === 'upcoming' ? C.blue : C.muted;
  const nodeSurface = state === 'completed' ? C.greenSurface : state === 'upcoming' ? C.surfaceBlue : '#F1F5F8';

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        {connectorColor ? <View style={[styles.timelineConnector, { borderLeftColor: connectorColor }]} /> : null}
        <View style={[styles.timelineNode, { backgroundColor: nodeColor, borderColor: nodeColor }]}>
          {state === 'completed' ? <CareLoopIcon color="#FFFFFF" name="check" size={17} /> : <CareLoopIcon color="#FFFFFF" name={icon} size={16} />}
        </View>
      </View>
      <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={styles.timelineCardOuter}>
        <CareLoopCard style={[styles.timelineCard, { borderLeftColor: nodeColor, borderLeftWidth: 3 }]}>
          <View style={styles.timelineCardHeader}>
            <View style={styles.timelineIconBubble}>
              <CareLoopIcon color={nodeColor} name={icon} size={20} />
            </View>
            <View style={styles.timelineTitleCopy}>
              <Text style={styles.timelineLabel}>{label}</Text>
              <Text style={styles.timelineDate}>{date} · {time}</Text>
              <Text style={styles.timelineDoctor}>Dr. K. Sathwik</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: nodeSurface }]}>
              <Text style={[styles.statusText, { color: nodeColor }]}>{stateLabel}</Text>
            </View>
          </View>
          <View style={[styles.timelineMessage, { backgroundColor: nodeSurface }]}>
            <Text style={[styles.timelineMessageText, { color: nodeColor }]}>{description}</Text>
          </View>
        </CareLoopCard>
      </Pressable>
    </View>
  );
}

export default function JourneyScreen(): JSX.Element {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);

  useEffect(() => {
    let active = true;
    void loadAppointment().then((loadedAppointment) => {
      if (active) {
        setAppointment(loadedAppointment);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const nextDate = isAppointmentChanged(appointment) ? appointment.date : '28 September 2026';
  const nextTime = isAppointmentChanged(appointment) ? appointment.time : '10:30 AM';
  const nextStatus = appointment.status === 'reschedule-requested' ? 'Your reschedule request is with the care team.' : 'Your next step: confirm your appointment.';

  return (
    <PatientAppFrame activeTab="journey" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}>
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Care Journey</Text>
            <Text style={styles.subtitle}>Your path to better care, together.</Text>
          </View>
          <Pressable accessibilityLabel="How the care journey works" accessibilityRole="button" onPress={() => Alert.alert('How it works', 'Your care journey keeps completed, upcoming, and planned visits together.')} style={styles.howButton}>
            <CareLoopIcon name="info" size={17} />
            <Text style={styles.howButtonText}>How it works?</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <CareLoopIcon name="calendar" size={25} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>You’re doing great!</Text>
            <Text style={styles.summaryText}>You’ve completed 2 follow-ups and have 1 upcoming visit.</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your care timeline</Text>
          <Text style={styles.sectionCount}>4 visits</Text>
        </View>

        <View style={styles.timeline}>
          <JourneyItem
            date="12 August 2026"
            description="Thank you for attending your consultation."
            icon="doctor"
            label="Initial Consultation"
            state="completed"
            time="11:00 AM"
            connectorColor={C.green}
            onPress={() => Alert.alert('Initial Consultation', 'Completed on 12 August 2026 at 11:00 AM.')}
          />
          <JourneyItem
            date="21 September 2026"
            description="Your follow-up visit is complete."
            icon="document"
            label="Follow-up Visit"
            state="completed"
            time="10:30 AM"
            connectorColor={C.blue}
            onPress={() => Alert.alert('Follow-up Visit', 'Completed on 21 September 2026 at 10:30 AM.')}
          />
          <JourneyItem
            date={nextDate}
            description={nextStatus}
            icon="calendar"
            label="Follow-up Visit"
            state="upcoming"
            time={nextTime}
            connectorColor={C.muted}
            onPress={() => router.replace('/home')}
          />
          <JourneyItem
            date="12 October 2026"
            description="This review will be planned after your upcoming follow-up."
            icon="calendar"
            label="Review Visit"
            state="planned"
            time="10:30 AM"
          />
        </View>

        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <CareLoopIcon color={C.green} name="heart" size={28} />
          </View>
          <View style={styles.footerCopy}>
            <Text style={styles.footerTitle}>Care continues.</Text>
            <Text style={styles.footerText}>One follow-up at a time.</Text>
          </View>
        </View>
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', maxWidth: 560, paddingBottom: 14, paddingHorizontal: 16, paddingTop: 8, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 8, width: 27 },
  backChevron: { color: C.navy, fontSize: 38, fontWeight: '300', lineHeight: 40, marginTop: -4 },
  headerCopy: { flex: 1 },
  title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 18, marginTop: 1 },
  howButton: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#D2E9F8', borderRadius: 22, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 38, paddingHorizontal: 9 },
  howButtonText: { color: C.blue, fontSize: 11, fontWeight: '700' },
  summaryCard: { alignItems: 'center', backgroundColor: '#EDF7FF', borderRadius: 22, flexDirection: 'row', gap: 11, marginBottom: 14, paddingHorizontal: 13, paddingVertical: 12 },
  summaryIcon: { alignItems: 'center', backgroundColor: C.surface, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: C.navyDeep, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  summaryText: { color: C.secondary, fontSize: 12, lineHeight: 17, marginTop: 1 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  sectionCount: { color: C.secondary, fontSize: 12, fontWeight: '600' },
  timeline: { paddingBottom: 1 },
  timelineRow: { flexDirection: 'row', minHeight: 128 },
  timelineRail: { alignItems: 'center', width: 39 },
  timelineConnector: { borderLeftWidth: 2, bottom: -35, position: 'absolute', top: 34 },
  timelineNode: { alignItems: 'center', borderRadius: 18, borderWidth: 1, height: 33, justifyContent: 'center', marginTop: 18, width: 33, zIndex: 1 },
  timelineCardOuter: { flex: 1, paddingBottom: 7 },
  timelineCard: { padding: 10 },
  timelineCardHeader: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  timelineIconBubble: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 20, height: 38, justifyContent: 'center', width: 38 },
  timelineTitleCopy: { flex: 1 },
  timelineLabel: { color: C.navy, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  timelineDate: { color: C.secondary, fontSize: 10, lineHeight: 14, marginTop: 1 },
  timelineDoctor: { color: C.secondary, fontSize: 10, lineHeight: 13 },
  statusPill: { alignItems: 'center', borderRadius: 14, justifyContent: 'center', minHeight: 25, paddingHorizontal: 7 },
  statusText: { fontSize: 9, fontWeight: '800' },
  timelineMessage: { borderRadius: 12, marginTop: 7, paddingHorizontal: 9, paddingVertical: 6 },
  timelineMessageText: { fontSize: 11, lineHeight: 15 },
  footerCard: { alignItems: 'center', backgroundColor: C.surface, borderColor: C.line, borderRadius: 19, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 3, padding: 11 },
  footerIcon: { alignItems: 'center', backgroundColor: C.greenSurface, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  footerCopy: { flex: 1 },
  footerTitle: { color: C.navy, fontSize: 15, fontWeight: '800', lineHeight: 19 },
  footerText: { color: C.secondary, fontSize: 12, lineHeight: 16, marginTop: 1 },
});
