import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.eyebrow}>YOUR CARELOOP</ThemedText>
        <ThemedText style={styles.title}>Your next step</ThemedText>
        <View style={styles.card}>
          <ThemedText style={styles.cardEyebrow}>GET CONNECTED</ThemedText>
          <ThemedText style={styles.cardTitle}>Connect your care team</ThemedText>
          <ThemedText style={styles.cardBody}>
            Ask your doctor or care team for a secure connection code to begin your journey.
          </ThemedText>
        </View>
        <ThemedText style={styles.sectionTitle}>Care Journey</ThemedText>
        <View style={styles.emptyCard}>
          <ThemedText style={styles.emptyTitle}>Your journey starts here</ThemedText>
          <ThemedText style={styles.emptyBody}>
            Your appointments and follow-ups will appear here once you connect.
          </ThemedText>
        </View>
        <ThemedText
          accessibilityRole="button"
          onPress={() => {
            void supabase.auth.signOut();
            router.replace('/');
          }}
          style={styles.signOut}>
          Sign out
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: { padding: Spacing.four, paddingBottom: 120 },
  eyebrow: { color: '#5878A2', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#123B80', fontSize: 32, fontWeight: '800', marginTop: Spacing.one, marginBottom: Spacing.four },
  card: { backgroundColor: '#123B80', borderRadius: 26, padding: Spacing.four, marginBottom: Spacing.five },
  cardEyebrow: { color: '#BDEAFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: Spacing.three },
  cardTitle: { color: '#FFFFFF', fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: Spacing.two },
  cardBody: { color: '#DDEFFF', fontSize: 16, lineHeight: 24 },
  sectionTitle: { color: '#123B80', fontSize: 25, fontWeight: '800', marginBottom: Spacing.three },
  emptyCard: { backgroundColor: '#E0F4FF', borderRadius: 22, padding: Spacing.four, alignItems: 'center' },
  emptyTitle: { color: '#123B80', fontSize: 19, fontWeight: '800', marginBottom: Spacing.two },
  emptyBody: { color: '#5878A2', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  signOut: { color: '#5878A2', textAlign: 'center', padding: Spacing.four, marginTop: Spacing.three },
});
