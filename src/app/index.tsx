import type { Session } from '@supabase/supabase-js';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CareLoopIcon, CareLoopLogo as NativeCareLoopLogo } from '@/components/careloop-ui';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getPatientConnectivitySnapshot, redeemPatientConnection } from '@/lib/patient';

type FlowStep = 'splash' | 'welcome' | 'qr' | 'code' | 'doctorConfirm' | 'connected' | 'email';
type PendingConnection = { code: string } | { qrPayload: string };

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
    <View style={[styles.brandLockup, compact && styles.brandLockupCompact]}>
      <NativeCareLoopLogo compact={compact} />
      {!compact ? <ThemedText style={styles.brandTagline}>One connection. Every follow-up.</ThemedText> : null}
    </View>
  );
}

function WaveBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.backdrop}>
      <StatusBar hidden />
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
          <View style={styles.splashBrandScale}>
            <CareLoopLogo />
          </View>
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

          <CareConnectionIllustration />

          <View style={styles.welcomeActions}>
            <PrimaryButton label="Get Started" icon="→" onPress={onGetStarted} />
            <PrimaryButton label="Sign In" onPress={onSignIn} variant="outline" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function CareConnectionIllustration(): ReactNode {
  return (
    <View
      accessible
      accessibilityLabel="A patient and clinician connected by a heart, representing ongoing care."
      style={styles.careIllustration}
    >
      <View style={styles.illustrationHalo} />
      <View style={styles.illustrationHaloRing} />
      <View style={styles.connectionLine} />

      <View style={[styles.connectionPerson, styles.patientConnectionPerson]}>
        <View style={[styles.connectionAvatar, styles.patientConnectionAvatar]}>
          <CareLoopIcon color="#FFFFFF" name="person" size={47} />
        </View>
        <Text style={styles.connectionRole}>PATIENT</Text>
        <Text style={styles.connectionCaption}>Your care journey</Text>
      </View>

      <View style={[styles.connectionPerson, styles.doctorConnectionPerson]}>
        <View style={[styles.connectionAvatar, styles.doctorConnectionAvatar]}>
          <CareLoopIcon color="#FFFFFF" name="doctor" size={45} />
        </View>
        <Text style={styles.connectionRole}>CARE TEAM</Text>
        <Text style={styles.connectionCaption}>Here for every step</Text>
      </View>

      <View style={styles.connectionHeart}>
        <CareLoopIcon color="#FFFFFF" name="heart" size={19} />
      </View>
      <Text style={[styles.illustrationPlus, styles.illustrationPlusLeft]}>+</Text>
      <Text style={[styles.illustrationPlus, styles.illustrationPlusRight]}>+</Text>
      <View style={styles.togetherPill}>
        <View style={styles.togetherDot} />
        <Text style={styles.togetherText}>Better care, together</Text>
      </View>
    </View>
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

function CareSymbol({ name, color, size = 22 }: { name: Parameters<typeof SymbolView>[0]['name']; color: string; size?: number }) {
  return <SymbolView name={name} size={size} tintColor={color} weight="semibold" />;
}

function QrConnectionScreen({ onBack, onCode, onScanned }: { onBack: () => void; onCode: () => void; onScanned: (payload: string) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
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
            {permission?.granted ? (
              <CameraView
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : ({ data }) => {
                  if (!data.startsWith('carelooppatient://connect?')) return;
                  setScanned(true);
                  onScanned(data);
                }}
                style={styles.cameraPreview}
              />
            ) : (
              <Pressable accessibilityRole="button" onPress={() => void requestPermission()} style={styles.cameraPermission}>
                <CareLoopIcon name="photo" size={35} />
                <Text style={styles.cameraPermissionText}>{permission?.canAskAgain === false ? 'Allow camera access in Settings to scan a QR code' : 'Tap to allow camera access and scan your code'}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.qrActions}>
            <PrimaryButton
              label="Scan QR Code"
              icon="⌗"
              onPress={() => { setScanned(false); void requestPermission(); }}
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

function ConnectionCodeScreen({ onBack, onContinue }: { onBack: () => void; onContinue: (code: string) => void }) {
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
              onPress={() => onContinue(code.trim().toUpperCase())}
              disabled={!code.trim()}
            />
          </ScrollView>
        </KeyboardAvoidingView>
        <ThemedText style={styles.qrFooter}>A healthier tomorrow,{`\n`}together.</ThemedText>
      </SafeAreaView>
    </WaveBackdrop>
  );
}

function PlainScreen({ children }: { children: ReactNode }) {
  return (
    <View style={styles.plainBackdrop}>
      <StatusBar hidden />
      {children}
    </View>
  );
}

function DoctorConfirmationScreen({ onBack, onConnect, onCancel, error, loading }: { onBack: () => void; onConnect: () => void; onCancel: () => void; error: string | null; loading: boolean }) {
  return (
    <PlainScreen>
      <SafeAreaView style={styles.screenSafeArea}>
        <ScrollView contentContainerStyle={styles.confirmScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.confirmTopBar}>
            <BackButton onPress={onBack} />
            <HelpButton />
          </View>
          <ThemedText style={styles.confirmHeading}>
            <ThemedText style={styles.headingNavy}>You are </ThemedText>
            <ThemedText style={styles.headingBlue}>connecting with</ThemedText>
          </ThemedText>
          <View style={styles.doctorAvatar}><CareLoopIcon color="#1685F1" name="doctor" size={42} /></View>
          <ThemedText style={styles.doctorName}>Care team connection</ThemedText>
          <ThemedText style={styles.doctorRole}>Review the care team details before sharing your record.</ThemedText>

          <View style={styles.permissionCard}>
            <ThemedText style={styles.permissionTitle}>This will allow your doctor to:</ThemedText>
            <PermissionRow icon="calendar" tint="#1685F1" background="#E5F3FF" title="Send your follow-up schedule" body="Get reminders for your appointments" />
            <PermissionRow icon="document" tint="#10C99D" background="#DDFBF4" title="Share appointment reminders" body="Stay on track with your care" />
            <PermissionRow icon="chart.bar.fill" tint="#6841E8" background="#EDE9FF" title="Keep track of your care journey" body="All your health information in one place" />
          </View>
          <View style={styles.confirmActions}>
            {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
            <PrimaryButton label={loading ? 'Connecting…' : 'Connect'} icon="→" onPress={onConnect} disabled={loading} />
            <PrimaryButton label="Cancel" onPress={onCancel} variant="outline" />
          </View>
          <View style={styles.secureFooter}><CareSymbol name="lock.fill" color="#6E89AE" size={14} /><ThemedText style={styles.secureFooterText}>Your information is secure and private.</ThemedText></View>
        </ScrollView>
      </SafeAreaView>
    </PlainScreen>
  );
}

function PermissionRow({ icon, tint, background, title, body }: { icon: Parameters<typeof SymbolView>[0]['name']; tint: string; background: string; title: string; body: string }) {
  return (
    <View style={styles.permissionRow}>
      <View style={[styles.permissionIcon, { backgroundColor: background }]}><CareSymbol name={icon} color={tint} size={22} /></View>
      <View style={styles.permissionCopy}><ThemedText style={styles.permissionRowTitle}>{title}</ThemedText><ThemedText style={styles.permissionRowBody}>{body}</ThemedText></View>
    </View>
  );
}

function ConnectedScreen({ onContinue, onHome }: { onContinue: () => void; onHome: () => void }) {
  return (
    <PlainScreen>
      <SafeAreaView style={styles.screenSafeArea}>
        <ScrollView contentContainerStyle={styles.connectedScroll} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.confetti}>
            <View style={[styles.confettiPiece, styles.confettiOne]} /><View style={[styles.confettiPiece, styles.confettiTwo]} /><View style={[styles.confettiPiece, styles.confettiThree]} /><View style={[styles.confettiPiece, styles.confettiFour]} /><View style={[styles.confettiPiece, styles.confettiFive]} /><View style={[styles.confettiPiece, styles.confettiSix]} />
            <View style={styles.successCircle}><ThemedText style={styles.successCheck}>✓</ThemedText></View>
          </View>
          <ThemedText style={styles.connectedTitle}>You’re connected!</ThemedText>
          <ThemedText style={styles.connectedIntro}>Your doctor can now send you{`\n`}follow-up schedules and appointment{`\n`}reminders.</ThemedText>
          <View style={styles.syncCard}>
            <PermissionRow icon="calendar" tint="#1685F1" background="#E5F3FF" title="Appointments synced" body="Get timely reminders" />
            <PermissionRow icon="document" tint="#10C99D" background="#DDFBF4" title="Stay informed" body="All your care details in one place" />
            <PermissionRow icon="heart" tint="#6841E8" background="#EDE9FF" title="Better care together" body="A healthier tomorrow, together." />
          </View>
          <View style={styles.confirmActions}>
            <PrimaryButton label="Continue" icon="→" onPress={onContinue} />
            <PrimaryButton label="Go to Home" onPress={onHome} variant="outline" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </PlainScreen>
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

function EmailAuthScreen({ email, password, onEmailChange, onPasswordChange, onSubmit, onToggleMode, onBack, loading, error, isSignUp, notice }: { email: string; password: string; onEmailChange: (value: string) => void; onPasswordChange: (value: string) => void; onSubmit: () => void; onToggleMode: () => void; onBack: () => void; loading: boolean; error: string | null; isSignUp: boolean; notice: string | null }) {
  return (
    <AuthFormShell title={isSignUp ? 'Create your account' : 'Welcome back'} onBack={onBack}>
      <ThemedText style={styles.formIntro}>Use your email to sign in securely, then connect to your care team.</ThemedText>
      <ThemedText style={styles.inputLabel}>Email address</ThemedText>
      <TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" autoFocus keyboardType="email-address" onChangeText={onEmailChange} placeholder="you@example.com" placeholderTextColor="#6685AA" style={styles.textInput} value={email} />
      <ThemedText style={styles.inputLabel}>Password</ThemedText>
      <TextInput accessibilityLabel="Password" autoComplete={isSignUp ? 'new-password' : 'current-password'} onChangeText={onPasswordChange} placeholder="At least 8 characters" placeholderTextColor="#6685AA" secureTextEntry style={styles.textInput} value={password} />
      {notice ? <ThemedText style={styles.formIntro}>{notice}</ThemedText> : null}
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
      <PrimaryButton label={loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'} onPress={onSubmit} disabled={loading} />
      <Pressable accessibilityRole="button" disabled={loading} onPress={onToggleMode} style={styles.authModeToggle}>
        <ThemedText style={styles.authModeText}>{isSignUp ? 'Already have an account? Sign in' : 'New to CareLoop? Create an account'}</ThemedText>
      </Pressable>
    </AuthFormShell>
  );
}

function HomeScreen({ session, onSignOut, onConnect }: { session: Session; onSignOut: () => void; onConnect: () => void }) {
  const firstName = useMemo(() => {
    const name = session.user.user_metadata?.full_name;
    return typeof name === 'string' && name.trim() ? name.split(' ')[0] : 'there';
  }, [session.user.user_metadata]);
  return (
    <WaveBackdrop>
      <SafeAreaView style={styles.screenSafeArea}>
        <ScrollView contentContainerStyle={styles.homeScroll}>
          <View style={styles.homeHeader}><View><ThemedText style={styles.eyebrow}>YOUR CARELOOP</ThemedText><ThemedText style={styles.homeTitle}>Hello, {firstName}</ThemedText></View><CareLoopLogo compact /></View>
          <View style={styles.nextStepCard}><ThemedText style={styles.nextStepLabel}>YOUR NEXT STEP</ThemedText><ThemedText style={styles.nextStepTitle}>Connect your care team</ThemedText><ThemedText style={styles.nextStepBody}>Scan your care team’s QR code or enter the temporary code they gave you.</ThemedText><View style={styles.homeConnectButton}><PrimaryButton label="Connect care team" onPress={onConnect} /></View></View>
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
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const inspectSession = async (): Promise<void> => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) { setStep('welcome'); return; }
      setSession(data.session);
      try {
        const connection = await getPatientConnectivitySnapshot();
        if (mounted) {
          if (connection) router.replace('/home');
          else setStep('welcome');
        }
      } catch (snapshotError) {
        if (mounted) { setError(snapshotError instanceof Error ? snapshotError.message : 'Could not load your care connection.'); setStep('welcome'); }
      }
    };
    void inspectSession();
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) { setStep('welcome'); return; }
      void getPatientConnectivitySnapshot().then((connection) => {
        if (!mounted) return;
        if (connection) router.replace('/home');
        else setStep('welcome');
      }).catch((snapshotError: unknown) => {
        if (mounted) { setError(snapshotError instanceof Error ? snapshotError.message : 'Could not load your care connection.'); setStep('welcome'); }
      });
    });
    const handleAuthLink = async (url: string | null): Promise<void> => {
      if (!url) return;
      const parsed = ExpoLinking.parse(url);
      if (parsed.path !== 'auth/callback' && parsed.path !== '/auth/callback') return;
      const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
      if (!code) return;
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError && mounted) setError(exchangeError.message);
    };
    void Linking.getInitialURL().then((url) => handleAuthLink(url));
    const linkSubscription = Linking.addEventListener('url', ({ url }) => { void handleAuthLink(url); });
    return () => { mounted = false; data.subscription.unsubscribe(); linkSubscription.remove(); };
  }, [router]);

  const authenticate = async (): Promise<void> => {
    setError(null);
    setNotice(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: ExpoLinking.createURL('auth/callback') },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice('Account created. Confirm the email sent by Supabase, then return here to sign in.');
          setIsSignUp(false);
          return;
        }
        setSession(data.session);
        setStep('qr');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (signInError) throw signInError;
        setSession(data.session);
        const connection = await getPatientConnectivitySnapshot();
        if (connection) router.replace('/home');
        else setStep('qr');
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => { await supabase.auth.signOut(); setSession(null); setStep('welcome'); };
  const go = (next: FlowStep): void => { setError(null); setNotice(null); setStep(next); };
  const openHome = (): void => { router.replace('/home'); };
  const startConnection = (): void => { setPendingConnection(null); setError(null); setStep('qr'); };
  const chooseCode = (code: string): void => { setPendingConnection({ code }); setError(null); setStep('doctorConfirm'); };
  const chooseQr = (qrPayload: string): void => { setPendingConnection({ qrPayload }); setError(null); setStep('doctorConfirm'); };
  const confirmConnection = async (): Promise<void> => {
    if (!pendingConnection) { setError('Scan a QR code or enter a connection code first.'); return; }
    setLoading(true); setError(null);
    try {
      await redeemPatientConnection(pendingConnection);
      setStep('connected');
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : 'Could not connect. Check the code and try again.');
    } finally { setLoading(false); }
  };

  if (step === 'splash' && !session) return <SplashScreenView />;
  if (session && step === 'welcome') return <HomeScreen session={session} onSignOut={() => void signOut()} onConnect={startConnection} />;
  if (step === 'welcome') return <WelcomeScreen onGetStarted={() => { setIsSignUp(true); go('email'); }} onSignIn={() => { setIsSignUp(false); go('email'); }} />;
  if (step === 'email') return <EmailAuthScreen email={email} password={password} onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={() => void authenticate()} onToggleMode={() => { setIsSignUp(!isSignUp); setNotice(null); setError(null); }} onBack={() => go('welcome')} loading={loading} error={error} isSignUp={isSignUp} notice={notice} />;
  if (step === 'qr') return <QrConnectionScreen onBack={() => go(session ? 'welcome' : 'email')} onCode={() => go('code')} onScanned={chooseQr} />;
  if (step === 'code') return <ConnectionCodeScreen onBack={() => go('qr')} onContinue={chooseCode} />;
  if (step === 'doctorConfirm') return <DoctorConfirmationScreen onBack={() => go(pendingConnection && 'code' in pendingConnection ? 'code' : 'qr')} onCancel={() => go('qr')} onConnect={() => void confirmConnection()} error={error} loading={loading} />;
  if (step === 'connected') return <ConnectedScreen onContinue={openHome} onHome={openHome} />;
  if (session) return <HomeScreen session={session} onSignOut={() => void signOut()} onConnect={startConnection} />;
  return <WelcomeScreen onGetStarted={() => { setIsSignUp(true); go('email'); }} onSignIn={() => { setIsSignUp(false); go('email'); }} />;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#F7FCFF', overflow: 'hidden' },
  plainBackdrop: { flex: 1, backgroundColor: '#FFFFFF' },
  softGlowTop: { position: 'absolute', width: 420, height: 420, borderRadius: 210, backgroundColor: '#E4F6FF', top: -180, left: -170, opacity: 0.9 },
  softGlowRight: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#E2F5FF', top: 220, right: -150, opacity: 0.7 },
  waveOne: { position: 'absolute', width: 540, height: 220, borderRadius: 260, backgroundColor: '#DDF4FF', left: -120, bottom: -30, transform: [{ rotate: '-12deg' }], opacity: 0.88 },
  waveTwo: { position: 'absolute', width: 560, height: 150, borderRadius: 240, borderTopWidth: 2, borderColor: '#FFFFFF', left: -70, bottom: 120, transform: [{ rotate: '-15deg' }], opacity: 0.9 },
  waveThree: { position: 'absolute', width: 520, height: 150, borderRadius: 240, borderTopWidth: 2, borderColor: '#FFFFFF', left: 50, bottom: 80, transform: [{ rotate: '12deg' }], opacity: 0.9 },
  splashSafeArea: { flex: 1 },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 110 },
  splashBrandScale: { transform: [{ scale: 1.45 }] },
  splashFooter: { color: '#315F99', fontSize: 19, lineHeight: 28, textAlign: 'center', marginBottom: 32 },
  screenSafeArea: { flex: 1 },
  welcomeScroll: { paddingHorizontal: 25, paddingTop: 18, paddingBottom: 28, alignItems: 'center' },
  brandLockup: { alignItems: 'center', marginBottom: 20 },
  brandLockupCompact: { alignSelf: 'flex-start', marginBottom: 24 },
  brandTagline: { color: '#456F9F', fontSize: 11, letterSpacing: 0.1, lineHeight: 15, marginTop: 4 },
  welcomeHeading: { textAlign: 'center', fontSize: 42, lineHeight: 45, fontWeight: '800', letterSpacing: -1.4 },
  headingNavy: { color: '#123B80' },
  headingBlue: { color: '#1187EA' },
  welcomeDescription: { textAlign: 'center', color: '#4F709C', fontSize: 19, lineHeight: 25, marginTop: 13 },
  careIllustration: { width: '100%', height: 290, overflow: 'hidden', marginTop: 8, borderRadius: 32, backgroundColor: 'rgba(232,247,255,0.8)', borderColor: '#D9EFFC', borderWidth: 1, position: 'relative' },
  illustrationHalo: { alignSelf: 'center', backgroundColor: '#DDF3FF', borderRadius: 125, height: 250, position: 'absolute', top: 5, width: 250 },
  illustrationHaloRing: { alignSelf: 'center', borderColor: 'rgba(255,255,255,0.88)', borderRadius: 138, borderWidth: 1.5, height: 276, position: 'absolute', top: -8, width: 276 },
  connectionLine: { backgroundColor: '#76C7F3', borderRadius: 2, height: 3, left: '19%', position: 'absolute', right: '19%', top: 98 },
  connectionPerson: { alignItems: 'center', position: 'absolute', top: 45, width: '42%' },
  patientConnectionPerson: { left: '4%' },
  doctorConnectionPerson: { right: '4%' },
  connectionAvatar: { alignItems: 'center', borderColor: '#FFFFFF', borderRadius: 54, borderWidth: 5, elevation: 5, height: 108, justifyContent: 'center', shadowColor: '#0A376E', shadowOffset: { height: 5, width: 0 }, shadowOpacity: 0.12, shadowRadius: 10, width: 108 },
  patientConnectionAvatar: { backgroundColor: '#1388E9' },
  doctorConnectionAvatar: { backgroundColor: '#0A4A91' },
  connectionRole: { color: '#123B80', fontSize: 10, fontWeight: '800', letterSpacing: 1, lineHeight: 14, marginTop: 8 },
  connectionCaption: { color: '#6685AA', fontSize: 9, lineHeight: 12, marginTop: 1, textAlign: 'center' },
  connectionHeart: { alignItems: 'center', backgroundColor: '#55BDF3', borderColor: '#FFFFFF', borderRadius: 23, borderWidth: 3, height: 46, justifyContent: 'center', left: '50%', marginLeft: -23, position: 'absolute', top: 77, width: 46 },
  illustrationPlus: { color: '#76C7F3', fontSize: 30, fontWeight: '400', lineHeight: 34, position: 'absolute' },
  illustrationPlusLeft: { left: '8%', top: 31 },
  illustrationPlusRight: { right: '8%', top: 54 },
  togetherPill: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.94)', borderColor: '#D5EBF8', borderRadius: 18, borderWidth: 1, bottom: 13, flexDirection: 'row', gap: 7, paddingHorizontal: 13, paddingVertical: 7, position: 'absolute' },
  togetherDot: { backgroundColor: '#00A978', borderRadius: 4, height: 8, width: 8 },
  togetherText: { color: '#315F99', fontSize: 11, fontWeight: '700', lineHeight: 15 },
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
  confirmScroll: { paddingHorizontal: 26, paddingTop: 0, paddingBottom: 10, alignItems: 'center' },
  confirmTopBar: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  confirmHeading: { textAlign: 'center', width: '100%', fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -1.2, marginBottom: 20 },
  doctorAvatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5F3FF' },
  doctorName: { color: '#123B80', fontSize: 27, lineHeight: 32, fontWeight: '800', textAlign: 'center' },
  doctorRole: { color: '#5878A2', fontSize: 17, lineHeight: 22, marginTop: 1, textAlign: 'center' },
  permissionCard: { width: '100%', borderWidth: 1.5, borderColor: '#D4ECFF', borderRadius: 20, padding: 15, marginTop: 18, marginBottom: 18 },
  permissionTitle: { color: '#123B80', fontSize: 18, lineHeight: 23, fontWeight: '800', marginBottom: 2 },
  permissionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  permissionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  permissionIconText: { fontSize: 20, fontWeight: '700' },
  permissionCopy: { flex: 1, marginLeft: 12 },
  permissionRowTitle: { color: '#123B80', fontSize: 14, lineHeight: 18, fontWeight: '600' },
  permissionRowBody: { color: '#6685AA', fontSize: 12, lineHeight: 16, marginTop: 1 },
  confirmActions: { width: '100%', gap: 10 },
  secureFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  secureFooterText: { color: '#6E89AE', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  connectedScroll: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 120, paddingBottom: 18, alignItems: 'center' },
  confetti: { width: 210, height: 178, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  successCircle: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#12C995', alignItems: 'center', justifyContent: 'center', shadowColor: '#12C995', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 5 } },
  successCheck: { color: '#FFFFFF', fontSize: 70, lineHeight: 78, fontWeight: '300', marginTop: -6 },
  confettiPiece: { position: 'absolute', width: 13, height: 24, borderRadius: 3 },
  confettiOne: { backgroundColor: '#6BA5F4', top: 16, left: 33, transform: [{ rotate: '28deg' }] },
  confettiTwo: { backgroundColor: '#F6B42A', top: 34, right: 28, transform: [{ rotate: '34deg' }] },
  confettiThree: { backgroundColor: '#13B980', top: 82, left: 2, transform: [{ rotate: '-32deg' }] },
  confettiFour: { backgroundColor: '#1788EA', top: 88, right: 0, transform: [{ rotate: '64deg' }] },
  confettiFive: { backgroundColor: '#F8B22C', bottom: 34, left: 28, transform: [{ rotate: '50deg' }] },
  confettiSix: { backgroundColor: '#12C995', bottom: 24, right: 34, transform: [{ rotate: '-52deg' }] },
  connectedTitle: { color: '#123B80', fontSize: 31, lineHeight: 37, fontWeight: '800', textAlign: 'center', marginTop: 25 },
  connectedIntro: { color: '#6685AA', fontSize: 17, lineHeight: 24, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  syncCard: { width: '100%', backgroundColor: '#F2F8FF', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10, marginBottom: 14 },
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
  cameraPreview: { width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden' },
  cameraPermission: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', padding: 26, gap: 14 },
  cameraPermissionText: { color: '#5878A2', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  authModeToggle: { alignItems: 'center', padding: 18 },
  authModeText: { color: '#1269C9', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  homeConnectButton: { marginTop: 20 },
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
