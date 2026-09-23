import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

function ActionHotspot({
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

function showMessage(title: string, message: string): void {
  Alert.alert(title, message);
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <Image
        accessibilityLabel="CareLoop home dashboard"
        contentFit="fill"
        source={require('@/assets/images/careloop/home-dashboard-reference.png')}
        style={StyleSheet.absoluteFill}
      />

      <ActionHotspot
        accessibilityLabel="Attend follow-up appointment"
        onPress={() => showMessage("I'll attend", 'Your follow-up appointment is confirmed.')}
        style={styles.attendHotspot}
      />
      <ActionHotspot
        accessibilityLabel="Request reschedule"
        onPress={() => showMessage('Request reschedule', 'Your care team will help you choose another time.')}
        style={styles.rescheduleHotspot}
      />
      <ActionHotspot
        accessibilityLabel="Open care journey"
        onPress={() => router.replace('/journey')}
        style={styles.journeyHotspot}
      />
      <ActionHotspot
        accessibilityLabel="Open doctor connection"
        onPress={() => showMessage('Your doctor', 'Dr. K. Sathwik is connected.')}
        style={styles.doctorHotspot}
      />
      <ActionHotspot
        accessibilityLabel="Open reminder"
        onPress={() => showMessage('Reminder', 'Tomorrow at 10:30 AM.')}
        style={styles.reminderHotspot}
      />
      <View style={styles.bottomNav}>
        <ActionHotspot accessibilityLabel="Home" onPress={() => undefined} style={styles.navHotspot} />
        <ActionHotspot accessibilityLabel="Journey" onPress={() => router.replace('/journey')} style={styles.navHotspot} />
        <ActionHotspot accessibilityLabel="Alerts" onPress={() => router.replace('/alerts')} style={styles.navHotspot} />
        <ActionHotspot accessibilityLabel="More" onPress={() => showMessage('More', 'More CareLoop options.')} style={styles.navHotspot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FCFF' },
  hotspot: { position: 'absolute', backgroundColor: 'transparent' },
  attendHotspot: { left: '6%', right: '6%', top: '47%', height: '6%' },
  rescheduleHotspot: { left: '6%', right: '6%', top: '53%', height: '6%' },
  journeyHotspot: { left: '4%', right: '4%', top: '61%', height: '14%' },
  doctorHotspot: { left: '4%', right: '4%', top: '76%', height: '9%' },
  reminderHotspot: { left: '4%', right: '4%', top: '85%', height: '8%' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '10%', flexDirection: 'row' },
  navHotspot: { position: 'relative', flex: 1, height: '100%' },
});
