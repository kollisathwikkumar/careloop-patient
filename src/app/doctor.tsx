import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopIcon } from '@/components/careloop-ui';
import { getPatientAppPatient, type PatientAppPatient } from '@/lib/patient-backend';

export default function DoctorScreen(): JSX.Element {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientAppPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getPatientAppPatient().then((record) => { if (active) setPatient(record); }).catch((reason: Error) => {
      if (active) setError(reason.message || 'Could not load your care team.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const providerName = patient?.doctor && patient.doctor !== 'Care team' ? patient.doctor : null;

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}><Text style={styles.backChevron}>‹</Text></Pressable>
          <View style={styles.headerCopy}><Text style={styles.title}>My Care Team</Text><Text style={styles.subtitle}>Care-team details linked to your account.</Text></View>
        </View>

        {loading ? <View style={styles.stateCard}><Text style={styles.stateText}>Loading your linked care team…</Text></View> : error ? <View accessibilityRole="alert" style={styles.stateCard}><Text style={styles.stateText}>{error}</Text></View> : providerName ? (
          <>
            <View style={styles.profileHero}>
              <View style={styles.avatar}><CareLoopIcon color={BLUE} name="doctor" size={42} /></View>
              <View style={styles.profileCopy}><View style={styles.connectedPill}><View style={styles.connectedDot} /><Text style={styles.connectedText}>Linked to your account</Text></View><Text style={styles.providerName}>{providerName}</Text><Text style={styles.providerDepartment}>{patient?.department ?? 'Care team'}</Text></View>
            </View>
            <View style={styles.noticeCard}><CareLoopIcon color={BLUE} name="info" size={20} /><Text style={styles.noticeText}>Only details provided by your connected care team are shown here. Contact information will appear when it is added to your care profile.</Text></View>
          </>
        ) : (
          <View style={styles.stateCard}><View style={styles.avatar}><CareLoopIcon color={BLUE} name="doctor" size={38} /></View><Text style={styles.stateTitle}>No care team linked yet</Text><Text style={styles.stateText}>Connect using a current QR code or connection code from your care team to see their details here.</Text></View>
        )}
      </ScrollView>
    </View>
  );
}

const BLUE = '#087EF5';
const NAVY = '#082F73';
const MUTED = '#6682A8';
const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', flex: 1 }, content: { paddingBottom: 42, paddingHorizontal: 24, paddingTop: 48 },
  header: { alignItems: 'flex-start', flexDirection: 'row', marginBottom: 30 }, backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 15, marginTop: 1, width: 32 },
  backChevron: { color: MUTED, fontSize: 36, fontWeight: '300', lineHeight: 36 }, headerCopy: { flex: 1 }, title: { color: NAVY, fontSize: 27, fontWeight: '800', lineHeight: 33 },
  subtitle: { color: MUTED, fontSize: 15, lineHeight: 21, marginTop: 3 }, profileHero: { alignItems: 'center', backgroundColor: '#F7FBFF', borderColor: '#DCE7F3', borderRadius: 22, borderWidth: 1, flexDirection: 'row', padding: 20 },
  avatar: { alignItems: 'center', backgroundColor: '#E6F3FF', borderRadius: 48, height: 88, justifyContent: 'center', width: 88 }, profileCopy: { flex: 1, marginLeft: 18 },
  connectedPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#DDF8EE', borderRadius: 18, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 6 },
  connectedDot: { backgroundColor: '#00B979', borderRadius: 5, height: 10, marginRight: 7, width: 10 }, connectedText: { color: '#008B61', fontSize: 11, fontWeight: '700' },
  providerName: { color: NAVY, fontSize: 20, fontWeight: '800', lineHeight: 26, marginTop: 10 }, providerDepartment: { color: MUTED, fontSize: 14, lineHeight: 20, marginTop: 3 },
  noticeCard: { alignItems: 'flex-start', backgroundColor: '#EAF6FF', borderRadius: 18, flexDirection: 'row', gap: 11, marginTop: 20, padding: 16 }, noticeText: { color: MUTED, flex: 1, fontSize: 13, lineHeight: 20 },
  stateCard: { alignItems: 'center', backgroundColor: '#F7FBFF', borderColor: '#DCE7F3', borderRadius: 22, borderWidth: 1, gap: 12, padding: 24 }, stateTitle: { color: NAVY, fontSize: 18, fontWeight: '800' }, stateText: { color: MUTED, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
