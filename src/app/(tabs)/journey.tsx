import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import { loadLinkedPatientRecord } from '@/lib/patient';
import type { Appointment } from '@/lib/staff';

function AppointmentCard({ appointment }: { appointment: Appointment }): JSX.Element {
  const date = new Date(appointment.scheduled_at);
  const formatted = Number.isNaN(date.getTime()) ? appointment.scheduled_at : date.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
  return (
    <CareLoopCard style={styles.appointmentCard}>
      <View style={styles.appointmentIcon}><CareLoopIcon color={C.blue} name="calendar" size={21} /></View>
      <View style={styles.appointmentCopy}>
        <Text style={styles.appointmentTitle}>{appointment.purpose || 'Appointment'}</Text>
        <Text style={styles.appointmentDate}>{formatted}</Text>
        {appointment.notes ? <Text style={styles.appointmentNotes}>{appointment.notes}</Text> : null}
      </View>
      <Text style={styles.appointmentStatus}>{appointment.status.replace('_', ' ')}</Text>
    </CareLoopCard>
  );
}

export default function JourneyScreen(): JSX.Element {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void loadLinkedPatientRecord().then((record) => { if (active) setAppointments(record?.appointments ?? []); }).catch((reason: Error) => {
      if (active) setError(reason.message || 'Could not load your care journey.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <PatientAppFrame activeTab="journey" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}><Text style={styles.backChevron}>‹</Text></Pressable>
          <View style={styles.headerCopy}><Text style={styles.title}>Care Journey</Text><Text style={styles.subtitle}>Appointments recorded by your care team.</Text></View>
        </View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Appointments</Text><Text style={styles.sectionCount}>{appointments.length}</Text></View>
        {loading ? <ActivityIndicator color={C.blue} /> : null}
        {error ? <Text accessibilityRole="alert" style={styles.emptyCopy}>{error}</Text> : null}
        {!loading && !error && appointments.length === 0 ? <CareLoopCard style={styles.emptyCard}><CareLoopIcon color={C.blue} name="calendar" size={25} /><Text style={styles.emptyTitle}>No appointments yet</Text><Text style={styles.emptyCopy}>Appointments added by your care team will appear here.</Text></CareLoopCard> : null}
        {appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 14, maxWidth: 560, paddingBottom: 24, paddingHorizontal: 18, paddingTop: 17, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 4 }, backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 8, width: 27 },
  backChevron: { color: C.navy, fontSize: 38, fontWeight: '300', lineHeight: 40, marginTop: -4 }, headerCopy: { flex: 1 },
  title: { color: C.navyDeep, fontSize: 25, fontWeight: '800', lineHeight: 31 }, subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }, sectionTitle: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 22 }, sectionCount: { color: C.secondary, fontSize: 12, fontWeight: '600' },
  appointmentCard: { alignItems: 'flex-start', flexDirection: 'row', gap: 11, padding: 13 }, appointmentIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  appointmentCopy: { flex: 1 }, appointmentTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 19 }, appointmentDate: { color: C.secondary, fontSize: 12, lineHeight: 18, marginTop: 3 }, appointmentNotes: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 4 }, appointmentStatus: { color: C.blue, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  emptyCard: { alignItems: 'center', gap: 8, padding: 22 }, emptyTitle: { color: C.navy, fontSize: 16, fontWeight: '800' }, emptyCopy: { color: C.secondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
