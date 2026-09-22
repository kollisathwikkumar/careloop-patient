import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

export default function CareJourneyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.eyebrow}>YOUR CONTINUITY</ThemedText>
        <ThemedText type="subtitle" style={styles.title}>Care Journey</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.intro}>
          A simple timeline of your appointments and follow-ups.
        </ThemedText>
        <View style={styles.timelineCard}>
          <View style={styles.timelineLine} />
          <TimelineItem label="Connect" description="Connect your care team to begin." active />
          <TimelineItem label="Schedule" description="Your upcoming follow-ups will appear here." />
          <TimelineItem label="Continue" description="Stay connected from one follow-up to the next." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({ label, description, active = false }: { label: string; description: string; active?: boolean }) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, active && styles.timelineDotActive]} />
      <View style={styles.timelineCopy}>
        <ThemedText style={styles.timelineLabel}>{label}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.timelineDescription}>{description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { paddingHorizontal: Spacing.four, paddingTop: Spacing.five, paddingBottom: 110 },
  eyebrow: { color: '#1F8A78', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#173B4D', fontSize: 34, lineHeight: 40, marginTop: Spacing.one },
  intro: { fontSize: 17, lineHeight: 25, marginTop: Spacing.two, marginBottom: Spacing.five },
  timelineCard: { position: 'relative', backgroundColor: '#F1F6F4', borderRadius: 24, padding: Spacing.four, gap: Spacing.four },
  timelineLine: { position: 'absolute', left: 31, top: 40, bottom: 40, width: 2, backgroundColor: '#C9DDD7' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#C9DDD7', borderWidth: 4, borderColor: '#F1F6F4', zIndex: 1, marginTop: 3 },
  timelineDotActive: { backgroundColor: '#1F8A78' },
  timelineCopy: { flex: 1 },
  timelineLabel: { color: '#173B4D', fontSize: 18, fontWeight: '700' },
  timelineDescription: { fontSize: 15, lineHeight: 22, marginTop: Spacing.one },
});
