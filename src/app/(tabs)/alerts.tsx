import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_APPOINTMENT, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';

type AlertFilter = 'all' | 'appointments' | 'updates' | 'reminders';
const FILTERS: readonly { key: AlertFilter; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'appointments', label: 'Appointments' }, { key: 'updates', label: 'Updates' }, { key: 'reminders', label: 'Reminders' },
];

function appointmentMessage(appointment: AppointmentSchedule): string {
  if (appointment.status === 'confirmed') return `Your appointment is confirmed for ${appointment.date} at ${appointment.time}.`;
  if (appointment.status === 'reschedule-requested') return `Your reschedule request for ${appointment.date} at ${appointment.time} is awaiting confirmation.`;
  return `Your appointment is scheduled for ${appointment.date} at ${appointment.time}.`;
}

export default function AlertsScreen(): JSX.Element {
  const router = useRouter();
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void loadAppointment().then((record) => { if (active) setAppointment(record); }).catch((reason: Error) => {
      if (active) setError(reason.message || 'Could not load appointment updates.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const hasAppointment = appointment.status !== 'not-scheduled';
  const showAppointment = hasAppointment && (filter === 'all' || filter === 'appointments');

  return (
    <PatientAppFrame activeTab="messages" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}><Text style={styles.backChevron}>‹</Text></Pressable>
          <View style={styles.headerCopy}><Text style={styles.title}>Alerts</Text><Text style={styles.subtitle}>Updates based on your care records.</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.filterList} horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return <Pressable accessibilityRole="button" accessibilityState={{ selected }} key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterChip, selected && styles.filterChipSelected]}><Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text></Pressable>;
          })}
        </ScrollView>

        {error ? <Text accessibilityRole="alert" style={styles.emptyBody}>{error}</Text> : null}
        {loading ? <Text style={styles.emptyBody}>Loading care updates…</Text> : null}
        {!loading && !error && showAppointment ? <Pressable accessibilityRole="button" accessibilityLabel={`Appointment update. ${appointmentMessage(appointment)}`} onPress={() => router.push({ pathname: '/alert-detail', params: { type: 'upcoming' } })}>
          <CareLoopCard style={styles.notificationCard}>
            <View style={styles.alertIcon}><CareLoopIcon color={C.blue} name="calendar" size={22} /></View>
            <View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{appointment.status === 'confirmed' ? 'Appointment confirmed' : appointment.status === 'reschedule-requested' ? 'Reschedule requested' : 'Upcoming appointment'}</Text><Text style={styles.notificationBody}>{appointmentMessage(appointment)}</Text></View>
            <CareLoopIcon name="chevron" size={17} color={C.secondary} />
          </CareLoopCard>
        </Pressable> : null}

        {!loading && !error && !showAppointment ? <CareLoopCard style={styles.emptyCard}>
          <View style={styles.emptyIcon}><CareLoopIcon name="alerts" size={25} /></View>
          <Text style={styles.emptyTitle}>No updates yet</Text>
          <Text style={styles.emptyBody}>Appointment and care-team updates will appear here when they are added to your record.</Text>
        </CareLoopCard> : null}
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 14, maxWidth: 560, paddingBottom: 20, paddingHorizontal: 18, paddingTop: 17, width: '100%' },
  header: { alignItems: 'flex-start', flexDirection: 'row', marginBottom: 4, minHeight: 58 }, backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 8, width: 27 }, backChevron: { color: C.navy, fontSize: 38, fontWeight: '300', lineHeight: 40, marginTop: -4 },
  headerCopy: { flex: 1, paddingRight: 5 }, title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 }, subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  filterList: { alignItems: 'center', gap: 8, paddingBottom: 5, paddingRight: 8 }, filterChip: { alignItems: 'center', backgroundColor: '#F2F6FA', borderRadius: 22, justifyContent: 'center', minHeight: 38, paddingHorizontal: 15 }, filterChipSelected: { backgroundColor: C.surfaceBlueStrong }, filterText: { color: C.navy, fontSize: 12, fontWeight: '600' }, filterTextSelected: { color: C.blue, fontWeight: '800' },
  notificationCard: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 90, paddingHorizontal: 12, paddingVertical: 12 }, alertIcon: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 25, height: 50, justifyContent: 'center', width: 50 }, notificationCopy: { flex: 1, minWidth: 0 }, notificationTitle: { color: C.navyDeep, fontSize: 14, fontWeight: '800', lineHeight: 19 }, notificationBody: { color: C.secondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  emptyCard: { alignItems: 'center', marginTop: 8, paddingHorizontal: 24, paddingVertical: 28 }, emptyIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 28, height: 56, justifyContent: 'center', width: 56 }, emptyTitle: { color: C.navy, fontSize: 17, fontWeight: '800', marginTop: 12 }, emptyBody: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 5, textAlign: 'center' },
});
