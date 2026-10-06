import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_APPOINTMENT, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';
import { CareLoopColors as C, CareLoopIcon } from '@/components/careloop-ui';

export default function AlertDetailScreen(): JSX.Element {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void loadAppointment().then((record) => { if (active) setAppointment(record); }).catch((reason: Error) => {
      if (active) setError(reason.message || 'Could not load appointment details.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="Back to Alerts" accessibilityRole="button" onPress={() => router.replace('/alerts')} style={styles.backButton}><Text style={styles.backText}>‹  Alerts</Text></Pressable>
        <View style={styles.icon}><CareLoopIcon color={C.blue} name="calendar" size={27} /></View>
        <Text style={styles.title}>Appointment update</Text>
        {loading ? <Text style={styles.copy}>Loading your appointment…</Text> : error ? <Text accessibilityRole="alert" style={styles.copy}>{error}</Text> : appointment.status === 'not-scheduled' ? <Text style={styles.copy}>There is no appointment recorded for your account yet.</Text> : <>
          <Text style={styles.subtitle}>{appointment.date} · {appointment.time}</Text>
          <View style={styles.card}><Text style={styles.body}>{appointment.status === 'missed' ? 'Your care team marked this appointment as a no-show. Please contact your care team if you need a new appointment.' : appointment.status === 'confirmed' ? 'Your appointment is confirmed.' : appointment.status === 'reschedule-requested' ? 'Your reschedule request is awaiting confirmation from your care team.' : 'This appointment is listed in your care record.'}</Text><View style={styles.section}><Text style={styles.sectionHeading}>Status</Text><Text style={[styles.sectionText, appointment.status === 'missed' && styles.missedText]}>{appointment.status === 'missed' ? 'Missed appointment' : appointment.status.replace('-', ' ')}</Text></View></View>
        </>}
        <Pressable accessibilityLabel="Back to alerts" accessibilityRole="button" onPress={() => router.replace('/alerts')} style={styles.button}><Text style={styles.buttonText}>Back to alerts</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FBFF' }, content: { alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 58, paddingBottom: 36 },
  backButton: { marginBottom: 36 }, backText: { color: C.navy, fontSize: 16, fontWeight: '600' },
  icon: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 38, height: 76, justifyContent: 'center', marginBottom: 22, width: 76 },
  title: { color: C.navyDeep, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }, subtitle: { color: C.secondary, fontSize: 16, lineHeight: 24, marginTop: 8 },
  copy: { color: C.secondary, fontSize: 15, lineHeight: 22, marginTop: 8 }, card: { alignSelf: 'stretch', backgroundColor: '#FFFFFF', borderColor: '#DCE7F3', borderRadius: 20, borderWidth: 1, marginTop: 22, padding: 20 },
  body: { color: C.navy, fontSize: 15, lineHeight: 22 }, section: { borderTopColor: '#E5EEF6', borderTopWidth: 1, marginTop: 18, paddingTop: 14 }, sectionHeading: { color: C.secondary, fontSize: 12, fontWeight: '700' }, sectionText: { color: C.navy, fontSize: 14, marginTop: 5, textTransform: 'capitalize' }, missedText: { color: C.red, fontWeight: '800' },
  button: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: C.blue, borderRadius: 16, marginTop: 24, padding: 15 }, buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
