import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type AlertKind = 'upcoming' | 'confirmed' | 'reminder' | 'rescheduled' | 'message' | 'care-plan';

type DetailContent = {
  title: string;
  subtitle: string;
  date: string;
  body: string;
  accent: string;
  sections: readonly { heading: string; text: string }[];
};

const DETAILS: Record<AlertKind, DetailContent> = {
  upcoming: {
    title: 'Upcoming appointment',
    subtitle: 'Your next step in your care journey',
    date: '28 September 2026 · 10:30 AM',
    body: 'Your follow-up visit is scheduled with Dr. K. Sathwik.',
    accent: '#087EF5',
    sections: [
      { heading: 'Appointment', text: 'Follow-up visit' },
      { heading: 'Doctor', text: 'Dr. K. Sathwik' },
      { heading: 'Next step', text: 'Confirm your appointment before the visit.' },
    ],
  },
  confirmed: {
    title: 'Appointment confirmed',
    subtitle: 'Your completed care update',
    date: '21 September 2026 · 9:20 AM',
    body: 'Your appointment has been marked as completed.',
    accent: '#00BF8F',
    sections: [{ heading: 'Status', text: 'Completed' }],
  },
  reminder: {
    title: 'Reminder',
    subtitle: 'A note for your next visit',
    date: 'Tomorrow · 8:00 AM',
    body: 'Please bring any required documents to your appointment.',
    accent: '#F24856',
    sections: [{ heading: 'Bring with you', text: 'Required medical documents' }],
  },
  rescheduled: {
    title: 'Appointment rescheduled',
    subtitle: 'Your care journey has been updated',
    date: '25 September 2026',
    body: 'Your appointment has been rescheduled to 12 October 2026 at 10:30 AM.',
    accent: '#7058D8',
    sections: [{ heading: 'Updated appointment', text: '12 October 2026 · 10:30 AM' }],
  },
  message: {
    title: 'Message from care team',
    subtitle: 'A new note from your doctor',
    date: '24 September 2026',
    body: 'Your doctor has added a new note for your next visit.',
    accent: '#087EF5',
    sections: [
      { heading: 'Message', text: 'Please share how you have been feeling since your last follow-up.' },
      { heading: 'From', text: 'Dr. K. Sathwik · Care team' },
    ],
  },
  'care-plan': {
    title: 'Care plan updated',
    subtitle: 'Your daily plan for steady recovery',
    date: '20 September 2026',
    body: 'A new follow-up has been added to your care journey.',
    accent: '#FF9700',
    sections: [
      { heading: 'Diet', text: 'Choose balanced meals with vegetables, protein, and enough water throughout the day.' },
      { heading: 'Tablets', text: 'Take your prescribed tablets exactly as directed by your care team.' },
      { heading: 'Sleep schedule', text: 'Aim for a consistent 10:30 PM bedtime and 7:00 AM wake-up time.' },
      { heading: 'Tablet timing', text: 'Morning: after breakfast · Evening: after dinner' },
    ],
  },
};

function getDetailKind(value: string | string[] | undefined): AlertKind {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && candidate in DETAILS) {
    return candidate as AlertKind;
  }
  return 'upcoming';
}

export default function AlertDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const detail = DETAILS[getDetailKind(params.type)];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="Back to Alerts" accessibilityRole="button" onPress={() => router.replace('/alerts')} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Alerts</Text>
        </Pressable>
        <View style={[styles.icon, { backgroundColor: `${detail.accent}18` }]}>
          <View style={[styles.iconDot, { backgroundColor: detail.accent }]} />
        </View>
        <Text style={styles.title}>{detail.title}</Text>
        <Text style={styles.subtitle}>{detail.subtitle}</Text>
        <View style={[styles.datePill, { borderColor: `${detail.accent}40` }]}>
          <Text style={[styles.dateText, { color: detail.accent }]}>{detail.date}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.body}>{detail.body}</Text>
          {detail.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              <Text style={styles.sectionText}>{section.text}</Text>
            </View>
          ))}
        </View>
        <Pressable accessibilityLabel="Back to alerts" accessibilityRole="button" onPress={() => router.replace('/alerts')} style={[styles.primaryButton, { backgroundColor: detail.accent }]}>
          <Text style={styles.primaryButtonText}>Back to alerts</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FBFF' },
  content: { paddingHorizontal: 24, paddingTop: 58, paddingBottom: 36 },
  backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 8, marginBottom: 40 },
  backIcon: { color: '#0A376E', fontSize: 36, fontWeight: '300', lineHeight: 36 },
  backText: { color: '#0A376E', fontSize: 17, fontWeight: '600' },
  icon: { alignItems: 'center', borderRadius: 38, height: 76, justifyContent: 'center', marginBottom: 22, width: 76 },
  iconDot: { borderRadius: 14, height: 28, width: 28 },
  title: { color: '#072B66', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#6580A3', fontSize: 17, lineHeight: 25, marginTop: 8 },
  datePill: { alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1, marginTop: 22, paddingHorizontal: 14, paddingVertical: 8 },
  dateText: { fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2ECF6', borderRadius: 24, borderWidth: 1, marginTop: 24, padding: 22 },
  body: { color: '#183A6A', fontSize: 18, lineHeight: 28, marginBottom: 8 },
  section: { borderTopColor: '#EDF2F7', borderTopWidth: 1, marginTop: 18, paddingTop: 16 },
  sectionHeading: { color: '#0A376E', fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  sectionText: { color: '#6580A3', fontSize: 16, lineHeight: 25, marginTop: 6 },
  primaryButton: { alignItems: 'center', borderRadius: 18, marginTop: 24, paddingVertical: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
