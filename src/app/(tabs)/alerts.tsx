import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

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

const FILTERED_SOURCES: Record<Exclude<AlertFilter, 'all'>, number> = {
  appointments: require('@/assets/images/careloop/alerts-appointments-reference-v2.png'),
  updates: require('@/assets/images/careloop/alerts-updates-reference-v2.png'),
  reminders: require('@/assets/images/careloop/alerts-reminders-reference-v2.png'),
};

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

export default function AlertsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<AlertFilter>('all');

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
        <Image accessibilityLabel="CareLoop filtered alerts" contentFit="fill" source={FILTERED_SOURCES[filter]} style={StyleSheet.absoluteFill} />
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
      <Image
        accessibilityLabel="CareLoop alerts"
        contentFit="fill"
        source={require('@/assets/images/careloop/alerts-reference.png')}
        style={StyleSheet.absoluteFill}
      />
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
  hotspot: { position: 'absolute', backgroundColor: 'transparent' },
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
});
