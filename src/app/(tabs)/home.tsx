import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  DEFAULT_APPOINTMENT,
  isAppointmentChanged,
  loadAppointment,
  RESCHEDULE_DATES,
  RESCHEDULE_TIMES,
  saveAppointment,
  type AppointmentSchedule,
} from '@/lib/appointment';

type ActionHotspotProps = {
  accessibilityLabel: string;
  onPress: () => void;
  style: object;
};

function ActionHotspot({ accessibilityLabel, onPress, style }: ActionHotspotProps): JSX.Element {
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={[styles.hotspot, style]} />;
}

function showMessage(title: string, message: string): void {
  Alert.alert(title, message);
}

function CalendarGlyph(): JSX.Element {
  return (
    <View style={styles.calendarGlyph}>
      <View style={styles.calendarRingLeft} />
      <View style={styles.calendarRingRight} />
      <View style={styles.calendarLine} />
      <View style={styles.calendarDotRow}>
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
      </View>
    </View>
  );
}

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
  const [selectedDate, setSelectedDate] = useState(initialAppointment.date);
  const [selectedTime, setSelectedTime] = useState(initialAppointment.time);
  const [isSaving, setIsSaving] = useState(false);

  const submitRequest = async (): Promise<void> => {
    const selectedDateOption = RESCHEDULE_DATES.find((option) => option.date === selectedDate);
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
        <View style={styles.glassCard}>
          <View style={styles.modalHeader}>
            <View style={styles.calendarBubble}>
              <CalendarGlyph />
            </View>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalEyebrow}>FOLLOW-UP VISIT</Text>
              <Text style={styles.modalTitle}>Request reschedule</Text>
              <Text style={styles.modalSubtitle}>Choose a time that works for you.</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Select a date</Text>
          <View style={styles.choiceRow}>
            {RESCHEDULE_DATES.map((option) => {
              const selected = option.date === selectedDate;
              return (
                <Pressable
                  accessibilityLabel={`Select ${option.date}`}
                  accessibilityRole="button"
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
            <CalendarGlyph />
            <Text style={styles.summaryText}>{selectedDate} · {selectedTime}</Text>
          </View>

          <View style={styles.modalActions}>
            <Pressable accessibilityLabel="Cancel reschedule" accessibilityRole="button" disabled={isSaving} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityLabel="Send reschedule request" accessibilityRole="button" disabled={isSaving} onPress={() => void submitRequest()} style={styles.submitButton}>
              <Text style={styles.submitText}>{isSaving ? 'Sending…' : 'Send request'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function UpdatedAppointmentOverlay({ appointment }: { appointment: AppointmentSchedule }): JSX.Element | null {
  if (!isAppointmentChanged(appointment)) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.updatedAppointmentLayer}>
      <View style={styles.updatedDateMask}>
        <Text style={styles.updatedDate}>{appointment.date}</Text>
        <Text style={styles.updatedWeekday}>{appointment.weekday}</Text>
      </View>
      <View style={styles.updatedTimeMask}>
        <Text style={styles.updatedTime}>{appointment.time}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isRescheduleVisible, setIsRescheduleVisible] = useState(false);

  useEffect(() => {
    let active = true;
    void loadAppointment().then((loadedAppointment) => {
      if (active) {
        setAppointment(loadedAppointment);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const submitReschedule = async (nextAppointment: AppointmentSchedule): Promise<void> => {
    await saveAppointment(nextAppointment);
    setAppointment(nextAppointment);
    setIsRescheduleVisible(false);
    Alert.alert('Request sent', 'Your care team will confirm the new appointment time.');
  };

  const confirmAttendance = (): void => {
    const confirmedAppointment: AppointmentSchedule = { ...appointment, status: 'confirmed' };
    const message = `Appointment confirmed — ${confirmedAppointment.date} at ${confirmedAppointment.time}.`;
    setAppointment(confirmedAppointment);
    setConfirmationMessage(message);
    Alert.alert('Appointment confirmed', message);
    void saveAppointment(confirmedAppointment).catch(() => {
      setAppointment(appointment);
      setConfirmationMessage(null);
      Alert.alert('Confirmation not saved', 'Please try again when you have a connection.');
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <Image
        accessibilityLabel="CareLoop home dashboard"
        contentFit="fill"
        source={require('@/assets/images/careloop/home-dashboard-app.png')}
        style={StyleSheet.absoluteFill}
      />
      <UpdatedAppointmentOverlay appointment={appointment} />
      {confirmationMessage ? (
        <View accessible accessibilityLabel={confirmationMessage} style={styles.confirmationBanner}>
          <Text style={styles.confirmationText}>{confirmationMessage}</Text>
        </View>
      ) : null}

      <ActionHotspot
        accessibilityLabel="Attend follow-up appointment"
        onPress={confirmAttendance}
        style={styles.attendHotspot}
      />
      <ActionHotspot accessibilityLabel="Request reschedule" onPress={() => setIsRescheduleVisible(true)} style={styles.rescheduleHotspot} />
      <ActionHotspot accessibilityLabel="Open care journey" onPress={() => router.replace('/journey')} style={styles.journeyHotspot} />
      <ActionHotspot accessibilityLabel="Open doctor connection" onPress={() => showMessage('Your doctor', 'Dr. K. Sathwik is connected.')} style={styles.doctorHotspot} />
      <ActionHotspot accessibilityLabel="Open reminder" onPress={() => showMessage('Reminder', 'Tomorrow at 10:30 AM.')} style={styles.reminderHotspot} />
      <View style={styles.bottomNav}>
        <ActionHotspot accessibilityLabel="Home" onPress={() => undefined} style={styles.navHotspot} />
        <ActionHotspot accessibilityLabel="Journey" onPress={() => router.replace('/journey')} style={styles.navHotspot} />
        <ActionHotspot accessibilityLabel="Alerts" onPress={() => router.replace('/alerts')} style={styles.navHotspot} />
        <ActionHotspot accessibilityLabel="More" onPress={() => showMessage('More', 'More CareLoop options.')} style={styles.navHotspot} />
      </View>
      <RescheduleModal
        key={`${appointment.status}-${appointment.date}-${appointment.time}-${isRescheduleVisible ? 'open' : 'closed'}`}
        initialAppointment={appointment}
        onCancel={() => setIsRescheduleVisible(false)}
        onSubmit={submitReschedule}
        visible={isRescheduleVisible}
      />
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
  confirmationBanner: { alignItems: 'center', backgroundColor: '#E8FAF3', borderColor: '#A5E6CF', borderRadius: 16, borderWidth: 1, left: '8%', paddingHorizontal: 14, paddingVertical: 10, position: 'absolute', right: '8%', top: '41.5%', zIndex: 4 },
  confirmationText: { color: '#087A58', fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '10%', flexDirection: 'row' },
  navHotspot: { position: 'relative', flex: 1, height: '100%' },
  updatedAppointmentLayer: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 1 },
  updatedDateMask: { backgroundColor: '#F7FCFF', borderRadius: 10, left: '13%', paddingHorizontal: 4, position: 'absolute', top: '31.2%', width: '68%' },
  updatedDate: { color: '#0A376E', fontSize: 17, fontWeight: '700', lineHeight: 23 },
  updatedWeekday: { color: '#6580A3', fontSize: 15, lineHeight: 20 },
  updatedTimeMask: { backgroundColor: '#F7FCFF', borderRadius: 10, left: '13%', paddingHorizontal: 4, position: 'absolute', top: '36.7%', width: '48%' },
  updatedTime: { color: '#0A376E', fontSize: 17, fontWeight: '700', lineHeight: 23 },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(8, 55, 110, 0.24)', flex: 1, justifyContent: 'center', paddingHorizontal: 18 },
  glassCard: { backgroundColor: '#FFFFFF', borderColor: '#E2ECF6', borderRadius: 30, borderWidth: 1, elevation: 18, maxWidth: 390, overflow: 'hidden', padding: 22, shadowColor: '#0A376E', shadowOffset: { height: 14, width: 0 }, shadowOpacity: 0.2, shadowRadius: 28, width: '100%' },
  modalHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: 20 },
  calendarBubble: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D5E9F8', borderRadius: 24, borderWidth: 1, height: 68, justifyContent: 'center', marginRight: 14, width: 68 },
  modalHeaderCopy: { flex: 1 },
  modalEyebrow: { color: '#087EF5', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  modalTitle: { color: '#072B66', fontSize: 23, fontWeight: '800', marginTop: 3 },
  modalSubtitle: { color: '#6580A3', fontSize: 14, lineHeight: 20, marginTop: 3 },
  fieldLabel: { color: '#0A376E', fontSize: 14, fontWeight: '800', marginBottom: 9, marginTop: 8 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { alignItems: 'center', backgroundColor: '#F4F9FD', borderColor: '#CFE7F8', borderRadius: 16, borderWidth: 1, flex: 1, minHeight: 54, justifyContent: 'center', paddingHorizontal: 4 },
  choiceSelected: { backgroundColor: '#087EF5', borderColor: '#087EF5' },
  choiceDate: { color: '#0A376E', fontSize: 13, fontWeight: '800' },
  choiceWeekday: { color: '#6580A3', fontSize: 11, marginTop: 2 },
  choiceTextSelected: { color: '#FFFFFF' },
  timeChoice: { alignItems: 'center', backgroundColor: '#F4F9FD', borderColor: '#CFE7F8', borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 46 },
  timeText: { color: '#0A376E', fontSize: 13, fontWeight: '800' },
  summaryPill: { alignItems: 'center', backgroundColor: '#E8F5FF', borderColor: '#CFE7F8', borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginTop: 18, paddingHorizontal: 12, paddingVertical: 10 },
  summaryText: { color: '#0A376E', flex: 1, fontSize: 13, fontWeight: '700', marginLeft: 9 },
  calendarGlyph: { borderColor: '#087EF5', borderRadius: 5, borderWidth: 2, height: 22, position: 'relative', width: 24 },
  calendarRingLeft: { backgroundColor: '#087EF5', borderRadius: 2, height: 7, left: 4, position: 'absolute', top: -5, width: 3 },
  calendarRingRight: { backgroundColor: '#087EF5', borderRadius: 2, height: 7, position: 'absolute', right: 4, top: -5, width: 3 },
  calendarLine: { backgroundColor: '#087EF5', height: 2, left: 0, position: 'absolute', right: 0, top: 5 },
  calendarDotRow: { alignItems: 'center', flexDirection: 'row', gap: 3, left: 4, position: 'absolute', top: 10 },
  calendarDot: { backgroundColor: '#087EF5', borderRadius: 1, height: 3, width: 3 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelButton: { alignItems: 'center', backgroundColor: '#F4F9FD', borderColor: '#CFE3F2', borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 50 },
  cancelText: { color: '#0A376E', fontSize: 15, fontWeight: '800' },
  submitButton: { alignItems: 'center', backgroundColor: '#087EF5', borderRadius: 16, flex: 1.45, justifyContent: 'center', minHeight: 50 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
