import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import type { JSX } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type DoctorInfoRowProps = {
  icon: Parameters<typeof SymbolView>[0]['name'];
  label: string;
  value: string;
};

type ContactRowProps = {
  accessibilityLabel: string;
  icon: Parameters<typeof SymbolView>[0]['name'];
  title: string;
  detail: string;
  subtitle?: string;
  onPress: () => void;
};

const NAVY = '#082F73';
const BLUE_GREY = '#6682A8';
const ICON_BLUE = '#5F7AA1';
const BRIGHT_BLUE = '#087EF5';

function CareSymbol({ name, color, size = 26 }: { name: Parameters<typeof SymbolView>[0]['name']; color: string; size?: number }): JSX.Element {
  return <SymbolView name={name} size={size} tintColor={color} weight="semibold" />;
}

function BackButton({ onPress }: { onPress: () => void }): JSX.Element {
  return (
    <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={onPress} style={styles.backButton}>
      <Text style={styles.backChevron}>‹</Text>
    </Pressable>
  );
}

function DoctorInfoRow({ icon, label, value }: DoctorInfoRowProps): JSX.Element {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <CareSymbol color={ICON_BLUE} name={icon} size={27} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ContactRow({ accessibilityLabel, detail, icon, onPress, subtitle, title }: ContactRowProps): JSX.Element {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={styles.contactRow}>
      <View style={styles.contactIconBubble}>
        <CareSymbol color={BRIGHT_BLUE} name={icon} size={30} />
      </View>
      <View style={styles.contactCopy}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactDetail}>{detail}</Text>
        {subtitle ? <Text style={styles.contactSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.contactChevron}>›</Text>
    </Pressable>
  );
}

