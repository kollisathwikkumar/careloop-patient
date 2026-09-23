import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_APPOINTMENT, isAppointmentChanged, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame, type CareLoopIconName } from '@/components/careloop-ui';

type AlertKind = 'upcoming' | 'confirmed' | 'reminder' | 'rescheduled' | 'message' | 'care-plan';
type AlertFilter = 'all' | 'appointments' | 'updates' | 'reminders';
type AlertCategory = Exclude<AlertFilter, 'all'>;

type NotificationRow = {
  kind: AlertKind;
  title: string;
  body: string;
  date: string;
  category: AlertCategory;
  icon: CareLoopIconName;
  accent: string;
  surface: string;
  unread: boolean;
};

const FILTERS: readonly { key: AlertFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'updates', label: 'Updates' },
  { key: 'reminders', label: 'Reminders' },
];

const NOTIFICATIONS: readonly NotificationRow[] = [
  {
    kind: 'upcoming',
    title: 'Upcoming appointment',
    body: 'Your follow-up visit is scheduled for 28 September 2026 at 10:30 AM with Dr. K. Sathwik.',
    date: '10:00 AM',
    category: 'appointments',
    icon: 'calendar',
    accent: C.blue,
    surface: '#EAF4FF',
    unread: true,
  },
  {
    kind: 'confirmed',
    title: 'Appointment confirmed',
    body: 'Your appointment on 21 September 2026 has been marked as completed.',
    date: '9:20 AM',
    category: 'appointments',
    icon: 'check',
    accent: C.green,
    surface: C.greenSurface,
    unread: false,
  },
  {
    kind: 'reminder',
    title: 'Reminder',
    body: 'Please bring any required documents to your next appointment.',
    date: '8:00 AM',
    category: 'reminders',
    icon: 'reminder',
    accent: C.red,
    surface: C.redSurface,
    unread: true,
  },
  {
    kind: 'rescheduled',
    title: 'Appointment rescheduled',
    body: 'Your appointment has been rescheduled to 12 October 2026 at 10:30 AM.',
    date: '25 Sep',
    category: 'appointments',
    icon: 'calendar',
    accent: C.purple,
    surface: C.purpleSurface,
    unread: false,
  },
  {
    kind: 'message',
    title: 'Message from care team',
    body: 'Your doctor has added a new note for your next visit.',
    date: '24 Sep',
    category: 'updates',
    icon: 'message',
    accent: C.blue,
    surface: '#EAF4FF',
    unread: true,
  },
  {
    kind: 'care-plan',
    title: 'Care plan updated',
    body: 'A new follow-up has been added to your care journey.',
    date: '20 Sep',
    category: 'updates',
    icon: 'document',
    accent: C.amber,
    surface: C.amberSurface,
    unread: false,
  },
];

function notificationCopy(item: NotificationRow, appointment: AppointmentSchedule): string {
  if (item.kind === 'upcoming' && isAppointmentChanged(appointment)) {
    const action = appointment.status === 'confirmed' ? 'Your follow-up visit is confirmed' : 'Your reschedule request is with the care team';
    return `${action} for ${appointment.date} at ${appointment.time}.`;
  }
  return item.body;
}

function AlertCard({
  item,
  appointment,
  read,
  onPress,
}: {
  item: NotificationRow;
  appointment: AppointmentSchedule;
  read: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable accessibilityLabel={`${item.title}. ${notificationCopy(item, appointment)}`} accessibilityRole="button" onPress={onPress}>
      <CareLoopCard style={styles.notificationCard}>
        <View style={[styles.alertIcon, { backgroundColor: item.surface }]}>
          <CareLoopIcon color={item.accent} name={item.icon} size={22} />
        </View>
        <View style={styles.notificationCopy}>
          <View style={styles.notificationTitleRow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!read && item.unread ? <View style={styles.unreadDot} /> : null}
          </View>
          <Text style={styles.notificationBody}>{notificationCopy(item, appointment)}</Text>
        </View>
        <View style={styles.notificationTrailing}>
          <Text style={styles.notificationTime}>{item.kind === 'upcoming' && isAppointmentChanged(appointment) ? appointment.time : item.date}</Text>
          <CareLoopIcon name="chevron" size={17} color={C.secondary} />
        </View>
      </CareLoopCard>
    </Pressable>
  );
}

