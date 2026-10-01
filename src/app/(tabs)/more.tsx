import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame, type CareLoopIconName } from '@/components/careloop-ui';
import { getActivePatientId as getActiveDemoPatientId, getPatientAppPatients as getDemoPatients, setActivePatientId as setActiveDemoPatientId, type PatientAppPatient as DemoPatient } from '@/lib/patient-backend';

type MoreRowProps = {
  icon: CareLoopIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
  trailing?: JSX.Element;
};

function MoreRow({ icon, title, subtitle, onPress, destructive = false, trailing }: MoreRowProps): JSX.Element {
  return (
    <Pressable accessibilityLabel={`${title}. ${subtitle}`} accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        <CareLoopIcon color={destructive ? C.red : C.blue} name={icon} size={21} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {trailing ?? <CareLoopIcon color={C.secondary} name="chevron" size={17} />}
    </Pressable>
  );
}

function SimpleModeToggle({ enabled }: { enabled: boolean }): JSX.Element {
  return (
    <View accessibilityLabel={`Simple Mode ${enabled ? 'on' : 'off'}`} accessibilityRole="switch" accessibilityState={{ checked: enabled }} style={[styles.toggle, enabled && styles.toggleOn]}>
      <View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} />
    </View>
  );
}

export default function MoreScreen(): JSX.Element {
  const router = useRouter();
  const [simpleModeEnabled, setSimpleModeEnabled] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<DemoPatient | null>(null);
  const [demoPatients, setDemoPatients] = useState<DemoPatient[]>([]);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [pickerError, setPickerError] = useState('');

  useEffect(() => {
    let active = true;
    const loadPatient = async (): Promise<void> => {
      try {
        const [patients, patientId] = await Promise.all([getDemoPatients(), getActiveDemoPatientId()]);
        if (!active) return;
        setDemoPatients(patients);
        setSelectedPatient(patients.find((patient) => patient.id === patientId) ?? patients[0] ?? null);
      } catch { if (active) setPickerError('The shared demo patient list is unavailable while offline.'); }
    };
    void loadPatient();
    return () => { active = false; };
  }, []);

  const chooseDemoPatient = async (patient: DemoPatient): Promise<void> => {
    try {
      await setActiveDemoPatientId(patient.id);
      setSelectedPatient(patient);
      setPatientPickerOpen(false);
      setPickerError('');
      Alert.alert('Demo patient selected', `${patient.name} is now the active patient view.`);
    } catch { setPickerError('The selection could not be saved on this device.'); }
  };

  const toggleSimpleMode = (): void => {
    const nextValue = !simpleModeEnabled;
    setSimpleModeEnabled(nextValue);
    Alert.alert('Simple Mode', nextValue ? 'Simple Mode is now on.' : 'Simple Mode is now off.');
  };

  return (
    <PatientAppFrame activeTab="more" backgroundColor={C.surface}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>Your preferences, support and account all in one place.</Text>
          </View>
          <Pressable accessibilityLabel="Open alerts" accessibilityRole="button" onPress={() => router.replace('/alerts')} style={styles.notificationButton}>
            <CareLoopIcon color={C.navy} name="alerts" size={22} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <CareLoopCard style={styles.profileCard}>
          <View accessibilityLabel={`${selectedPatient?.name ?? 'Patient'} profile`} style={styles.patientAvatar}><Text style={styles.patientInitials}>{(selectedPatient?.name ?? 'Ramesh Kumar').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')}</Text></View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{selectedPatient?.name ?? 'Ramesh Kumar'}</Text>
            <Text style={styles.profileRole}>{selectedPatient?.program ?? 'Patient'}</Text>
            <Text style={styles.profilePhone}>{selectedPatient?.id ?? 'CL-1042'} · demo view</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('Edit profile', 'Profile editing will be available when patient accounts are connected.')} style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </CareLoopCard>

        <Text style={styles.sectionTitle}>YOUR CARE</Text>
        <CareLoopCard style={styles.optionsCard}>
          <MoreRow icon="doctor" onPress={() => setPatientPickerOpen(true)} subtitle="Switch the synthetic patient shown in the iOS demo" title="Demo patient view" />
          <View style={styles.rowDivider} />
          <MoreRow icon="alerts" onPress={() => router.replace('/alerts')} subtitle="Review appointment and care reminders" title="Alerts" />
          <View style={styles.rowDivider} />
          <MoreRow icon="doctor" onPress={() => router.push('/doctor')} subtitle="View your connected doctor" title="My Doctor" />
          <View style={styles.rowDivider} />
          <MoreRow icon="appointment" onPress={() => router.push('/appointments')} subtitle="View and manage appointments" title="My Appointments" />
        </CareLoopCard>

        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <CareLoopCard style={styles.optionsCard}>
          <MoreRow icon="language" onPress={() => router.push('/settings?section=language')} subtitle="Choose your preferred language" title="Language" />
          <View style={styles.rowDivider} />
          <MoreRow
            icon="simple"
            onPress={toggleSimpleMode}
            subtitle="A cleaner and simpler experience"
            title="Simple Mode"
            trailing={<SimpleModeToggle enabled={simpleModeEnabled} />}
          />
          <View style={styles.rowDivider} />
          <MoreRow icon="alerts" onPress={() => router.push('/settings?section=notifications')} subtitle="Manage reminder settings" title="Notifications" />
        </CareLoopCard>

        <Text style={styles.sectionTitle}>SUPPORT & PRIVACY</Text>
        <CareLoopCard style={styles.optionsCard}>
          <MoreRow icon="help" onPress={() => router.push('/settings?section=help')} subtitle="Get assistance anytime" title="Help & Support" />
          <View style={styles.rowDivider} />
          <MoreRow icon="privacy" onPress={() => router.push('/settings?section=privacy')} subtitle="Learn about your privacy and data" title="Privacy & Security" />
        </CareLoopCard>

        <Pressable accessibilityRole="button" onPress={() => Alert.alert('Sign out', 'Sign out will be available when authentication is connected.')} style={styles.signOutButton}>
          <CareLoopIcon color={C.red} name="signOut" size={19} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <Text style={styles.versionText}>CareLoop · One connection. Every follow-up.</Text>
      </ScrollView>
      <Modal animationType="fade" onRequestClose={() => setPatientPickerOpen(false)} transparent visible={patientPickerOpen}>
        <View style={styles.pickerBackdrop}><View style={styles.pickerCard}><Text style={styles.pickerEyebrow}>DEMO MODE ONLY</Text><Text style={styles.pickerTitle}>Choose a patient view</Text><Text style={styles.pickerSubtitle}>This selector uses fictional demo records and is not account authentication.</Text><ScrollView style={styles.pickerList}>{demoPatients.map((patient) => <Pressable accessibilityRole="button" accessibilityState={{ selected: patient.id === selectedPatient?.id }} key={patient.id} onPress={() => void chooseDemoPatient(patient)} style={[styles.pickerRow, patient.id === selectedPatient?.id && styles.pickerRowSelected]}><View style={styles.pickerInitials}><Text style={styles.pickerInitialsText}>{patient.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')}</Text></View><View style={styles.pickerCopy}><Text style={styles.pickerName}>{patient.name}</Text><Text style={styles.pickerMeta}>{patient.id} · {patient.program}</Text></View>{patient.id === selectedPatient?.id ? <CareLoopIcon name="check" size={18} /> : <CareLoopIcon color={C.secondary} name="chevron" size={16} />}</Pressable>)}</ScrollView>{pickerError ? <Text accessibilityRole="alert" style={styles.pickerError}>{pickerError}</Text> : null}<Pressable accessibilityRole="button" onPress={() => setPatientPickerOpen(false)} style={styles.pickerClose}><Text style={styles.pickerCloseText}>Close</Text></Pressable></View></View>
      </Modal>
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 13, maxWidth: 560, paddingBottom: 22, paddingHorizontal: 18, paddingTop: 15, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  title: { color: C.navyDeep, fontSize: 27, fontWeight: '800', lineHeight: 33 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 2, maxWidth: 270 },
  notificationButton: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#DDEFFA', borderRadius: 24, borderWidth: 1, height: 46, justifyContent: 'center', width: 46 },
  notificationDot: { backgroundColor: C.red, borderColor: C.surface, borderRadius: 5, borderWidth: 1.5, height: 10, position: 'absolute', right: 8, top: 7, width: 10 },
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: 13, padding: 13 },
  patientAvatar: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#DCEAF6', borderRadius: 32, borderWidth: 1, height: 64, justifyContent: 'center', width: 64 }, patientInitials: { color: C.blue, fontSize: 16, fontWeight: '800' },
  profileCopy: { flex: 1 },
  profileName: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  profileRole: { color: C.secondary, fontSize: 13, lineHeight: 18, marginTop: 1 },
  profilePhone: { color: C.secondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  editButton: { alignItems: 'center', justifyContent: 'center', minHeight: 38, minWidth: 42 },
  editText: { color: C.blue, fontSize: 14, fontWeight: '700' },
  sectionTitle: { color: C.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginLeft: 4, marginTop: 2 },
  optionsCard: { overflow: 'hidden', paddingHorizontal: 11 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 68, paddingVertical: 9 },
  rowIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 22, height: 43, justifyContent: 'center', width: 43 },
  rowIconDestructive: { backgroundColor: C.redSurface },
  rowCopy: { flex: 1 },
  rowTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  rowTitleDestructive: { color: C.red },
  rowSubtitle: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 1 },
  rowDivider: { backgroundColor: '#EDF3F8', height: StyleSheet.hairlineWidth, marginLeft: 54 },
  toggle: { backgroundColor: '#D8E2EC', borderRadius: 15, height: 29, justifyContent: 'center', paddingHorizontal: 3, width: 50 },
  toggleOn: { backgroundColor: C.blue },
  toggleKnob: { backgroundColor: C.surface, borderRadius: 12, elevation: 2, height: 23, shadowColor: C.navy, shadowOpacity: 0.15, shadowRadius: 2, width: 23 },
  toggleKnobOn: { alignSelf: 'flex-end' },
  signOutButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: C.surface, borderColor: '#F5D8DB', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 9, justifyContent: 'center', marginTop: 3, minHeight: 49 },
  signOutText: { color: C.red, fontSize: 14, fontWeight: '800' },
  versionText: { color: C.muted, fontSize: 10, lineHeight: 15, paddingBottom: 2, textAlign: 'center' },
  pickerBackdrop: { alignItems: 'center', backgroundColor: 'rgba(7,33,62,.48)', flex: 1, justifyContent: 'center', padding: 20 },
  pickerCard: { backgroundColor: C.surface, borderRadius: 24, maxHeight: '82%', maxWidth: 520, padding: 22, width: '100%' },
  pickerEyebrow: { color: C.blue, fontSize: 9, fontWeight: '800', letterSpacing: 1.3 }, pickerTitle: { color: C.navyDeep, fontSize: 21, fontWeight: '800', marginTop: 6 }, pickerSubtitle: { color: C.secondary, fontSize: 11, lineHeight: 16, marginTop: 5 },
  pickerList: { marginTop: 15 }, pickerRow: { alignItems: 'center', borderColor: '#E5EEF6', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, marginBottom: 8, padding: 11 }, pickerRowSelected: { backgroundColor: C.surfaceBlue, borderColor: '#9CD3FB' }, pickerInitials: { alignItems: 'center', backgroundColor: '#EAF6FF', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }, pickerInitialsText: { color: C.blue, fontSize: 11, fontWeight: '800' }, pickerCopy: { flex: 1 }, pickerName: { color: C.navy, fontSize: 12, fontWeight: '800' }, pickerMeta: { color: C.secondary, fontSize: 10, marginTop: 3 }, pickerError: { color: '#B42318', fontSize: 10, marginTop: 5 }, pickerClose: { alignItems: 'center', backgroundColor: C.blue, borderRadius: 12, marginTop: 8, padding: 12 }, pickerCloseText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
