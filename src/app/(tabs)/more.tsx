import { useRouter } from 'expo-router';
import { useState, type JSX } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame, type CareLoopIconName } from '@/components/careloop-ui';

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
          <Image accessibilityLabel="Ramesh Kumar profile" source={require('@/assets/images/careloop/patient-avatar.png')} style={styles.patientAvatar} />
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>Ramesh Kumar</Text>
            <Text style={styles.profileRole}>Patient</Text>
            <Text style={styles.profilePhone}>+91 98765 43210</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('Edit profile', 'Profile editing will be available when patient accounts are connected.')} style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </CareLoopCard>

        <Text style={styles.sectionTitle}>YOUR CARE</Text>
        <CareLoopCard style={styles.optionsCard}>
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
  patientAvatar: { backgroundColor: C.surfaceBlue, borderColor: '#DCEAF6', borderRadius: 32, borderWidth: 1, height: 64, resizeMode: 'cover', width: 64 },
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
});