export default function AlertsScreen(): JSX.Element {
  const router = useRouter();
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);
  const [allRead, setAllRead] = useState(false);

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

  const visibleNotifications = NOTIFICATIONS.filter((item) => filter === 'all' || item.category === filter);
  const upcoming = visibleNotifications.filter((item) => item.kind === 'upcoming' || item.kind === 'confirmed' || item.kind === 'reminder');
  const earlier = visibleNotifications.filter((item) => item.kind === 'rescheduled' || item.kind === 'message' || item.kind === 'care-plan');

  const renderAlert = (item: NotificationRow): JSX.Element => (
    <AlertCard
      appointment={appointment}
      item={item}
      key={item.kind}
      onPress={() => router.push({ pathname: '/alert-detail', params: { type: item.kind } })}
      read={allRead}
    />
  );

  return (
    <PatientAppFrame activeTab="alerts" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}>
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Alerts</Text>
            <Text style={styles.subtitle}>Stay updated on your appointments and care journey.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setAllRead(true)} style={styles.markReadButton}>
            <Text style={styles.markReadText}>{allRead ? 'All read' : 'Mark all read'}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.filterList} horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {upcoming.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {upcoming.map(renderAlert)}
          </View>
        ) : null}

        {earlier.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlier.map(renderAlert)}
          </View>
        ) : null}

        {visibleNotifications.length === 0 ? (
          <CareLoopCard style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <CareLoopIcon name="alerts" size={25} />
            </View>
            <Text style={styles.emptyTitle}>You’re all caught up</Text>
            <Text style={styles.emptyBody}>New appointment updates and reminders will appear here.</Text>
          </CareLoopCard>
        ) : null}
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', maxWidth: 560, paddingBottom: 20, paddingHorizontal: 18, paddingTop: 17, width: '100%' },
  header: { alignItems: 'flex-start', flexDirection: 'row', marginBottom: 18, minHeight: 66 },
  backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 8, width: 27 },
  backChevron: { color: C.navy, fontSize: 38, fontWeight: '300', lineHeight: 40, marginTop: -4 },
  headerCopy: { flex: 1, paddingRight: 5 },
  title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  markReadButton: { alignItems: 'flex-end', justifyContent: 'center', minHeight: 40, minWidth: 67 },
  markReadText: { color: C.blue, fontSize: 12, fontWeight: '700' },
  filterList: { alignItems: 'center', gap: 8, paddingBottom: 5, paddingRight: 8 },
  filterChip: { alignItems: 'center', backgroundColor: '#F2F6FA', borderRadius: 22, justifyContent: 'center', minHeight: 38, paddingHorizontal: 15 },
  filterChipSelected: { backgroundColor: C.surfaceBlueStrong },
  filterText: { color: C.navy, fontSize: 12, fontWeight: '600' },
  filterTextSelected: { color: C.blue, fontWeight: '800' },
  section: { gap: 10, marginTop: 18 },
  sectionTitle: { color: C.secondary, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  notificationCard: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 90, paddingHorizontal: 12, paddingVertical: 12 },
  alertIcon: { alignItems: 'center', borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  notificationCopy: { flex: 1, minWidth: 0 },
  notificationTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  notificationTitle: { color: C.navyDeep, flexShrink: 1, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  unreadDot: { backgroundColor: C.blue, borderRadius: 4, height: 8, width: 8 },
  notificationBody: { color: C.secondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  notificationTrailing: { alignItems: 'flex-end', alignSelf: 'stretch', justifyContent: 'space-between', paddingVertical: 2 },
  notificationTime: { color: C.secondary, fontSize: 11, fontWeight: '600', lineHeight: 15 },
  emptyCard: { alignItems: 'center', marginTop: 22, paddingHorizontal: 24, paddingVertical: 28 },
  emptyIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  emptyTitle: { color: C.navy, fontSize: 17, fontWeight: '800', marginTop: 12 },
  emptyBody: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 5, textAlign: 'center' },
});
