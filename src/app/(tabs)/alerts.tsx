import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_APPOINTMENT, isAppointmentChanged, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';

type AlertKind =
  | 'upcoming'
  | 'confirmed'
  | 'reminder'
  | 'rescheduled'
  | 'message'
  | 'care-plan';

type AlertFilter = 'all' | 'appointments' | 'updates' | 'reminders';

type NotificationRow = {
  kind: AlertKind;
  title: string;
  body: string;
  date: string;
  category: Exclude<AlertFilter, 'all'>;
  accent: string;
};

const ALERT_SOURCES: Record<AlertFilter, number> = {
  all: require('@/assets/images/careloop/alerts-app.png'),
  appointments: require('@/assets/images/careloop/alerts-appointments-app.png'),
  updates: require('@/assets/images/careloop/alerts-updates-app.png'),
  reminders: require('@/assets/images/careloop/alerts-reminders-app.png'),
};

const FILTERED_NOTIFICATIONS: readonly NotificationRow[] = [
  {
    kind: 'upcoming',
    title: 'Upcoming appointment',
    body: 'Your follow-up visit is tomorrow, 28 September 2026 at 10:30 AM.',
    date: '10:00 AM',
    category: 'appointments',
    accent: '#087EF5',
  },
  {
    kind: 'confirmed',
    title: 'Appointment confirmed',
    body: 'Your appointment on 21 September 2026 has been marked as completed.',
    date: '9:20 AM',
    category: 'appointments',
    accent: '#00BF8F',
  },
  {
    kind: 'rescheduled',
    title: 'Appointment rescheduled',
    body: 'Your appointment has been rescheduled to 12 October 2026 at 10:30 AM.',
    date: '25 Sep',
    category: 'appointments',
    accent: '#7058D8',
  },
  {
    kind: 'message',
    title: 'Message from care team',
    body: 'Your doctor has added a new note for your next visit.',
    date: '24 Sep',
    category: 'updates',
    accent: '#087EF5',
  },
  {
    kind: 'care-plan',
    title: 'Care plan updated',
    body: 'A new follow-up has been added to your care journey.',
    date: '20 Sep',
    category: 'updates',
    accent: '#FF9700',
  },
  {
    kind: 'reminder',
    title: 'Reminder',
    body: 'Please bring any required documents tomorrow.',
    date: '8:00 AM',
    category: 'reminders',
    accent: '#F24856',
  },
];

function AlertHotspot({
  accessibilityLabel,
  onPress,
  style,
}: {
  accessibilityLabel: string;
  onPress: () => void;
  style: object;
}) {
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={[styles.hotspot, style]} />;
}

function AlertBackground({ filter }: { filter: AlertFilter }): JSX.Element {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, styles.opaqueBackground]} />
      <Image key={`alert-background-${filter}`} accessibilityLabel={filter === 'all' ? 'CareLoop alerts' : 'CareLoop filtered alerts'} contentFit="fill" source={ALERT_SOURCES[filter]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

function BackToHomeButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={onPress} style={styles.backButton}>
      <Text style={styles.backChevron}>‹</Text>
    </Pressable>
  );
}

function AlertsHeader({ onBack }: { onBack: () => void }) {
  return (
    <>
      <View pointerEvents="none" style={styles.headerMask} />
      <View pointerEvents="box-none" style={styles.header}>
        <BackToHomeButton onPress={onBack} />
        <View pointerEvents="none" style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSubtitle}>Stay updated on your appointments{`\n`}and care journey.</Text>
        </View>
      </View>
    </>
  );
}

function UpdatedAlertAppointment({ appointment }: { appointment: AppointmentSchedule }): JSX.Element | null {
  if (!isAppointmentChanged(appointment)) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.updatedAlertLayer}>
      <View style={styles.updatedAlertTimeMask}>
        <Text style={styles.updatedAlertTime}>{appointment.time}</Text>
      </View>
      <View style={styles.updatedAlertBodyMask}>
        <Text style={styles.updatedAlertBody}>{appointment.status === 'confirmed' ? `Appointment confirmed for ${appointment.date}.` : `Reschedule requested for ${appointment.date}.`}</Text>
      </View>
    </View>
  );
}

