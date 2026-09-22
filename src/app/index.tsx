import type { Session } from '@supabase/supabase-js';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type FlowStep = 'splash' | 'welcome' | 'qr' | 'code' | 'phone' | 'otp';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  icon?: string;
};

function PrimaryButton({ label, onPress, disabled = false, variant = 'filled', icon }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'outline' ? styles.outlineButton : styles.filledButton,
        pressed && styles.pressed,
        disabled && styles.disabledButton,
      ]}>
      {disabled ? (
        <ActivityIndicator color={variant === 'filled' ? '#FFFFFF' : '#1468D5'} />
      ) : (
        <>
          {icon && <ThemedText style={variant === 'filled' ? styles.filledButtonIcon : styles.outlineButtonIcon}>{icon}</ThemedText>}
          <ThemedText style={variant === 'filled' ? styles.filledButtonText : styles.outlineButtonText}>{label}</ThemedText>
        </>
      )}
    </Pressable>
  );
}

function CareLoopLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      accessibilityLabel="CareLoop — One connection. Every follow-up."
      contentFit="contain"
      source={require('@/assets/images/careloop/logo-lockup-transparent.png')}
      style={compact ? styles.compactLogoImage : styles.logoImage}
    />
  );
}

function WaveBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.backdrop}>
      <StatusBar style="dark" />
      <View style={styles.softGlowTop} />
      <View style={styles.softGlowRight} />
      <View style={styles.waveOne} />
      <View style={styles.waveTwo} />
      <View style={styles.waveThree} />
      {children}
    </View>
  );
}

function SplashScreenView() {
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.splashSafeArea}>
        <View style={styles.splashContent}>
          <Image
            accessibilityLabel="CareLoop — One connection. Every follow-up."
            contentFit="contain"
            source={require('@/assets/images/careloop/splash-lockup-transparent.png')}
            style={styles.splashLockupImage}
          />
        </View>
        <ThemedText style={styles.splashFooter}>A healthier tomorrow,{`\n`}together.</ThemedText>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function WelcomeScreen({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.screenSafeArea}>
        <ScrollView contentContainerStyle={styles.welcomeScroll} showsVerticalScrollIndicator={false}>
          <CareLoopLogo />
          <ThemedText style={styles.welcomeHeading}>
            <ThemedText style={styles.headingNavy}>Stay connected{`\n`}</ThemedText>
            <ThemedText style={styles.headingBlue}>with your care</ThemedText>
          </ThemedText>
          <ThemedText style={styles.welcomeDescription}>
            Your appointments, follow-ups{`\n`}and reminders — all in one place.
          </ThemedText>

          <View style={styles.doctorImageCrop}>
            <Image
              contentFit="cover"
              source={require('@/assets/images/careloop/doctor-patient.png')}
              style={styles.doctorImage}
            />
          </View>

          <View style={styles.welcomeActions}>
            <PrimaryButton label="Get Started" icon="→" onPress={onGetStarted} />
            <PrimaryButton label="Sign In" onPress={onSignIn} variant="outline" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onPress} style={styles.topBackButton}>
      <ThemedText style={styles.topBackIcon}>‹</ThemedText>
    </Pressable>
  );
}

function HelpButton() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Help" onPress={() => Alert.alert('CareLoop help', 'Ask your care team for help connecting your account.')} style={styles.helpButton}>
      <ThemedText style={styles.helpText}>?</ThemedText>
    </Pressable>
  );
}