export default function DoctorScreen(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.replace('/home')} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>My Doctor</Text>
            <Text style={styles.subtitle}>Your care partner in this journey.</Text>
          </View>
        </View>

        <View style={styles.profileHero}>
          <Image accessibilityLabel="Dr. K. Sathwik profile photo" contentFit="cover" source={require('@/assets/images/careloop/doctor-avatar.png')} style={styles.avatar} />
          <View style={styles.profileCopy}>
            <View style={styles.connectedPill}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
            <Text style={styles.doctorName}>Dr. K. Sathwik</Text>
            <Text style={styles.credentials}>MBBS, MD (General Medicine)</Text>
            <Text style={styles.specialization}>General Medicine</Text>
            <Text style={styles.doctorBio}>Caring for you, throughout your journey.</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <DoctorInfoRow icon="person.fill" label="Gender" value="Male" />
          <DoctorInfoRow icon="calendar" label="Age" value="34 years" />
          <DoctorInfoRow icon="stethoscope" label="Specialization" value="General Medicine" />
          <DoctorInfoRow icon="building.2.fill" label="Working at" value="City Care Hospital, Hyderabad" />
          <DoctorInfoRow icon="briefcase.fill" label="Experience" value="8+ years" />
          <DoctorInfoRow icon="mappin.and.ellipse" label="Location" value="Banjara Hills, Hyderabad" />
        </View>

        <View style={styles.careCard}>
          <View style={styles.careIconBubble}>
            <CareSymbol color={BRIGHT_BLUE} name="heart.fill" size={30} />
          </View>
          <View style={styles.careCopy}>
            <Text style={styles.careTitle}>Part of your care team</Text>
            <Text style={styles.careSubtitle}>Managing your follow-ups and overall care.</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <ContactRow
            accessibilityLabel="Contact Care Team by phone"
            detail="+91 98765 43210"
            icon="phone.fill"
            onPress={() => Alert.alert('Contact Care Team', '+91 98765 43210')}
            subtitle="Mon – Sat, 9 AM – 5 PM"
            title="Contact Care Team"
          />
          <View style={styles.contactDivider} />
          <ContactRow
            accessibilityLabel="Email Care Team"
            detail="careteam@citycarehosp.com"
            icon="envelope.fill"
            onPress={() => Alert.alert('Email Care Team', 'careteam@citycarehosp.com')}
            title="Email"
          />
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Text style={styles.noticeIconText}>i</Text>
          </View>
          <Text style={styles.noticeText}>For medical queries or urgent health concerns, please contact the hospital directly or visit in person. CareLoop is for care coordination and follow-up management.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', flex: 1 },
  content: { paddingBottom: 42, paddingHorizontal: 28, paddingTop: 48 },
  header: { alignItems: 'flex-start', flexDirection: 'row', marginBottom: 30 },
  backButton: { alignItems: 'center', height: 42, justifyContent: 'center', marginRight: 15, marginTop: 1, width: 32 },
  backChevron: { color: BLUE_GREY, fontSize: 36, fontWeight: '300', lineHeight: 36 },
  headerCopy: { flex: 1 },
  title: { color: NAVY, fontSize: 27, fontWeight: '800', lineHeight: 33 },
  subtitle: { color: BLUE_GREY, fontSize: 15, lineHeight: 21, marginTop: 3 },
  profileHero: { alignItems: 'center', flexDirection: 'row', marginBottom: 28 },
  avatar: { borderRadius: 78, height: 146, width: 146 },
  profileCopy: { flex: 1, marginLeft: 18 },
  connectedPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#DDF8EE', borderRadius: 18, flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6 },
  connectedDot: { backgroundColor: '#00B979', borderRadius: 7, height: 14, marginRight: 8, width: 14 },
  connectedText: { color: '#00A86B', fontSize: 14, fontWeight: '600' },
  doctorName: { color: NAVY, fontSize: 22, fontWeight: '800', lineHeight: 27, marginTop: 10 },
  credentials: { color: BLUE_GREY, fontSize: 14, lineHeight: 18, marginTop: 2 },
  specialization: { color: NAVY, fontSize: 16, lineHeight: 22, marginTop: 3 },
  doctorBio: { color: BLUE_GREY, fontSize: 13, lineHeight: 18, marginTop: 4 },
  infoList: { borderTopColor: '#DCE7F3', borderTopWidth: 1 },
  infoRow: { alignItems: 'center', borderBottomColor: '#DCE7F3', borderBottomWidth: 1, flexDirection: 'row', minHeight: 68, paddingVertical: 10 },
  infoIcon: { alignItems: 'center', width: 58 },
  infoLabel: { color: BLUE_GREY, flex: 0.82, fontSize: 14, lineHeight: 19 },
  infoValue: { color: NAVY, flex: 1.5, fontSize: 15, lineHeight: 20 },
  careCard: { alignItems: 'center', backgroundColor: '#EAF6FF', borderColor: '#CBE6FA', borderRadius: 22, flexDirection: 'row', marginTop: 24, paddingHorizontal: 18, paddingVertical: 18 },
  careIconBubble: { alignItems: 'center', backgroundColor: '#DDEFFF', borderRadius: 32, height: 64, justifyContent: 'center', width: 64 },
  careCopy: { flex: 1, marginLeft: 16 },
  careTitle: { color: NAVY, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  careSubtitle: { color: BLUE_GREY, fontSize: 14, lineHeight: 19, marginTop: 4 },
  contactCard: { borderColor: '#DCE7F3', borderRadius: 22, borderWidth: 1, marginTop: 24, overflow: 'hidden' },
  contactRow: { alignItems: 'center', flexDirection: 'row', minHeight: 104, paddingHorizontal: 18, paddingVertical: 16 },
  contactIconBubble: { alignItems: 'center', backgroundColor: '#E6F3FF', borderRadius: 31, height: 62, justifyContent: 'center', width: 62 },
  contactCopy: { flex: 1, marginLeft: 16 },
  contactTitle: { color: NAVY, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  contactDetail: { color: NAVY, fontSize: 15, lineHeight: 20, marginTop: 4 },
  contactSubtitle: { color: BLUE_GREY, fontSize: 14, lineHeight: 19, marginTop: 2 },
  contactChevron: { color: ICON_BLUE, fontSize: 32, fontWeight: '300', lineHeight: 34, marginLeft: 8 },
  contactDivider: { backgroundColor: '#DCE7F3', height: 1, marginHorizontal: 18 },
  noticeCard: { alignItems: 'flex-start', backgroundColor: '#EAF6FF', borderRadius: 22, flexDirection: 'row', marginTop: 24, paddingHorizontal: 20, paddingVertical: 20 },
  noticeIcon: { alignItems: 'center', backgroundColor: '#1D69B8', borderRadius: 21, height: 42, justifyContent: 'center', marginRight: 16, width: 42 },
  noticeIconText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', lineHeight: 32 },
  noticeText: { color: BLUE_GREY, flex: 1, fontSize: 14, lineHeight: 20 },
});
