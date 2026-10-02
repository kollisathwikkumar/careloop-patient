import { useRouter, type Href } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, AppState, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  DEFAULT_APPOINTMENT,
  getRescheduleDates,
  RESCHEDULE_TIMES,
  saveAppointment,
  type AppointmentSchedule,
} from '@/lib/appointment';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, CareLoopLogo, PatientAppFrame } from '@/components/careloop-ui';
import { getActivePatientId, getPatientAppPatient, type PatientAppPatient } from '@/lib/patient-backend';

function shortDate(date: string): string {
  return date.replace('September', 'Sep').replace('October', 'Oct');
}

type RescheduleModalProps = {
  initialAppointment: AppointmentSchedule;
  onCancel: () => void;
  onSubmit: (appointment: AppointmentSchedule) => Promise<void>;
  visible: boolean;
};

function RescheduleModal({ initialAppointment, onCancel, onSubmit, visible }: RescheduleModalProps): JSX.Element {
  const rescheduleDates = getRescheduleDates();
  const [selectedDate, setSelectedDate] = useState(initialAppointment.date);
  const [selectedTime, setSelectedTime] = useState(initialAppointment.time);
  const [isSaving, setIsSaving] = useState(false);

  const submitRequest = async (): Promise<void> => {
    const selectedDateOption = rescheduleDates.find((option) => option.date === selectedDate);
    const appointment: AppointmentSchedule = {
      date: selectedDate,
      weekday: selectedDateOption?.weekday ?? initialAppointment.weekday,
      time: selectedTime,
      status: 'reschedule-requested',
    };

    setIsSaving(true);
    try {
      await onSubmit(appointment);
    } catch {
      setIsSaving(false);
      Alert.alert('Request not sent', 'Please try again when you have a connection.');
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <Pressable accessibilityLabel="Close reschedule dialog" onPress={onCancel} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <CareLoopIcon name="calendar" size={28} />
            </View>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalEyebrow}>FOLLOW-UP VISIT</Text>
              <Text style={styles.modalTitle}>Request reschedule</Text>
              <Text style={styles.modalSubtitle}>Choose a time that works for you.</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Select a date</Text>
          <View style={styles.choiceRow}>
            {rescheduleDates.map((option) => {
              const selected = option.date === selectedDate;
              return (
                <Pressable
                  accessibilityLabel={`Select ${option.date}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.date}
                  onPress={() => setSelectedDate(option.date)}
                  style={[styles.choice, selected && styles.choiceSelected]}
                >
                  <Text style={[styles.choiceDate, selected && styles.choiceTextSelected]}>{shortDate(option.date)}</Text>
                  <Text style={[styles.choiceWeekday, selected && styles.choiceTextSelected]}>{option.weekday}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Select a time</Text>
          <View style={styles.choiceRow}>
            {RESCHEDULE_TIMES.map((time) => {
              const selected = time === selectedTime;
              return (
                <Pressable
                  accessibilityLabel={`Select ${time}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  style={[styles.timeChoice, selected && styles.choiceSelected]}
                >
                  <Text style={[styles.timeText, selected && styles.choiceTextSelected]}>{time}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summaryPill}>
            <CareLoopIcon name="calendar" size={18} />
            <Text style={styles.summaryText}>{selectedDate} · {selectedTime}</Text>
          </View>

          <View style={styles.modalActions}>
            <Pressable accessibilityRole="button" disabled={isSaving} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={isSaving} onPress={() => void submitRequest()} style={styles.submitButton}>
              <Text style={styles.submitText}>{isSaving ? 'Sending…' : 'Send request'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Header({ onMessages }: { onMessages: () => void }): JSX.Element {
  return (
    <View style={styles.header}>
      <CareLoopLogo />
      <Pressable accessibilityLabel="Open messages" accessibilityRole="button" onPress={onMessages} style={styles.notificationButton}>
        <CareLoopIcon name="message" size={23} color={C.navy} />
      </Pressable>
    </View>
  );
}

function DoctorAvatar({ size = 42 }: { size?: number }): JSX.Element {
  return <View accessibilityLabel="Care team" style={[styles.doctorAvatar, { height: size, width: size }]}><CareLoopIcon color={C.blue} name="doctor" size={Math.round(size * 0.48)} /></View>;
}

function DetailLine({ icon, title, detail }: { icon: 'calendar' | 'clock'; title: string; detail: string }): JSX.Element {
  return (
    <View style={styles.detailLine}>
      <View style={styles.detailIcon}>
        <CareLoopIcon name={icon} size={20} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailText}>{detail}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);
  const [sharedPatient, setSharedPatient] = useState<PatientAppPatient | null>(null);
  const [activePatientId, setActivePatientId] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isSavingConfirmation, setIsSavingConfirmation] = useState(false);
  const [isRescheduleVisible, setIsRescheduleVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const refreshFromCareRecord = async (): Promise<void> => {
      try {
        const patientId = await getActivePatientId();
        const patient = await getPatientAppPatient(patientId);
        if (!active) return;
        setActivePatientId(patientId);
        setSharedPatient(patient);
        setBackendConnected(true);
        setAppointment({ date: patient.nextFollowup, weekday: patient.weekday, time: patient.time, status: patient.status === 'not-scheduled' ? 'not-scheduled' : patient.response === 'Confirmed' ? 'confirmed' : patient.response === 'Reschedule requested' ? 'reschedule-requested' : 'awaiting-confirmation' });
      } catch {
        if (active) { setBackendConnected(false); setSharedPatient(null); setAppointment(DEFAULT_APPOINTMENT); }
      }
    };
    void refreshFromCareRecord();
    const refreshTimer = setInterval(() => {
      if (AppState.currentState === 'active') void refreshFromCareRecord();
    }, 30000);
    const appState = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void refreshFromCareRecord();
    });
    return () => {
      active = false;
      clearInterval(refreshTimer);
      appState.remove();
    };
  }, []);

  const submitReschedule = async (nextAppointment: AppointmentSchedule): Promise<void> => {
    await saveAppointment(nextAppointment, activePatientId);
    setAppointment(nextAppointment);
    setIsRescheduleVisible(false);
    Alert.alert('Request sent', 'Your care team will confirm the new appointment time.');
  };

  const confirmAttendance = async (): Promise<void> => {
    if (isSavingConfirmation || !backendConnected || !activePatientId) return;
    const confirmedAppointment: AppointmentSchedule = { ...appointment, status: 'confirmed' };
    const message = `Appointment confirmed — ${confirmedAppointment.date} at ${confirmedAppointment.time}.`;
    setIsSavingConfirmation(true);
    try {
      await saveAppointment(confirmedAppointment, activePatientId);
      setAppointment(confirmedAppointment);
      setSharedPatient((current) => current ? { ...current, response: 'Confirmed' } : current);
      setConfirmationMessage(message);
    } catch (error) {
      console.error('[CareLoop] Appointment confirmation save failed:', error);
      Alert.alert('Confirmation not saved', 'Your care team has not received your confirmation. Check your connection and try again.');
    } finally {
      setIsSavingConfirmation(false);
    }
  };

  return (
    <PatientAppFrame activeTab="home">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header onMessages={() => router.replace('/messages' as Href)} />

        <View style={styles.greetingRow}>
          <View style={styles.greetingCopy}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.patientName}>{sharedPatient?.name.split(' ')[0] ?? 'Patient'}</Text>
            <Text style={styles.greetingSubtitle}>{backendConnected ? 'Connected to your care team' : 'Connect your care team to see your record'}</Text>
          </View>
          <View style={styles.greetingBubble}>
            <DoctorAvatar size={58} />
            <View style={styles.bubbleCopy}>
              <Text style={styles.bubbleTitle}>Taking care</Text>
              <Text style={styles.bubbleTitle}>together</Text>
              <CareLoopIcon name="heart" size={16} />
            </View>
          </View>
        </View>

        {confirmationMessage ? (
          <View accessibilityLabel={confirmationMessage} accessibilityRole="alert" style={styles.confirmationBanner}>
            <CareLoopIcon color={C.green} name="check" size={19} />
            <Text style={styles.confirmationText}>{confirmationMessage}</Text>
          </View>
        ) : null}

        {appointment.status !== 'not-scheduled' && !(appointment.status === 'confirmed' && sharedPatient?.response === 'Confirmed') ? <CareLoopCard style={styles.nextStepCard}>
          <View style={styles.nextStepHeader}>
            <View>
              <Text style={styles.eyebrow}>YOUR NEXT STEP</Text>
              <Text style={styles.nextStepTitle}>Follow-up visit</Text>
            </View>
            <View style={styles.calendarIllustration}>
              <CareLoopIcon name="calendar" size={39} />
              <View style={styles.calendarHeart}>
                <CareLoopIcon color="#FFFFFF" name="heart" size={17} />
              </View>
            </View>
          </View>

          <DetailLine icon="calendar" title={appointment.date} detail={appointment.weekday} />
          <DetailLine icon="clock" title={appointment.time} detail="Please arrive a few minutes early" />

          <View style={styles.doctorLine}>
            <DoctorAvatar />
            <View style={styles.detailCopy}>
              <Text style={styles.doctorName}>{sharedPatient?.doctor ?? 'Your care team'}</Text>
              <Text style={styles.detailText}>{sharedPatient?.department ?? 'Care coordination'}</Text>
            </View>
            {backendConnected ? <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected</Text>
            </View> : null}
          </View>

          <View style={styles.sharedAction}>
            <CareLoopIcon name="heart" size={18} />
            <View style={styles.detailCopy}>
              <Text style={styles.sharedActionEyebrow}>CARE TEAM UPDATE</Text>
              <Text style={styles.sharedActionText}>{sharedPatient?.nextAction ?? 'Your care team’s next step will appear here.'}</Text>
            </View>
          </View>

          <Pressable accessibilityLabel="Confirm attendance for follow-up appointment" accessibilityRole="button" disabled={isSavingConfirmation || !backendConnected || !activePatientId} onPress={() => void confirmAttendance()} style={[styles.primaryAction, (isSavingConfirmation || !backendConnected || !activePatientId) && styles.disabledAction]}>
            <CareLoopIcon color="#FFFFFF" name="calendar" size={19} />
            <Text style={styles.primaryActionText}>{isSavingConfirmation ? 'Saving…' : 'I’ll attend'}</Text>
            <CareLoopIcon color="#FFFFFF" name="chevron" size={18} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setIsRescheduleVisible(true)} style={styles.secondaryAction}>
            <CareLoopIcon name="calendar" size={19} />
            <Text style={styles.secondaryActionText}>Request reschedule</Text>
          </Pressable>
        </CareLoopCard> : null}

        <Pressable accessibilityRole="button" onPress={() => router.replace('/journey')}>
          <CareLoopCard style={styles.journeyCard}>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.cardTitle}>Your appointments</Text>
                <Text style={styles.cardSubtitle}>View appointments recorded by your care team.</Text>
              </View>
              <CareLoopIcon name="chevron" size={19} color={C.secondary} />
            </View>
          </CareLoopCard>
        </Pressable>

        {sharedPatient?.doctor && sharedPatient.doctor !== 'Care team' ? <Pressable accessibilityRole="button" onPress={() => router.push('/doctor')}>
          <CareLoopCard style={styles.doctorCard}>
            <View style={styles.detailIcon}>
              <CareLoopIcon name="heart" size={21} />
            </View>
            <DoctorAvatar size={44} />
            <View style={styles.doctorCardCopy}>
              <Text style={styles.sectionEyebrow}>YOUR DOCTOR</Text>
              <Text style={styles.doctorCardName}>{sharedPatient.doctor}</Text>
              <Text style={styles.detailText}>{sharedPatient.department}</Text>
            </View>
            {backendConnected ? <View style={styles.doctorConnected}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected</Text>
            </View> : null}
          </CareLoopCard>
        </Pressable> : null}

        {appointment.status !== 'not-scheduled' ? <Pressable accessibilityRole="button" onPress={() => router.replace('/alerts')}>
          <CareLoopCard style={styles.reminderCard}>
            <View style={styles.reminderIcon}>
              <CareLoopIcon name="reminder" size={22} />
            </View>
            <View style={styles.reminderCopy}>
              <Text style={styles.reminderTitle}>Reminder</Text>
              <Text style={styles.detailText}>Follow-up visit · {appointment.time}</Text>
            </View>
            <CareLoopIcon name="chevron" size={18} color={C.secondary} />
          </CareLoopCard>
        </Pressable> : null}
      </ScrollView>

      <RescheduleModal
        key={`${appointment.status}-${appointment.date}-${appointment.time}-${isRescheduleVisible ? 'open' : 'closed'}`}
        initialAppointment={appointment}
        onCancel={() => setIsRescheduleVisible(false)}
        onSubmit={submitReschedule}
        visible={isRescheduleVisible}
      />
    </PatientAppFrame>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 9, maxWidth: 560, paddingBottom: 12, paddingHorizontal: 16, paddingTop: 3, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  notificationButton: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#DDEFFA', borderRadius: 23, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  notificationDot: { backgroundColor: C.red, borderColor: C.surface, borderRadius: 5, borderWidth: 1.5, height: 10, position: 'absolute', right: 9, top: 8, width: 10 },
  greetingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0, minHeight: 74 },
  greetingCopy: { flex: 1 },
  greeting: { color: C.secondary, fontSize: 15, lineHeight: 19 },
  patientName: { color: C.navyDeep, fontSize: 28, fontWeight: '800', letterSpacing: -0.7, lineHeight: 32 },
  greetingSubtitle: { color: C.secondary, fontSize: 13, lineHeight: 18, marginTop: 1 },
  greetingBubble: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'flex-end', maxWidth: '49%' },
  doctorAvatar: { backgroundColor: C.surfaceBlue, borderColor: '#DDEBF7', borderRadius: 40, borderWidth: 1, resizeMode: 'cover' },
  bubbleCopy: { alignItems: 'flex-start', backgroundColor: C.surfaceBlue, borderRadius: 15, paddingHorizontal: 8, paddingVertical: 6 },
  bubbleTitle: { color: C.navy, fontSize: 10, lineHeight: 13 },
  confirmationBanner: { alignItems: 'center', backgroundColor: C.greenSurface, borderColor: '#A5E6CF', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  confirmationText: { color: '#087A58', flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  nextStepCard: { overflow: 'hidden', padding: 12 },
  nextStepHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  eyebrow: { color: C.blue, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  nextStepTitle: { color: C.navyDeep, fontSize: 22, fontWeight: '800', letterSpacing: -0.4, lineHeight: 27, marginTop: 2 },
  calendarIllustration: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#CDE9FA', borderRadius: 25, borderWidth: 1, height: 55, justifyContent: 'center', width: 55 },
  calendarHeart: { alignItems: 'center', backgroundColor: C.blue, borderColor: C.surface, borderRadius: 13, borderWidth: 2, bottom: -4, height: 25, justifyContent: 'center', position: 'absolute', right: -5, width: 25 },
  detailLine: { alignItems: 'center', flexDirection: 'row', gap: 9, marginTop: 6 },
  detailIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 19, height: 37, justifyContent: 'center', width: 37 },
  detailCopy: { flex: 1, minWidth: 0 },
  detailTitle: { color: C.navy, fontSize: 15, fontWeight: '700', lineHeight: 19 },
  detailText: { color: C.secondary, fontSize: 12, lineHeight: 16, marginTop: 1 },
  doctorLine: { alignItems: 'center', borderTopColor: '#EEF4F9', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 8, marginTop: 8, paddingTop: 8 },
  sharedAction: { alignItems: 'center', backgroundColor: '#F1F7FF', borderRadius: 12, flexDirection: 'row', gap: 9, marginTop: 8, paddingHorizontal: 10, paddingVertical: 9 },
  sharedActionEyebrow: { color: C.blue, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  sharedActionText: { color: C.navy, fontSize: 12, fontWeight: '700', lineHeight: 16, marginTop: 2 },
  doctorName: { color: C.navy, fontSize: 14, fontWeight: '700', lineHeight: 18 },
  connectedBadge: { alignItems: 'center', backgroundColor: C.greenSurface, borderRadius: 14, flexDirection: 'row', gap: 4, paddingHorizontal: 7, paddingVertical: 5 },
  connectedDot: { backgroundColor: C.green, borderRadius: 5, height: 8, width: 8 },
  connectedText: { color: C.green, fontSize: 10, fontWeight: '700' },
  primaryAction: { alignItems: 'center', backgroundColor: C.blue, borderRadius: 14, flexDirection: 'row', gap: 9, justifyContent: 'center', marginTop: 10, minHeight: 44, paddingHorizontal: 12 },
  disabledAction: { opacity: 0.55 },
  primaryActionText: { color: C.surface, flex: 1, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  secondaryAction: { alignItems: 'center', backgroundColor: C.surface, borderColor: '#8FC8F6', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 7, minHeight: 41 },
  secondaryActionText: { color: C.blue, fontSize: 14, fontWeight: '700' },
  journeyCard: { paddingHorizontal: 13, paddingVertical: 10 },
  sectionHeadingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  cardSubtitle: { color: C.secondary, fontSize: 11, lineHeight: 15, marginTop: 1 },
  progressTrack: { backgroundColor: '#DCEAF5', borderRadius: 3, height: 3, left: '16.6667%', position: 'absolute', right: '16.6667%', top: 11.5 },
  progressTrackComplete: { backgroundColor: C.green, borderRadius: 3, height: '100%', width: '50%' },
  progressNodes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11, position: 'relative' },
  progressNode: { alignItems: 'center', flex: 1, paddingHorizontal: 2 },
  progressDot: { alignItems: 'center', backgroundColor: '#F1F5F8', borderColor: '#D3E1EC', borderRadius: 13, borderWidth: 1.5, height: 26, justifyContent: 'center', marginBottom: 4, width: 26 },
  progressDotComplete: { backgroundColor: C.green, borderColor: C.green },
  progressDotCurrent: { backgroundColor: C.blue, borderColor: C.blue },
  progressLabel: { color: C.navy, fontSize: 11, fontWeight: '700', lineHeight: 14 },
  progressLabelCurrent: { color: C.blue },
  progressDate: { color: C.secondary, fontSize: 9, lineHeight: 12, marginTop: 1, textAlign: 'center' },
  doctorCard: { alignItems: 'center', flexDirection: 'row', gap: 8, padding: 10 },
  sectionEyebrow: { color: C.secondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  doctorCardCopy: { flex: 1 },
  doctorCardName: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 18, marginTop: 1 },
  doctorConnected: { alignItems: 'center', backgroundColor: C.greenSurface, borderRadius: 14, flexDirection: 'row', gap: 4, paddingHorizontal: 7, paddingVertical: 5 },
  reminderCard: { alignItems: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 11, paddingVertical: 9 },
  reminderIcon: { alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: C.navy, fontSize: 14, fontWeight: '800', lineHeight: 18 },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(8, 55, 110, 0.3)', flex: 1, justifyContent: 'center', padding: 18 },
  modalCard: { backgroundColor: C.surface, borderColor: C.line, borderRadius: 26, borderWidth: 1, elevation: 16, maxWidth: 420, padding: 20, shadowColor: C.navy, shadowOffset: { height: 12, width: 0 }, shadowOpacity: 0.18, shadowRadius: 24, width: '100%' },
  modalHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 15 },
  modalIcon: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 23, height: 52, justifyContent: 'center', width: 52 },
  modalHeaderCopy: { flex: 1 },
  modalEyebrow: { color: C.blue, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  modalTitle: { color: C.navyDeep, fontSize: 20, fontWeight: '800', lineHeight: 26, marginTop: 2 },
  modalSubtitle: { color: C.secondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  fieldLabel: { color: C.navy, fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 8 },
  choiceRow: { flexDirection: 'row', gap: 7 },
  choice: { alignItems: 'center', backgroundColor: C.canvas, borderColor: '#D5E6F3', borderRadius: 13, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 52, paddingHorizontal: 2 },
  choiceSelected: { backgroundColor: C.blue, borderColor: C.blue },
  choiceDate: { color: C.navy, fontSize: 12, fontWeight: '800' },
  choiceWeekday: { color: C.secondary, fontSize: 10, marginTop: 2 },
  choiceTextSelected: { color: C.surface },
  timeChoice: { alignItems: 'center', backgroundColor: C.canvas, borderColor: '#D5E6F3', borderRadius: 13, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 43 },
  timeText: { color: C.navy, fontSize: 12, fontWeight: '800' },
  summaryPill: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderColor: '#D2E9F8', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, marginTop: 15, paddingHorizontal: 11, paddingVertical: 10 },
  summaryText: { color: C.navy, flex: 1, fontSize: 12, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 9, marginTop: 15 },
  cancelButton: { alignItems: 'center', backgroundColor: C.canvas, borderColor: '#D5E6F3', borderRadius: 14, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 47 },
  cancelText: { color: C.navy, fontSize: 14, fontWeight: '800' },
  submitButton: { alignItems: 'center', backgroundColor: C.blue, borderRadius: 14, flex: 1.4, justifyContent: 'center', minHeight: 47 },
  submitText: { color: C.surface, fontSize: 14, fontWeight: '800' },
});