function QrConnectionScreen({ onBack, onCode }: { onBack: () => void; onCode: () => void }) {
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.screenSafeArea}>
        <ScrollView contentContainerStyle={styles.qrScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.qrTopBar}>
            <BackButton onPress={onBack} />
            <HelpButton />
          </View>
          <ThemedText style={styles.qrHeading}>
            <ThemedText style={styles.headingNavy}>Connect with your </ThemedText>
            <ThemedText style={styles.headingBlue}>doctor</ThemedText>
          </ThemedText>
          <ThemedText style={styles.qrDescription}>
            Scan the QR code provided by your{`\n`}doctor to connect your care journey.
          </ThemedText>

          <View style={styles.scannerFrame}>
            <ScannerCorner position="topLeft" />
            <ScannerCorner position="topRight" />
            <ScannerCorner position="bottomLeft" />
            <ScannerCorner position="bottomRight" />
            <View style={styles.scanGlyph}>
              <View style={styles.scanGlyphTopLeft} />
              <View style={styles.scanGlyphTopRight} />
              <View style={styles.scanGlyphBottomLeft} />
              <View style={styles.scanGlyphBottomRight} />
            </View>
          </View>

          <View style={styles.qrActions}>
            <PrimaryButton
              label="Scan QR Code"
              icon="⌗"
              onPress={() => Alert.alert('Camera access', 'QR scanning will open here when camera access is enabled.')}
            />
            <PrimaryButton label="Enter connection code" onPress={onCode} variant="outline" />
          </View>
        </ScrollView>
        <ThemedText style={styles.qrFooter}>A healthier tomorrow,{`\n`}together.</ThemedText>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function ScannerCorner({ position }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) {
  return <View style={[styles.scannerCorner, styles[position]]} />;
}

