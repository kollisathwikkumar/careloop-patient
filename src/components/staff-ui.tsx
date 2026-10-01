import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getCurrentStaff, signOutStaff, type StaffProfile } from '@/lib/staff';

export const STAFF_COLORS = {
  navy: '#123B80',
  blue: '#087EF5',
  pale: '#F4F9FD',
  border: '#DCE7F3',
  muted: '#6682A8',
  green: '#0A9F75',
  red: '#C23B45',
};

export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline = false, secureTextEntry = false }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AAEC5"
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

export function SelectField({ label, value, options, onChange, optionLabels = {} }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void; optionLabels?: Record<string, string> }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((option) => (
          <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: value === option }} onPress={() => onChange(option)} style={({ pressed }) => [styles.selectOption, value === option && styles.selectedOption, pressed && styles.pressed]}>
            <Text style={[styles.selectText, value === option && styles.selectedOptionText]}>{optionLabels[option] ?? (option || 'Unassigned')}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, secondary && styles.secondaryButton, disabled && styles.disabledButton, pressed && styles.pressed]}>
      <Text style={[styles.primaryButtonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return <View style={[styles.notice, error && styles.errorNotice]}><Text style={[styles.noticeText, error && styles.errorNoticeText]}>{message}</Text></View>;
}

export function Section({ title, action, children, style }: { title: string; action?: ReactNode; children: ReactNode; style?: object }) {
  return <View style={[styles.section, style]}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action}</View>{children}</View>;
}

export function StatCard({ label, value, accent = STAFF_COLORS.blue }: { label: string; value: string | number; accent?: string }) {
  return <View style={styles.statCard}><View style={[styles.statAccent, { backgroundColor: accent }]} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

export function StaffShell({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getCurrentStaff().then((profile) => {
      if (!active) return;
      if (!profile) router.replace('/staff/login');
      setStaff(profile);
      setLoading(false);
    }).catch(() => {
      if (active) {
        setLoading(false);
        router.replace('/staff/login');
      }
    });
    return () => { active = false; };
  }, [router]);

  if (loading || !staff) return <View style={styles.loading}><ActivityIndicator color={STAFF_COLORS.blue} /><Text style={styles.loadingText}>Loading workspace…</Text></View>;

  const navigate = (path: '/staff/dashboard' | '/staff/patients' | '/staff/groups' | '/staff/appointments' | '/staff/tests' | '/staff/medications' | '/staff/care-plans') => router.replace(path);
  const descriptions: Record<string, string> = {
    Dashboard: "Here’s what’s happening with your clinic today.",
    Patients: 'Manage patients, care groups, and follow-ups.',
    'Appointments & follow-ups': 'Manage appointments, follow-up tasks, and reschedule requests.',
    'Groups & allocation': 'Organize care teams and keep patient responsibility clear.',
    'Tests & reports': 'Track investigations, report uploads, and pending results.',
    Medications: 'Keep current and past medicines accurate for every patient.',
    'Care plans': 'Turn goals into actions with visible review dates and owners.',
  };
  return (
    <View style={styles.appShell}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => navigate('/staff/dashboard')} style={styles.brandLockup}>
          <View style={styles.brandIcon}><Text style={styles.brandIconText}>♡</Text></View>
          <View><Text style={styles.brand}>CareLoop</Text><Text style={styles.brandCaption}>Care-team workspace</Text></View>
        </Pressable>
        <View style={styles.navList}>
          <NavItem icon="⌂" label="Overview" active={pathname === '/staff/dashboard'} onPress={() => navigate('/staff/dashboard')} />
          <NavItem icon="♙" label="Patients" active={pathname.startsWith('/staff/patients')} onPress={() => navigate('/staff/patients')} />
          <NavItem icon="▣" label="Appointments" active={pathname === '/staff/appointments'} onPress={() => navigate('/staff/appointments')} />
          <NavItem icon="♧" label="Care teams" active={pathname === '/staff/groups'} onPress={() => navigate('/staff/groups')} />
          <NavItem icon="▤" label="Tests & reports" active={pathname === '/staff/tests'} onPress={() => navigate('/staff/tests')} />
          <NavItem icon="◈" label="Medications" active={pathname === '/staff/medications'} onPress={() => navigate('/staff/medications')} />
          <NavItem icon="☷" label="Care plans" active={pathname === '/staff/care-plans'} onPress={() => navigate('/staff/care-plans')} />
        </View>
        <View style={styles.topbarTools}>
          <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>Search…</Text></View>
          <View style={styles.locationPill}><Text style={styles.locationIcon}>●</Text><Text style={styles.locationText}>Hyderabad</Text></View>
          <View style={styles.notification}><Text style={styles.bell}>♢</Text><View style={styles.notificationCount}><Text style={styles.notificationCountText}>3</Text></View></View>
          <View style={styles.topAvatar}><Text style={styles.topAvatarText}>{staff.full_name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text></View>
          <View style={styles.profileCopy}><Text style={styles.topStaffName}>{staff.full_name}</Text><Text style={styles.topStaffRole}>{staff.role === 'doctor' ? 'Consultant physician' : 'Care coordinator'}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => void signOutStaff().then(() => router.replace('/staff/login'))} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}><Text style={styles.signOutText}>Sign out</Text></Pressable>
        </View>
      </View>
      <View style={styles.mainArea}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.pageHeader}><View><Text style={styles.pageEyebrow}>CARELOOP WORKSPACE</Text><Text style={styles.pageTitle}>{title}</Text><Text style={styles.pageSubtitle}>{descriptions[title] ?? 'A healthier tomorrow, together.'}</Text></View><View style={styles.headerActions}><View style={styles.accountBadge}><Text style={styles.accountBadgeText}>{staff.role.toUpperCase()}</Text></View></View></View>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

