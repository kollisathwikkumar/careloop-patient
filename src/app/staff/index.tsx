import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, STAFF_COLORS } from '@/components/staff-ui';

export default function StaffIndex() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CARELOOP WORKSPACE</Text>
        <Text style={styles.title}>One place for every patient follow-up.</Text>
        <Text style={styles.subtitle}>A simple care-management workspace for administrators, doctors, and clinic staff.</Text>
        <View style={styles.actions}>
          <Link asChild href="/staff/dashboard"><PrimaryButton label="Open workspace" onPress={() => undefined} /></Link>
          <Link asChild href="/staff/signup"><PrimaryButton label="Create staff account" onPress={() => undefined} secondary /></Link>
        </View>
        <View style={styles.featureGrid}>
          <Feature title="Patient records" body="Appointments, tests, reports, medicines, and plans." />
          <Feature title="Team allocation" body="Assign patients to the right doctor or care team." />
          <Feature title="Patient connection" body="Generate a secure code for the CareLoop patient app." />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return <View style={styles.feature}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.featureBody}>{body}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4F9FD', flex: 1 },
  hero: { alignSelf: 'center', maxWidth: 980, padding: 44, width: '100%' },
  eyebrow: { color: STAFF_COLORS.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: STAFF_COLORS.navy, fontSize: 48, fontWeight: '800', lineHeight: 56, marginTop: 16, maxWidth: 720 },
  subtitle: { color: STAFF_COLORS.muted, fontSize: 19, lineHeight: 29, marginTop: 16, maxWidth: 650 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 28 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 64 },
  feature: { backgroundColor: '#FFFFFF', borderColor: '#DCE7F3', borderRadius: 18, borderWidth: 1, flex: 1, minWidth: 220, padding: 20 },
  featureTitle: { color: STAFF_COLORS.navy, fontSize: 17, fontWeight: '800' },
  featureBody: { color: STAFF_COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
