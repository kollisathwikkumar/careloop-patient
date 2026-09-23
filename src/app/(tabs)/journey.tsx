import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_APPOINTMENT, isAppointmentChanged, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';

function JourneyHotspot({
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

function JourneyCalendarGlyph(): JSX.Element {
  return (
    <View style={styles.journeyCalendarGlyph}>
      <View style={styles.journeyCalendarRingLeft} />
      <View style={styles.journeyCalendarRingRight} />
      <View style={styles.journeyCalendarLine} />
      <View style={styles.journeyCalendarDotRow}>
        <View style={styles.journeyCalendarDot} />
        <View style={styles.journeyCalendarDot} />
        <View style={styles.journeyCalendarDot} />
      </View>
    </View>
  );
}

function UpdatedJourneyAppointment({ appointment }: { appointment: AppointmentSchedule }): JSX.Element | null {
  if (!isAppointmentChanged(appointment)) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.updatedJourneyLayer}>
      <View style={styles.updatedJourneyCard}>
        <View style={styles.updatedJourneyIcon}>
          <JourneyCalendarGlyph />
        </View>
        <Text style={styles.updatedJourneyTitle}>Follow-up Visit</Text>
        <View style={styles.updatedJourneyStatus}>
          <Text style={styles.updatedJourneyStatusText}>{appointment.status === 'confirmed' ? 'Confirmed' : 'Requested'}</Text>
        </View>
        <Text style={styles.updatedJourneyDate}>{appointment.date}  |  {appointment.time}</Text>
        <Text style={styles.updatedJourneyDoctor}>Dr. K. Sathwik</Text>
        <View style={styles.updatedJourneyMessage}>
          <Text style={styles.updatedJourneyMessageText}>{appointment.status === 'confirmed' ? 'Your follow-up visit is confirmed.' : 'Your reschedule request is with your care team.'}</Text>
        </View>
      </View>
    </View>
  );
}

export default function JourneyScreen() {
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

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <Image
        accessibilityLabel="CareLoop care journey"
        contentFit="fill"
        source={require('@/assets/images/careloop/care-journey-app.png')}
        style={StyleSheet.absoluteFill}
      />
      <UpdatedJourneyAppointment appointment={appointment} />
      <JourneyHotspot accessibilityLabel="Back to Home" onPress={() => router.replace('/home')} style={styles.backHotspot} />
      <JourneyHotspot accessibilityLabel="How it works" onPress={() => Alert.alert('How it works', 'Your care journey keeps completed, upcoming, and planned visits together.')} style={styles.howHotspot} />
      <JourneyHotspot accessibilityLabel="Initial Consultation" onPress={() => Alert.alert('Initial Consultation', 'Completed on 12 August 2026 at 11:00 AM.')} style={styles.initialHotspot} />
      <JourneyHotspot accessibilityLabel="Follow-up Visit" onPress={() => Alert.alert('Follow-up Visit', 'Completed on 21 September 2026 at 10:30 AM.')} style={styles.completedHotspot} />
      <JourneyHotspot accessibilityLabel="Upcoming follow-up" onPress={() => Alert.alert('Upcoming follow-up', 'Confirm your appointment for 28 September 2026 at 10:30 AM.')} style={styles.upcomingHotspot} />
      <View style={styles.bottomNav}>
        <JourneyHotspot accessibilityLabel="Home" onPress={() => router.replace('/home')} style={styles.navHotspot} />
        <JourneyHotspot accessibilityLabel="Journey" onPress={() => undefined} style={styles.navHotspot} />
        <JourneyHotspot accessibilityLabel="Alerts" onPress={() => router.replace('/alerts')} style={styles.navHotspot} />
        <JourneyHotspot accessibilityLabel="More" onPress={() => Alert.alert('More', 'More CareLoop options.')} style={styles.navHotspot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  hotspot: { position: 'absolute', backgroundColor: 'transparent' },
  backHotspot: { left: '3%', top: '5%', width: '13%', height: '7%' },
  howHotspot: { right: '3%', top: '5%', width: '27%', height: '7%' },
  initialHotspot: { left: '12%', right: '4%', top: '22%', height: '14%' },
  completedHotspot: { left: '12%', right: '4%', top: '36%', height: '14%' },
  upcomingHotspot: { left: '12%', right: '4%', top: '50%', height: '16%' },
  updatedJourneyLayer: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 1 },
  updatedJourneyCard: { backgroundColor: '#FFFFFF', borderColor: '#E2ECF6', borderRadius: 22, borderWidth: 1, height: '12%', left: '12%', padding: 0, position: 'absolute', right: '4%', top: '54.5%' },
  updatedJourneyIcon: { alignItems: 'center', backgroundColor: '#EAF5FF', borderRadius: 28, height: 56, justifyContent: 'center', left: '3%', position: 'absolute', top: '10%', width: 56 },
  journeyCalendarGlyph: { borderColor: '#087EF5', borderRadius: 5, borderWidth: 2, height: 20, position: 'relative', width: 22 },
  journeyCalendarRingLeft: { backgroundColor: '#087EF5', borderRadius: 2, height: 7, left: 4, position: 'absolute', top: -5, width: 3 },
  journeyCalendarRingRight: { backgroundColor: '#087EF5', borderRadius: 2, height: 7, position: 'absolute', right: 4, top: -5, width: 3 },
  journeyCalendarLine: { backgroundColor: '#087EF5', height: 2, left: 0, position: 'absolute', right: 0, top: 5 },
  journeyCalendarDotRow: { alignItems: 'center', flexDirection: 'row', gap: 3, left: 4, position: 'absolute', top: 10 },
  journeyCalendarDot: { backgroundColor: '#087EF5', borderRadius: 1, height: 3, width: 3 },
  updatedJourneyTitle: { color: '#0A376E', fontSize: 15, fontWeight: '700', left: '19%', lineHeight: 19, position: 'absolute', right: '31%', top: '9%' },
  updatedJourneyStatus: { alignItems: 'center', backgroundColor: '#E7F3FF', borderRadius: 16, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 6, position: 'absolute', right: '4%', top: '7%' },
  updatedJourneyStatusText: { color: '#087EF5', fontSize: 12, fontWeight: '700', lineHeight: 16 },
  updatedJourneyDate: { color: '#6580A3', fontSize: 13, fontWeight: '400', left: '19%', lineHeight: 18, position: 'absolute', right: '4%', top: '32%' },
  updatedJourneyDoctor: { color: '#6580A3', fontSize: 13, fontWeight: '400', left: '19%', lineHeight: 18, position: 'absolute', right: '4%', top: '48%' },
  updatedJourneyMessage: { backgroundColor: '#EEF7FF', borderRadius: 13, bottom: '6%', left: '3%', paddingHorizontal: 10, paddingVertical: 6, position: 'absolute', right: '3%' },
  updatedJourneyMessageText: { color: '#087EF5', fontSize: 12, lineHeight: 17 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '10%', flexDirection: 'row' },
  navHotspot: { position: 'relative', flex: 1, height: '100%' },
});
