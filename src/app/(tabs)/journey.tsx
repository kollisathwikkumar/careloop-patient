import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

function JourneyHotspot({
  accessibilityLabel,
  onPress,
  style,
}: {
  accessibilityLabel: string;
  onPress: () => void;
  style: object;
}) {
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={[styles.hotspot, style]} />;
}

export default function JourneyScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <Image
        accessibilityLabel="CareLoop care journey"
        contentFit="fill"
        source={require('@/assets/images/careloop/care-journey-reference.png')}
        style={StyleSheet.absoluteFill}
      />
      <JourneyHotspot accessibilityLabel="Back to Home" onPress={() => router.replace('/home')} style={styles.backHotspot} />
      <JourneyHotspot accessibilityLabel="How it works" onPress={() => Alert.alert('How it works', 'Your care journey keeps completed, upcoming, and planned visits together.')} style={styles.howHotspot} />
      <JourneyHotspot accessibilityLabel="Initial Consultation" onPress={() => Alert.alert('Initial Consultation', 'Completed on 12 August 2026 at 11:00 AM.')} style={styles.initialHotspot} />
      <JourneyHotspot accessibilityLabel="Follow-up Visit" onPress={() => Alert.alert('Follow-up Visit', 'Completed on 21 September 2026 at 10:30 AM.')} style={styles.completedHotspot} />
      <JourneyHotspot accessibilityLabel="Upcoming follow-up" onPress={() => Alert.alert('Upcoming follow-up', 'Confirm your appointment for 28 September 2026 at 10:30 AM.')} style={styles.upcomingHotspot} />
      <View style={styles.bottomNav}>
        <JourneyHotspot accessibilityLabel="Home" onPress={() => router.replace('/home')} style={styles.navHotspot} />
        <JourneyHotspot accessibilityLabel="Journey" onPress={() => undefined} style={styles.navHotspot} />
        <JourneyHotspot accessibilityLabel="Alerts" onPress={() => router.replace('/alerts')} style={styles.navHotspot} />
        <JourneyHotspot accessibilityLabel="More" onPress={() => Alert.alert('More', 'More CareLoop options.')} style={styles.navHotspot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  hotspot: { position: 'absolute', backgroundColor: 'transparent' },
  backHotspot: { left: '3%', top: '5%', width: '13%', height: '7%' },
  howHotspot: { right: '3%', top: '5%', width: '27%', height: '7%' },
  initialHotspot: { left: '12%', right: '4%', top: '22%', height: '14%' },
  completedHotspot: { left: '12%', right: '4%', top: '36%', height: '14%' },
  upcomingHotspot: { left: '12%', right: '4%', top: '50%', height: '16%' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '10%', flexDirection: 'row' },
  navHotspot: { position: 'relative', flex: 1, height: '100%' },
});