function NavItem({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.navItem, active && styles.activeNavItem, pressed && styles.pressed]}><Text style={[styles.navIcon, active && styles.activeNavText]}>{icon}</Text><Text style={[styles.navText, active && styles.activeNavText]}>{label}</Text></Pressable>;
}

export const styles = StyleSheet.create({
  appShell: { backgroundColor: '#F4F8FC', flex: 1 },
  topbar: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#DDE8F3', borderBottomWidth: 1, flexDirection: 'row', gap: 20, minHeight: 78, paddingHorizontal: 26, paddingVertical: 12 },
  brandLockup: { alignItems: 'center', flexDirection: 'row', gap: 9, minWidth: 174 },
  brandIcon: { alignItems: 'center', backgroundColor: '#E8F5FF', borderRadius: 13, height: 36, justifyContent: 'center', width: 36 },
  brandIconText: { color: STAFF_COLORS.blue, fontSize: 27, fontWeight: '800', lineHeight: 30 },
  brand: { color: STAFF_COLORS.navy, fontSize: 22, fontWeight: '800' },
  brandCaption: { color: STAFF_COLORS.muted, fontSize: 10, marginTop: 1 },
  navList: { alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  navItem: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 6, paddingHorizontal: 9, paddingVertical: 9 },
  activeNavItem: { backgroundColor: '#E8F5FF' },
  navIcon: { color: '#86A0BF', fontSize: 16, textAlign: 'center', width: 17 },
  navText: { color: '#526F97', fontSize: 12, fontWeight: '700' },
  activeNavText: { color: STAFF_COLORS.blue },
  topbarTools: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  searchBox: { alignItems: 'center', backgroundColor: '#F3F7FC', borderColor: '#E1ECF7', borderRadius: 9, flexDirection: 'row', minHeight: 38, paddingHorizontal: 10, width: 122 },
  searchIcon: { color: STAFF_COLORS.navy, fontSize: 20, marginRight: 6 },
  searchText: { color: '#7891B2', fontSize: 12 },
  locationPill: { alignItems: 'center', borderColor: '#E1ECF7', borderRadius: 9, borderWidth: 1, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 9 },
  locationIcon: { color: STAFF_COLORS.blue, fontSize: 11, marginRight: 6 },
  locationText: { color: STAFF_COLORS.navy, fontSize: 12, fontWeight: '600' },
  notification: { position: 'relative' },
  bell: { color: STAFF_COLORS.navy, fontSize: 23 },
  notificationCount: { alignItems: 'center', backgroundColor: '#F05267', borderRadius: 8, height: 16, justifyContent: 'center', position: 'absolute', right: -7, top: -4, width: 16 },
  notificationCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  topAvatar: { alignItems: 'center', backgroundColor: '#D8ECFF', borderRadius: 19, height: 38, justifyContent: 'center', width: 38 },
  topAvatarText: { color: STAFF_COLORS.blue, fontSize: 12, fontWeight: '800' },
  profileCopy: { minWidth: 104 },
  topStaffName: { color: STAFF_COLORS.navy, fontSize: 12, fontWeight: '800' },
  topStaffRole: { color: STAFF_COLORS.muted, fontSize: 10, marginTop: 2 },
  signOutButton: { backgroundColor: '#FFFFFF', borderColor: '#C9D9EA', borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  signOutText: { color: STAFF_COLORS.navy, fontSize: 11, fontWeight: '700' },
  mainArea: { flex: 1 },
  page: { alignSelf: 'center', maxWidth: 1360, padding: 30, width: '100%' },
  pageHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  pageEyebrow: { color: STAFF_COLORS.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  pageTitle: { color: STAFF_COLORS.navy, fontSize: 32, fontWeight: '800', marginTop: 5 },
  pageSubtitle: { color: STAFF_COLORS.muted, fontSize: 15, marginTop: 5 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  accountBadge: { backgroundColor: '#E8F5FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  accountBadgeText: { color: STAFF_COLORS.blue, fontSize: 12, fontWeight: '800' },
  loading: { alignItems: 'center', backgroundColor: '#F7FAFE', flex: 1, justifyContent: 'center' },
  loadingText: { color: STAFF_COLORS.muted, marginTop: 10 },
  section: { backgroundColor: '#FFFFFF', borderColor: STAFF_COLORS.border, borderRadius: 18, borderWidth: 1, marginBottom: 24, padding: 22 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { color: STAFF_COLORS.navy, fontSize: 20, fontWeight: '800' },
  field: { marginBottom: 15, minWidth: 220, flex: 1 },
  fieldLabel: { color: STAFF_COLORS.navy, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#FFFFFF', borderColor: STAFF_COLORS.border, borderRadius: 10, borderWidth: 1, color: STAFF_COLORS.navy, fontSize: 15, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10 },
  multilineInput: { minHeight: 90, textAlignVertical: 'top' },
  primaryButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: STAFF_COLORS.blue, borderRadius: 9, justifyContent: 'center', minHeight: 42, paddingHorizontal: 17 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#EAF4FE', borderColor: '#CBE6FA', borderWidth: 1 },
  secondaryButtonText: { color: STAFF_COLORS.blue },
  disabledButton: { opacity: 0.55 },
  pressed: { opacity: 0.72 },
  notice: { backgroundColor: '#E9FAF3', borderColor: '#A9E7D0', borderRadius: 10, borderWidth: 1, marginBottom: 16, padding: 12 },
  noticeText: { color: '#087A58', fontSize: 14, lineHeight: 20 },
  errorNotice: { backgroundColor: '#FFF0F1', borderColor: '#F2B9BE' },
  errorNoticeText: { color: STAFF_COLORS.red },
  statCard: { backgroundColor: '#FFFFFF', borderColor: STAFF_COLORS.border, borderRadius: 16, borderWidth: 1, flex: 1, minWidth: 160, overflow: 'hidden', padding: 18 },
  statAccent: { height: 4, left: 0, position: 'absolute', right: 0, top: 0 },
  statValue: { color: STAFF_COLORS.navy, fontSize: 30, fontWeight: '800', marginTop: 6 },
  statLabel: { color: STAFF_COLORS.muted, fontSize: 13, marginTop: 5 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectOption: { backgroundColor: '#F5F8FC', borderColor: STAFF_COLORS.border, borderRadius: 9, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  selectedOption: { backgroundColor: '#E8F5FF', borderColor: '#8AC8F8' },
  selectText: { color: STAFF_COLORS.muted, fontSize: 13 },
  selectedOptionText: { color: STAFF_COLORS.blue, fontWeight: '700' },
});