export default function AlertsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<AlertFilter>('all');
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

  const openAlert = (kind: AlertKind): void => {
    router.push({ pathname: '/alert-detail', params: { type: kind } });
  };

  const showFilter = (nextFilter: AlertFilter): void => {
    setFilter(nextFilter);
  };

  const filteredNotifications = FILTERED_NOTIFICATIONS.filter((item) => item.category === filter);

  if (filter !== 'all') {
    return (
      <View style={styles.screen}>
        <StatusBar hidden />
        <AlertBackground filter={filter} />
        {filter === 'appointments' ? <UpdatedAlertAppointment appointment={appointment} /> : null}
        <AlertsHeader onBack={() => router.replace('/home')} />
        <AlertHotspot accessibilityLabel="Mark all read" onPress={() => Alert.alert('Alerts', 'All alerts are marked as read.')} style={styles.markReadHotspot} />
        <AlertHotspot accessibilityLabel="All alerts filter" onPress={() => showFilter('all')} style={styles.allFilterHotspot} />
        <AlertHotspot accessibilityLabel="Appointments filter" onPress={() => showFilter('appointments')} style={styles.appointmentsFilterHotspot} />
        <AlertHotspot accessibilityLabel="Updates filter" onPress={() => showFilter('updates')} style={styles.updatesFilterHotspot} />
        <AlertHotspot accessibilityLabel="Reminders filter" onPress={() => showFilter('reminders')} style={styles.remindersFilterHotspot} />
        {filteredNotifications.map((item, index) => (
          <AlertHotspot
            accessibilityLabel={item.title}
            key={item.kind}
            onPress={() => openAlert(item.kind)}
            style={[styles.filteredCardHotspot, { top: `${24 + index * 11}%` }]}
          />
        ))}
        <View style={styles.bottomNav}>
          <AlertHotspot accessibilityLabel="Home" onPress={() => router.replace('/home')} style={styles.navHotspot} />
          <AlertHotspot accessibilityLabel="Journey" onPress={() => router.replace('/journey')} style={styles.navHotspot} />
          <AlertHotspot accessibilityLabel="Alerts" onPress={() => undefined} style={styles.navHotspot} />
          <AlertHotspot accessibilityLabel="More" onPress={() => Alert.alert('More', 'More CareLoop options.')} style={styles.navHotspot} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <AlertBackground filter="all" />
      <UpdatedAlertAppointment appointment={appointment} />
      <AlertsHeader onBack={() => router.replace('/home')} />
      <AlertHotspot accessibilityLabel="Mark all read" onPress={() => Alert.alert('Alerts', 'All alerts are marked as read.')} style={styles.markReadHotspot} />
      <AlertHotspot accessibilityLabel="All alerts filter" onPress={() => showFilter('all')} style={styles.allFilterHotspot} />
      <AlertHotspot accessibilityLabel="Appointments filter" onPress={() => showFilter('appointments')} style={styles.appointmentsFilterHotspot} />
      <AlertHotspot accessibilityLabel="Updates filter" onPress={() => showFilter('updates')} style={styles.updatesFilterHotspot} />
      <AlertHotspot accessibilityLabel="Reminders filter" onPress={() => showFilter('reminders')} style={styles.remindersFilterHotspot} />
      <AlertHotspot accessibilityLabel="Upcoming appointment" onPress={() => openAlert('upcoming')} style={styles.upcomingHotspot} />
      <AlertHotspot accessibilityLabel="Appointment confirmed" onPress={() => openAlert('confirmed')} style={styles.confirmedHotspot} />
      <AlertHotspot accessibilityLabel="Reminder" onPress={() => openAlert('reminder')} style={styles.reminderHotspot} />
      <AlertHotspot accessibilityLabel="Appointment rescheduled" onPress={() => openAlert('rescheduled')} style={styles.rescheduledHotspot} />
      <AlertHotspot accessibilityLabel="Message from care team" onPress={() => openAlert('message')} style={styles.messageHotspot} />
      <AlertHotspot accessibilityLabel="Care plan updated" onPress={() => openAlert('care-plan')} style={styles.carePlanHotspot} />
      <View style={styles.bottomNav}>
        <AlertHotspot accessibilityLabel="Home" onPress={() => router.replace('/home')} style={styles.navHotspot} />
        <AlertHotspot accessibilityLabel="Journey" onPress={() => router.replace('/journey')} style={styles.navHotspot} />
        <AlertHotspot accessibilityLabel="Alerts" onPress={() => undefined} style={styles.navHotspot} />
        <AlertHotspot accessibilityLabel="More" onPress={() => Alert.alert('More', 'More CareLoop options.')} style={styles.navHotspot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  opaqueBackground: { backgroundColor: '#FFFFFF' },
  hotspot: { position: 'absolute', backgroundColor: 'transparent' },
  headerMask: { backgroundColor: '#FFFFFF', height: '11.8%', left: 0, position: 'absolute', top: '4.2%', width: '72%', zIndex: 2 },
  header: { height: '11.8%', left: 0, position: 'absolute', right: 0, top: '4.2%', zIndex: 3 },
  backButton: { alignItems: 'center', height: 38, justifyContent: 'center', left: '3%', position: 'absolute', top: 0, width: '8%' },
  backChevron: { color: '#0A376E', fontSize: 38, fontWeight: '300', lineHeight: 38 },
  headerCopy: { left: '13%', position: 'absolute', right: '28%', top: 0 },
  headerTitle: { color: '#0A376E', fontSize: 22, fontWeight: '800', lineHeight: 28 },
  headerSubtitle: { color: '#6580A3', fontSize: 15, lineHeight: 22, marginTop: 1 },
  markReadHotspot: { right: '3%', top: '5%', width: '27%', height: '7%' },
  allFilterHotspot: { left: '4%', top: '16%', width: '17%', height: '6%' },
  appointmentsFilterHotspot: { left: '22%', top: '16%', width: '29%', height: '6%' },
  updatesFilterHotspot: { left: '52%', top: '16%', width: '23%', height: '6%' },
  remindersFilterHotspot: { left: '76%', top: '16%', width: '21%', height: '6%' },
  upcomingHotspot: { left: '4%', right: '3%', top: '24%', height: '11%' },
  confirmedHotspot: { left: '4%', right: '3%', top: '36%', height: '11%' },
  reminderHotspot: { left: '4%', right: '3%', top: '48%', height: '11%' },
  rescheduledHotspot: { left: '4%', right: '3%', top: '61%', height: '11%' },
  messageHotspot: { left: '4%', right: '3%', top: '73%', height: '11%' },
  carePlanHotspot: { left: '4%', right: '3%', top: '85%', height: '11%' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '10%', flexDirection: 'row' },
  navHotspot: { position: 'relative', flex: 1, height: '100%' },
  filteredCardHotspot: { left: '4%', right: '3%', height: '11%' },
  updatedAlertLayer: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 1 },
  updatedAlertTimeMask: { alignItems: 'flex-end', backgroundColor: '#FFFFFF', borderRadius: 8, height: '4.8%', justifyContent: 'center', paddingHorizontal: 4, position: 'absolute', right: '8%', top: '25.2%', width: '30%' },
  updatedAlertTime: { color: '#6580A3', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  updatedAlertBodyMask: { backgroundColor: '#FFFFFF', borderRadius: 8, left: '20%', minHeight: '9.2%', justifyContent: 'center', paddingHorizontal: 4, position: 'absolute', top: '27.8%', width: '62%' },
  updatedAlertBody: { color: '#6580A3', fontSize: 13, lineHeight: 20 },
});
