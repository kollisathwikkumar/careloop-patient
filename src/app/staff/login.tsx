import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Field, Notice, PrimaryButton, STAFF_COLORS } from '@/components/staff-ui';
import { getCurrentStaff, signInStaff } from '@/lib/staff';

export default function StaffLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMessage('');
    if (!email.trim() || !password) {
      setMessage('Enter your registered email and password.');
      return;
    }
    setBusy(true);
    const { error } = await signInStaff(email, password);
    if (error) {
      setBusy(false);
      setMessage(error.message);
      return;
    }
    const profile = await getCurrentStaff();
    setBusy(false);
    if (!profile) {
      setMessage('Your account has no staff profile yet. Apply the Supabase migration and try again.');
      return;
    }
    router.replace('/staff/dashboard');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.brand}>CareLoop</Text>
          <Text style={styles.eyebrow}>CARE-TEAM WORKSPACE</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to manage patients, appointments, tests, and follow-ups.</Text>
          {message ? <Notice error message={message} /> : null}
          <Field keyboardType="email-address" label="Work email" onChangeText={setEmail} placeholder="you@clinic.org" value={email} />
          <Field label="Password" onChangeText={setPassword} placeholder="Your password" secureTextEntry value={password} />
          <PrimaryButton disabled={busy} label={busy ? 'Signing in…' : 'Sign in'} onPress={() => void submit()} />
          <View style={styles.footerRow}><Text style={styles.footerText}>New to CareLoop?</Text><Link href="/staff/signup" style={styles.link}>Create a staff account</Link></View>
          <Text style={styles.patientNote}>Patient app remains available at the normal app entry point.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4F9FD', flex: 1 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#DCE7F3', borderRadius: 24, borderWidth: 1, maxWidth: 480, padding: 34, width: '100%' },
  brand: { color: STAFF_COLORS.navy, fontSize: 30, fontWeight: '800' },
  eyebrow: { color: STAFF_COLORS.blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 25 },
  title: { color: STAFF_COLORS.navy, fontSize: 32, fontWeight: '800', marginTop: 8 },
  subtitle: { color: STAFF_COLORS.muted, fontSize: 15, lineHeight: 22, marginBottom: 22, marginTop: 8 },
  footerRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 22 },
  footerText: { color: STAFF_COLORS.muted, fontSize: 14 },
  link: { color: STAFF_COLORS.blue, fontSize: 14, fontWeight: '700' },
  patientNote: { color: '#9AAEC5', fontSize: 12, lineHeight: 18, marginTop: 28 },
});
