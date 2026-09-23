import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const CareLoopColors = {
  canvas: '#F7FBFF',
  surface: '#FFFFFF',
  surfaceBlue: '#EAF6FF',
  surfaceBlueStrong: '#DDF0FF',
  navy: '#0A376E',
  navyDeep: '#072B66',
  blue: '#087EF5',
  cyan: '#28C7E8',
  secondary: '#6580A3',
  muted: '#8EA4BE',
  line: '#DFECF7',
  green: '#00A978',
  greenSurface: '#E8FAF3',
  amber: '#E88A00',
  amberSurface: '#FFF5E5',
  red: '#E94E5C',
  redSurface: '#FFF0F1',
  purple: '#7058D8',
  purpleSurface: '#F2EFFF',
} as const;

export type CareLoopIconName =
  | 'home'
  | 'journey'
  | 'alerts'
  | 'more'
  | 'calendar'
  | 'clock'
  | 'heart'
  | 'doctor'
  | 'reminder'
  | 'chevron'
  | 'check'
  | 'message'
  | 'document'
  | 'person'
  | 'language'
  | 'simple'
  | 'privacy'
  | 'help'
  | 'signOut'
  | 'info'
  | 'appointment';

const ICONS = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  journey: { ios: 'point.topleft.down.curvedto.point.bottomright.up', android: 'route', web: 'route' },
  alerts: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  doctor: { ios: 'stethoscope', android: 'medical_services', web: 'medical_services' },
  reminder: { ios: 'bell.badge.fill', android: 'notifications_active', web: 'notifications_active' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  message: { ios: 'bubble.left.and.bubble.right.fill', android: 'chat_bubble', web: 'chat_bubble' },
  document: { ios: 'doc.text.fill', android: 'description', web: 'description' },
  person: { ios: 'person.crop.circle.fill', android: 'person', web: 'person' },
  language: { ios: 'globe', android: 'language', web: 'language' },
  simple: { ios: 'textformat.size', android: 'text_fields', web: 'text_fields' },
  privacy: { ios: 'hand.raised.fill', android: 'shield', web: 'shield' },
  help: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  signOut: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  appointment: { ios: 'calendar.badge.clock', android: 'event', web: 'event' },
} as const satisfies Record<CareLoopIconName, SymbolViewProps['name']>;

export function CareLoopIcon({
  name,
  size = 24,
  color = CareLoopColors.blue,
}: {
  name: CareLoopIconName;
  size?: number;
  color?: string;
}): ReactNode {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} weight="medium" />;
}

export function CareLoopLogo({ compact = false }: { compact?: boolean }): ReactNode {
  return (
    <View accessibilityLabel="CareLoop" style={styles.logo}>
      <View style={styles.logoMark}>
        <View style={[styles.logoLoopShape, styles.logoLoopLeft, compact && styles.logoLoopShapeCompact]} />
        <View style={[styles.logoLoopShape, styles.logoLoopRight, compact && styles.logoLoopShapeCompact]} />
      </View>
      <Text style={[styles.logoText, compact && styles.logoTextCompact]}>
        <Text style={styles.logoCare}>Care</Text>
        <Text style={styles.logoLoop}>Loop</Text>
      </Text>
    </View>
  );
}

type PatientTab = 'home' | 'journey' | 'alerts' | 'more';

const TABS: readonly { key: PatientTab; label: string; href: '/home' | '/journey' | '/alerts' | '/more' }[] = [
  { key: 'home', label: 'Home', href: '/home' },
  { key: 'journey', label: 'Journey', href: '/journey' },
  { key: 'alerts', label: 'Alerts', href: '/alerts' },
  { key: 'more', label: 'More', href: '/more' },
];

export function PatientAppFrame({
  activeTab,
  backgroundColor = CareLoopColors.canvas,
  children,
}: {
  activeTab: PatientTab;
  backgroundColor?: string;
  children: ReactNode;
}): ReactNode {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.frame, { backgroundColor }]}>
      <StatusBar style="dark" />
      <View style={styles.body}>{children}</View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map((tab) => {
          const isSelected = tab.key === activeTab;
          return (
            <Pressable
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              key={tab.key}
              onPress={() => router.replace(tab.href)}
              style={styles.tab}
            >
              <CareLoopIcon color={isSelected ? CareLoopColors.blue : CareLoopColors.secondary} name={tab.key} size={22} />
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export const CareLoopCard = ({ children, style }: { children: ReactNode; style?: object }): ReactNode => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  frame: { flex: 1 },
  body: { flex: 1 },
  logo: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  logoMark: { alignItems: 'center', backgroundColor: CareLoopColors.surfaceBlue, borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  logoLoopShape: { borderRadius: 10, borderWidth: 3, height: 16, position: 'absolute', width: 11 },
  logoLoopLeft: { borderColor: CareLoopColors.blue, left: 7, transform: [{ rotate: '-38deg' }] },
  logoLoopRight: { borderColor: CareLoopColors.cyan, right: 7, transform: [{ rotate: '38deg' }] },
  logoLoopShapeCompact: { height: 13, width: 9 },
  logoText: { fontSize: 22, fontWeight: '800', letterSpacing: -0.7 },
  logoTextCompact: { fontSize: 18 },
  logoCare: { color: CareLoopColors.navy },
  logoLoop: { color: CareLoopColors.blue },
  tabBar: {
    alignItems: 'center',
    backgroundColor: CareLoopColors.surface,
    borderTopColor: CareLoopColors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 7,
  },
  tab: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center', minHeight: 49, paddingHorizontal: 4 },
  tabLabel: { color: CareLoopColors.secondary, fontSize: 11, fontWeight: '500', lineHeight: 15 },
  tabLabelSelected: { color: CareLoopColors.blue, fontWeight: '700' },
  card: {
    backgroundColor: CareLoopColors.surface,
    borderColor: CareLoopColors.line,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: CareLoopColors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 12,
    elevation: 1,
  },
});
