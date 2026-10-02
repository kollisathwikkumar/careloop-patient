import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame, type CareLoopIconName } from '@/components/careloop-ui';
import { getPatientAppPatient, type PatientAppPatient } from '@/lib/patient-backend';
import { supabase } from '@/lib/supabase';

type MoreRowProps = { icon: CareLoopIconName; title: string; subtitle: string; onPress: () => void; trailing?: JSX.Element };

function MoreRow({ icon, title, subtitle, onPress, trailing }: MoreRowProps): JSX.Element {
  return (
    <Pressable accessibilityLabel={`${title}. ${subtitle}`} accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}><CareLoopIcon color={C.blue} name={icon} size={21} /></View>
      <View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSubtitle}>{subtitle}</Text></View>
      {trailing ?? <CareLoopIcon color={C.secondary} name="chevron" size={17} />}
    </Pressable>
  );
}

function SimpleModeToggle({ enabled }: { enabled: boolean }): JSX.Element {
  return <View accessibilityLabel={`Simple Mode ${enabled ? 'on' : 'off'}`} accessibilityRole="switch" accessibilityState={{ checked: enabled }} style={[styles.toggle, enabled && styles.toggleOn]}><View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} /></View>;
}

export default function MoreScreen(): JSX.Element {
  const router = useRouter();
  const [simpleModeEnabled, setSimpleModeEnabled] = useState(false);
  const [patient, setPatient] = useState<PatientAppPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getPatientAppPatient().then((record) => { if (active) setPatient(record); }).catch((reason: Error) => {
      if (active) setError(reason.message || 'Could not load your account.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signOut = async (): Promise<void> => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) { Alert.alert('Sign out failed', signOutError.message); return; }
    router.replace('/');
  };

  const toggleSimpleMode = (): void => setSimpleModeEnabled((enabled) => !enabled);
  const patientName = patient?.name ?? '';
  const initials = patientName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');

  return (
    <PatientAppFrame activeTab="more" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.title}>More</Text><Text style={styles.subtitle}>Your preferences, support and account.</Text></View>
          <Pressable accessibilityLabel="Open alerts" accessibilityRole="button" onPress={() => router.replace('/alerts')} style={styles.notificationButton}><CareLoopIcon color={C.navy} name="alerts" size={22} /></Pressable>
        </View>
        <CareLoopCard style={styles.profileCard}>
          <View accessibilityLabel={patientName ? `${patientName} profile` : 'Patient profile'} style={styles.patientAvatar}>
            {initials ? <Text style={styles.patientInitials}>{initials}</Text> : <CareLoopIcon color={C.blue} name="person" size={25} />}
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{loading ? 'Loading account…' : patient?.name ?? 'Patient account'}</Text>
            <Text style={styles.profileRole}>{patient?.program ?? (patient ? 'Patient' : 'No linked patient record')}</Text>
            {error ? <Text accessibilityRole="alert" style={styles.profileError}>{error}</Text> : null}
          </View>
        </CareLoopCard>

        <Text style={styles.sectionTitle}>YOUR CARE</Text>
        <CareLoopCard style={styles.optionsCard}>
          <MoreRow icon="alerts" onPress={() => router.replace('/alerts')} subtitle="Review updates from your care team" title="Alerts" />
          <View style={styles.rowDivider} />
          <MoreRow icon="doctor" onPress={() => router.push('/doctor')} subtitle="View your connected care team" title="My Care Team" />
          <View style={styles.rowDivider} />
          <MoreRow icon="appointment" onPress={() => router.push('/appointments')} subtitle="View your scheduled visits" title="My Appointments" />
        </CareLoopCard>

        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <CareLoopCard style={styles.optionsCard}>
          <MoreRow icon="language" onPress={() => router.push('/settings?section=language')} subtitle="Choose your preferred language" title="Language" />
          <View style={styles.rowDivider} />
          <MoreRow icon="simple" onPress={toggleSimpleMode} subtitle="A cleaner and simpler experience" title="Simple Mode" trailing={<SimpleModeToggle enabled={simpleModeEnabled} />} />
          <View style={styles.rowDivider} />
          <MoreRow icon="alerts" onPress={() => router.push('/settings?section=notifications')} subtitle="Manage reminder settings" title="Notifications" />
        </CareLoopCard>

        <Text style={styles.sectionTitle}>SUPPORT & PRIVACY</Text>
        <CareLoopCard style={styles.optionsCard}>
          <MoreRow icon="help" onPress={() => router.push('/settings?section=help')} subtitle="Get assistance" title="Help & Support" />
          <View style={styles.rowDivider} />
          <MoreRow icon="privacy" onPress={() => router.push('/settings?section=privacy')} subtitle="Review your data and privacy information" title="Privacy & Security" />
        </CareLoopCard>

        <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.signOutButton}><CareLoopIcon color={C.red} name="signOut" size={19} /><Text style={styles.signOutText}>Sign Out</Text></Pressable>
        <Text style={styles.versionText}>CareLoop · One connection. Every follow-up.</Text>
      </ScrollView>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 13, maxWidth: 560, paddingBottom: 22, paddingHorizontal: 18, paddingTop: 15, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  title: { color: C.navyDeep, fontSize: 27, fontWeight: '800', lineHeight: 33 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 2, maxWidth: 270 },
  notificationButton: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#DDEFFA', borderRadius: 24, borderWidth: 1, height: 46, justifyContent: 'center', width: 46 },
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: 13, padding: 13 },
  patientAvatar: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#DCEAF6', borderRadius: 32, borderWidth: 1, height: 64, justifyContent: 'center', width: 64 },
  patientInitials: { color: C.blue, fontSize: 16, fontWeight: '800' }, profileCopy: { flex: 1 },
  profileName: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  profileRole: { color: C.secondary, fontSize: 13, lineHeight: 18, marginTop: 1 },
  profileError: { color: C.red, fontSize: 11, lineHeight: 16, marginTop: 3 },
  sectionTitle: { color: C.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginLeft: 4, marginTop: 2 },
  optionsCard: { overflow: 'hidden', paddingHorizontal: 11 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 68, paddingVertical: 9 },
  rowIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 22, height: 43, justifyContent: 'center', width: 43 },
  rowCopy: { flex: 1 }, rowTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  rowSubtitle: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 1 }, rowDivider: { backgroundColor: '#EDF3F8', height: StyleSheet.hairlineWidth, marginLeft: 54 },
  toggle: { backgroundColor: '#D8E2EC', borderRadius: 15, height: 29, justifyContent: 'center', paddingHorizontal: 3, width: 50 },
  toggleOn: { backgroundColor: C.blue }, toggleKnob: { backgroundColor: C.surface, borderRadius: 12, elevation: 2, height: 23, shadowColor: C.navy, shadowOpacity: 0.15, shadowRadius: 2, width: 23 },
  toggleKnobOn: { alignSelf: 'flex-end' },
  signOutButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: C.surface, borderColor: '#F5D8DB', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 9, justifyContent: 'center', marginTop: 3, minHeight: 49 },
  signOutText: { color: C.red, fontSize: 14, fontWeight: '800' }, versionText: { color: C.muted, fontSize: 10, lineHeight: 15, paddingBottom: 2, textAlign: 'center' },
});