function ConnectionCodeScreen({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('');
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.screenSafeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardShell}>
          <ScrollView contentContainerStyle={styles.codeScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.qrTopBar}>
              <BackButton onPress={onBack} />
              <HelpButton />
            </View>
            <ThemedText style={styles.qrHeading}>
              <ThemedText style={styles.headingNavy}>Enter your </ThemedText>
              <ThemedText style={styles.headingBlue}>connection code</ThemedText>
            </ThemedText>
            <ThemedText style={styles.qrDescription}>
              Enter the temporary code provided by your doctor or care team.
            </ThemedText>
            <TextInput
              accessibilityLabel="Connection code"
              autoCapitalize="characters"
              autoFocus
              onChangeText={setCode}
              placeholder="e.g. CL-4829"
              placeholderTextColor="#6685AA"
              style={styles.codeInput}
              value={code}
            />
            <PrimaryButton
              label="Continue"
              onPress={() => Alert.alert('Connection code', code.trim() ? 'We will verify this code with your care team.' : 'Enter your connection code to continue.')}
              disabled={!code.trim()}
            />
          </ScrollView>
        </KeyboardAvoidingView>
        <ThemedText style={styles.qrFooter}>A healthier tomorrow,{`\n`}together.</ThemedText>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function AuthFormShell({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.screenSafeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardShell}>
          <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
            <BackButton onPress={onBack} />
            <CareLoopLogo compact />
            <ThemedText style={styles.formTitle}>{title}</ThemedText>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function PhoneScreen({ phone, onPhoneChange, onSend, onBack, loading, error }: { phone: string; onPhoneChange: (value: string) => void; onSend: () => void; onBack: () => void; loading: boolean; error: string | null }) {
  return (
    <AuthFormShell title="Let’s get you connected" onBack={onBack}>
      <ThemedText style={styles.formIntro}>Enter your mobile number. We’ll send you a one-time verification code.</ThemedText>
      <ThemedText style={styles.inputLabel}>Mobile number</ThemedText>
      <TextInput accessibilityLabel="Mobile number" autoComplete="tel" autoFocus keyboardType="phone-pad" onChangeText={onPhoneChange} placeholder="+91 98765 43210" placeholderTextColor="#6685AA" style={styles.textInput} value={phone} />
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      <PrimaryButton label="Send code" onPress={onSend} disabled={loading} />
    </AuthFormShell>
  );
}

function OtpScreen({ phone, otp, onOtpChange, onVerify, onBack, loading, error }: { phone: string; otp: string; onOtpChange: (value: string) => void; onVerify: () => void; onBack: () => void; loading: boolean; error: string | null }) {
  return (
    <AuthFormShell title="Enter your code" onBack={onBack}>
      <ThemedText style={styles.formIntro}>We sent a six-digit code to {phone}.</ThemedText>
      <ThemedText style={styles.inputLabel}>Verification code</ThemedText>
      <TextInput accessibilityLabel="Verification code" autoComplete="one-time-code" autoFocus keyboardType="number-pad" maxLength={6} onChangeText={onOtpChange} placeholder="000000" placeholderTextColor="#6685AA" style={[styles.textInput, styles.otpInput]} value={otp} />
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      <PrimaryButton label="Verify and continue" onPress={onVerify} disabled={loading} />
    </AuthFormShell>
  );
}

function HomeScreen({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const firstName = useMemo(() => {
    const name = session.user.user_metadata?.full_name;
    return typeof name === 'string' && name.trim() ? name.split(' ')[0] : 'there';
  }, [session.user.user_metadata]);
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.screenSafeArea}>
        <ScrollView contentContainerStyle={styles.homeScroll}>
          <View style={styles.homeHeader}><View><ThemedText style={styles.eyebrow}>YOUR CARELOOP</ThemedText><ThemedText style={styles.homeTitle}>Hello, {firstName}</ThemedText></View><CareLoopLogo compact /></View>
          <View style={styles.nextStepCard}><ThemedText style={styles.nextStepLabel}>YOUR NEXT STEP</ThemedText><ThemedText style={styles.nextStepTitle}>Connect your care team</ThemedText><ThemedText style={styles.nextStepBody}>Ask your doctor or care team for a secure connection code to get started.</ThemedText></View>
          <ThemedText style={styles.sectionTitle}>Care Journey</ThemedText>
          <View style={styles.emptyJourneyCard}><ThemedText style={styles.emptyJourneyTitle}>Your journey starts here</ThemedText><ThemedText style={styles.emptyJourneyBody}>Once you connect with your care team, your follow-ups will appear here.</ThemedText></View>
          <Pressable accessibilityRole="button" onPress={onSignOut} style={styles.signOutButton}><ThemedText style={styles.signOutText}>Sign out</ThemedText></Pressable>
        </ScrollView>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

export default function HomeRoute() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<FlowStep>('splash');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStep('welcome'), 1600);
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        setSession(data.session);
        router.replace('/home');
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        if (nextSession) router.replace('/home');
      }
    });
    return () => { mounted = false; clearTimeout(timer); data.subscription.unsubscribe(); };
  }, [router]);

  const requestOtp = async (): Promise<void> => {
    setError(null);
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) { setError('Enter your full mobile number with country code.'); return; }
    setLoading(true);
    const { error: requestError } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
    setLoading(false);
    if (requestError) { setError(requestError.message); return; }
    setPhone(normalizedPhone); setStep('otp');
  };

  const verifyOtp = async (): Promise<void> => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) { setError('Enter the six-digit code we sent to your phone.'); return; }
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (verifyError) { setError(verifyError.message); return; }
    setSession(data.session);
    router.replace('/home');
  };

  const signOut = async (): Promise<void> => { await supabase.auth.signOut(); setSession(null); setStep('welcome'); };
  const go = (next: FlowStep): void => { setError(null); setStep(next); };

  if (session) return <HomeScreen session={session} onSignOut={signOut} />;
  if (step === 'splash') return <SplashScreenView />;
  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => go('qr')} onSignIn={() => go('phone')} />;
  if (step === 'qr') return <QrConnectionScreen onBack={() => go('welcome')} onCode={() => go('code')} />;
  if (step === 'code') return <ConnectionCodeScreen onBack={() => go('qr')} />;
  if (step === 'phone') return <PhoneScreen error={error} loading={loading} onBack={() => go('welcome')} onPhoneChange={setPhone} onSend={requestOtp} phone={phone} />;
  return <OtpScreen error={error} loading={loading} onBack={() => go('phone')} onOtpChange={setOtp} onVerify={verifyOtp} otp={otp} phone={phone} />;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#F7FCFF', overflow: 'hidden' },
  softGlowTop: { position: 'absolute', width: 420, height: 420, borderRadius: 210, backgroundColor: '#E4F6FF', top: -180, left: -170, opacity: 0.9 },
  softGlowRight: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#E2F5FF', top: 220, right: -150, opacity: 0.7 },
  waveOne: { position: 'absolute', width: 540, height: 220, borderRadius: 260, backgroundColor: '#DDF4FF', left: -120, bottom: -30, transform: [{ rotate: '-12deg' }], opacity: 0.88 },
  waveTwo: { position: 'absolute', width: 560, height: 150, borderRadius: 240, borderTopWidth: 2, borderColor: '#FFFFFF', left: -70, bottom: 120, transform: [{ rotate: '-15deg' }], opacity: 0.9 },
  waveThree: { position: 'absolute', width: 520, height: 150, borderRadius: 240, borderTopWidth: 2, borderColor: '#FFFFFF', left: 50, bottom: 80, transform: [{ rotate: '12deg' }], opacity: 0.9 },
  splashSafeArea: { flex: 1 },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 110 },
  splashLockupImage: { width: 330, height: 350 },
  splashFooter: { color: '#315F99', fontSize: 19, lineHeight: 28, textAlign: 'center', marginBottom: 32 },
  screenSafeArea: { flex: 1 },
  welcomeScroll: { paddingHorizontal: 25, paddingTop: 18, paddingBottom: 28, alignItems: 'center' },
  logoImage: { width: 210, height: 180, marginBottom: 20 },
  compactLogoImage: { width: 120, height: 82, alignSelf: 'flex-start', marginBottom: 24 },
  welcomeHeading: { textAlign: 'center', fontSize: 42, lineHeight: 45, fontWeight: '800', letterSpacing: -1.4 },
  headingNavy: { color: '#123B80' },
  headingBlue: { color: '#1187EA' },
  welcomeDescription: { textAlign: 'center', color: '#4F709C', fontSize: 19, lineHeight: 25, marginTop: 13 },
  doctorImageCrop: { width: '100%', height: 290, overflow: 'hidden', marginTop: 8, borderRadius: 32 },
  doctorImage: { width: '100%', height: '100%' },
  welcomeActions: { width: '100%', gap: 14, marginTop: -3 },
  actionButton: { width: '100%', minHeight: 60, borderRadius: 32, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 20, paddingHorizontal: 25 },
  filledButton: { backgroundColor: '#1185E8', experimental_backgroundImage: 'linear-gradient(90deg, #14B8EF, #0872DE)' },
  outlineButton: { borderWidth: 1.5, borderColor: '#35AFFF', backgroundColor: 'rgba(247,252,255,0.72)' },
  filledButtonText: { color: '#FFFFFF', fontSize: 21, fontWeight: '700' },
  outlineButtonText: { color: '#1269C9', fontSize: 21, fontWeight: '700' },
  filledButtonIcon: { color: '#FFFFFF', fontSize: 34, lineHeight: 34, fontWeight: '300' },
  outlineButtonIcon: { color: '#1269C9', fontSize: 30 },
  disabledButton: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
  qrScroll: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 140, alignItems: 'center' },
  qrTopBar: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 42 },
  topBackButton: { width: 44, height: 44, justifyContent: 'center' },
  topBackIcon: { color: '#123B80', fontSize: 51, lineHeight: 44, fontWeight: '300' },
  helpButton: { width: 42, height: 42, borderRadius: 22, borderWidth: 2, borderColor: '#123B80', alignItems: 'center', justifyContent: 'center' },
  helpText: { color: '#123B80', fontSize: 28, lineHeight: 30, fontWeight: '700' },
  qrHeading: { width: '100%', textAlign: 'left', fontSize: 35, lineHeight: 40, fontWeight: '800', letterSpacing: -1.2 },
  qrDescription: { width: '100%', textAlign: 'left', color: '#5878A2', fontSize: 19, lineHeight: 27, marginTop: 16 },
  scannerFrame: { width: '78%', aspectRatio: 1, marginTop: 38, marginBottom: 32, position: 'relative', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(210,239,255,0.28)' },
  scannerCorner: { position: 'absolute', width: 48, height: 48, borderColor: '#087DEB' },
  topLeft: { top: 0, left: 0, borderTopWidth: 8, borderLeftWidth: 8, borderTopLeftRadius: 14 },
  topRight: { top: 0, right: 0, borderTopWidth: 8, borderRightWidth: 8, borderTopRightRadius: 14 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 8, borderLeftWidth: 8, borderBottomLeftRadius: 14 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 8, borderRightWidth: 8, borderBottomRightRadius: 14 },
  scanGlyph: { width: 112, height: 112, position: 'relative' },
  scanGlyphTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 13, borderLeftWidth: 13, borderColor: '#91BFE4', borderTopLeftRadius: 17 },
  scanGlyphTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 13, borderRightWidth: 13, borderColor: '#91BFE4', borderTopRightRadius: 17 },
  scanGlyphBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 13, borderLeftWidth: 13, borderColor: '#91BFE4', borderBottomLeftRadius: 17 },
  scanGlyphBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 13, borderRightWidth: 13, borderColor: '#91BFE4', borderBottomRightRadius: 17 },
  qrActions: { width: '100%', gap: 14 },
  qrFooter: { position: 'absolute', bottom: 30, alignSelf: 'center', color: '#315F99', fontSize: 17, lineHeight: 24, textAlign: 'center' },
  codeScroll: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 120 },
  codeInput: { minHeight: 60, width: '100%', borderWidth: 1.5, borderColor: '#35AFFF', borderRadius: 18, paddingHorizontal: 20, color: '#123B80', fontSize: 20, marginTop: 34, marginBottom: 20, backgroundColor: 'rgba(247,252,255,0.8)' },
  keyboardShell: { flex: 1 },
  authScroll: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 20, paddingBottom: 90 },
  formTitle: { color: '#123B80', fontSize: 34, lineHeight: 41, fontWeight: '800', marginBottom: 12 },
  formIntro: { color: '#5878A2', fontSize: 18, lineHeight: 26, marginBottom: 25 },
  inputLabel: { color: '#123B80', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  textInput: { minHeight: 60, borderWidth: 1.5, borderColor: '#35AFFF', borderRadius: 18, paddingHorizontal: 20, color: '#123B80', fontSize: 18, fontFamily: Fonts.sans, marginBottom: 20, backgroundColor: 'rgba(247,252,255,0.8)' },
  otpInput: { textAlign: 'center', letterSpacing: 12, fontFamily: Fonts.mono },
  errorText: { color: '#B33A32', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  homeScroll: { paddingHorizontal: 26, paddingTop: 22, paddingBottom: 110 },
  homeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  eyebrow: { color: '#5878A2', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  homeTitle: { color: '#123B80', fontSize: 30, lineHeight: 38, fontWeight: '800' },
  nextStepCard: { backgroundColor: '#123B80', borderRadius: 26, padding: 24, marginBottom: 32 },
  nextStepLabel: { color: '#BDEAFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 18 },
  nextStepTitle: { color: '#FFFFFF', fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 8 },
  nextStepBody: { color: '#DDEFFF', fontSize: 16, lineHeight: 24 },
  sectionTitle: { color: '#123B80', fontSize: 26, fontWeight: '800', marginBottom: 14 },
  emptyJourneyCard: { backgroundColor: 'rgba(222,244,255,0.8)', borderRadius: 22, padding: 24, alignItems: 'center' },
  emptyJourneyTitle: { color: '#123B80', fontSize: 19, fontWeight: '800', marginBottom: 8 },
  emptyJourneyBody: { color: '#5878A2', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  signOutButton: { alignSelf: 'center', padding: 20, marginTop: 20 },
  signOutText: { color: '#5878A2' },
});
