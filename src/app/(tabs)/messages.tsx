import { useEffect, useRef, useState, type JSX } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CareLoopCard, CareLoopColors as C, CareLoopIcon, PatientAppFrame } from '@/components/careloop-ui';
import { getActivePatientId, getPatientAppMessages, getPatientAppPatient, getPatientReportUrl, sendPatientAppMessage, type PatientAppAttachment, type PatientAppMessage, type PatientAppPatient } from '@/lib/patient-backend';
import { loadLinkedPatientRecord } from '@/lib/patient';


export default function MessagesScreen(): JSX.Element {
  const [messages, setMessages] = useState<PatientAppMessage[]>([]);
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState<PatientAppPatient | null>(null);
  const [draft, setDraft] = useState('');
  const [pendingImage, setPendingImage] = useState<PatientAppAttachment | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportPath, setReportPath] = useState<string | null>(null);
  const [reportName, setReportName] = useState('');
  const [sending, setSending] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    const refresh = async (): Promise<void> => {
      try {
        const selectedPatientId = await getActivePatientId();
        const [latest, selectedPatient, record] = await Promise.all([getPatientAppMessages(selectedPatientId), getPatientAppPatient(selectedPatientId), loadLinkedPatientRecord()]);
        const report = record?.reports[0] ?? null;
        const selectedReportUrl = report ? await getPatientReportUrl(report.file_path) : null;
        if (active) { setPatientId(selectedPatientId); setMessages(latest); setPatient(selectedPatient); setReportUrl(selectedReportUrl); setReportPath(report?.file_path ?? null); setReportName(report?.file_name ?? ''); }
      } catch (error) { if (active) Alert.alert('Care team unavailable', error instanceof Error ? error.message : 'Sign in and connect your care team to load messages.'); }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const send = async (text = draft.trim(), attachment = pendingImage): Promise<void> => {
    if ((!text && !attachment) || sending) return;
    setSending(true);
    try {
      const saved = await sendPatientAppMessage({ patientId, sender: 'patient', text, ...(attachment ? { attachment } : {}) });
      setMessages((current) => current.some((message) => message.id === saved.id) ? current : [...current, saved]);
      setDraft('');
      setPendingImage(null);
      requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
    } catch (error) { Alert.alert('Message not sent', error instanceof Error ? error.message : 'Check your connection and try again.'); }
    finally { setSending(false); }
  };

  const pickImage = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Photo access needed', 'Allow photo library access to attach an image.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.55, allowsEditing: true });
    if (result.canceled || !result.assets[0]?.base64) return;
    const image = result.assets[0];
    const mimeType = image.mimeType ?? 'image/jpeg';
    const base64 = image.base64;
    if (!base64) return;
    if (base64.length > 11_200_000) { Alert.alert('Image too large', 'Choose an image no larger than 8 MB.'); return; }
    setPendingImage({ kind: 'image', name: image.fileName ?? 'CareLoop image', mimeType, data: `data:${mimeType};base64,${base64}` });
  };

  return (
    <PatientAppFrame activeTab="messages" backgroundColor={C.canvas}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.doctorAvatar}><CareLoopIcon name="doctor" size={21} /></View>
          <View style={styles.headerCopy}><Text style={styles.title}>{patient?.doctor ?? 'Care team'}</Text><Text style={styles.subtitle}>{patient?.department ?? 'Care coordination'} · {patient?.name ?? 'Loading patient'}</Text></View>
          <Pressable accessibilityLabel="Call doctor" onPress={() => void Linking.openURL('tel:+919876543210')} style={styles.headerAction}><CareLoopIcon name="phone" size={19} /></Pressable>
          <Pressable accessibilityLabel="Video call doctor" onPress={() => Alert.alert('Video visit', 'Your care team will help arrange a video visit.')} style={styles.headerAction}><CareLoopIcon name="video" size={19} /></Pressable>
          {reportUrl ? <Pressable accessibilityLabel={`Open ${patient?.name ?? 'patient'} report`} onPress={() => void Linking.openURL(reportUrl)} style={styles.headerAction}><CareLoopIcon name="document" size={18} /></Pressable> : null}
        </View>
        <View style={styles.conversationLabel}><Text style={styles.dateLabel}>CARE TEAM CONVERSATION</Text><Text style={styles.encryptionLabel}>Private care-team conversation</Text></View>
        <ScrollView ref={scroll} contentContainerStyle={styles.messageList} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })} showsVerticalScrollIndicator={false}>
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
          {messages.length === 0 ? <CareLoopCard style={styles.empty}><CareLoopIcon name="message" size={24} /><Text style={styles.emptyTitle}>Start a conversation</Text><Text style={styles.emptyCopy}>Send a message to your care team.</Text></CareLoopCard> : null}
        </ScrollView>
        {pendingImage ? <View style={styles.pendingImage}><Image source={{ uri: pendingImage.data }} style={styles.pendingPreview} /><Text style={styles.pendingName}>{pendingImage.name}</Text><Pressable accessibilityLabel="Remove image" onPress={() => setPendingImage(null)}><Text style={styles.removeImage}>×</Text></Pressable></View> : null}
        <View style={styles.composer}>
          <Pressable accessibilityLabel="Attach an image" onPress={() => void pickImage()} style={styles.attachButton}><CareLoopIcon name="photo" size={20} /></Pressable>
          {reportUrl && reportPath ? <Pressable accessibilityLabel={`Share ${reportName}`} onPress={() => void send(`Shared report: ${reportName}`, { kind: 'report', name: reportName, mimeType: 'application/pdf', data: reportUrl, filePath: reportPath })} style={styles.attachButton}><CareLoopIcon name="document" size={19} /></Pressable> : null}
          <TextInput accessibilityLabel="Write a message" multiline maxLength={1200} onChangeText={setDraft} placeholder="Write a message…" placeholderTextColor={C.muted} style={styles.input} value={draft} />
          <Pressable accessibilityLabel="Send message" disabled={sending || (!draft.trim() && !pendingImage)} onPress={() => void send()} style={[styles.sendButton, (sending || (!draft.trim() && !pendingImage)) && styles.sendDisabled]}><CareLoopIcon color="#FFFFFF" name="send" size={18} /></Pressable>
        </View>
      </View>
    </PatientAppFrame>
  );
}

function MessageBubble({ message }: { message: PatientAppMessage }): JSX.Element {
  const mine = message.sender === 'patient';
  const openReport = async (): Promise<void> => {
    const path = message.attachment?.filePath;
    const url = path ? await getPatientReportUrl(path) : message.attachment?.data;
    if (url) await Linking.openURL(url);
  };
  return <View style={[styles.messageRow, mine && styles.messageRowMine]}><View style={[styles.bubble, mine ? styles.patientBubble : styles.teamBubble]}>
    {message.attachment?.kind === 'image' ? <Image source={{ uri: message.attachment.data }} style={styles.messageImage} /> : null}
    {message.attachment?.kind === 'report' ? <Pressable accessibilityRole="link" onPress={() => void openReport()} style={styles.reportAttachment}><CareLoopIcon name="document" size={20} /><View style={styles.reportCopy}><Text style={styles.reportTitle}>Care coordination report</Text><Text style={styles.reportName}>{message.attachment.name}</Text></View><CareLoopIcon name="chevron" size={16} /></Pressable> : null}
    {message.text ? <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.text}</Text> : null}
    <Text style={[styles.timestamp, mine && styles.timestampMine]}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
  </View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignSelf: 'center', maxWidth: 560, width: '100%', backgroundColor: C.surface },
  header: { alignItems: 'center', borderBottomColor: C.line, borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 11 },
  doctorAvatar: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 23, height: 44, justifyContent: 'center', width: 44 },
  headerCopy: { flex: 1 }, title: { color: C.navyDeep, fontSize: 15, fontWeight: '800' }, subtitle: { color: C.secondary, fontSize: 10, marginTop: 3 },
  headerAction: { alignItems: 'center', backgroundColor: C.surfaceBlue, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  conversationLabel: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 11 }, dateLabel: { color: C.blue, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, encryptionLabel: { color: C.muted, fontSize: 9 },
  messageList: { flexGrow: 1, gap: 10, padding: 16, paddingBottom: 22 }, messageRow: { alignItems: 'flex-start', flexDirection: 'row' }, messageRowMine: { justifyContent: 'flex-end' },
  bubble: { borderRadius: 18, maxWidth: '84%', padding: 11 }, teamBubble: { backgroundColor: '#F0F5FA', borderBottomLeftRadius: 5 }, patientBubble: { backgroundColor: C.blue, borderBottomRightRadius: 5 },
  messageText: { color: C.navy, fontSize: 13, lineHeight: 19 }, messageTextMine: { color: '#FFFFFF' }, timestamp: { color: C.secondary, fontSize: 9, marginTop: 5, textAlign: 'right' }, timestampMine: { color: '#D8EAFE' },
  messageImage: { borderRadius: 12, height: 180, marginBottom: 4, width: 220 }, reportAttachment: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', gap: 9, padding: 10, width: 250 }, reportCopy: { flex: 1 }, reportTitle: { color: C.navy, fontSize: 11, fontWeight: '800' }, reportName: { color: C.secondary, fontSize: 9, marginTop: 3 },
  empty: { alignItems: 'center', gap: 8, marginTop: 40, padding: 22 }, emptyTitle: { color: C.navy, fontSize: 15, fontWeight: '800' }, emptyCopy: { color: C.secondary, fontSize: 12 },
  pendingImage: { alignItems: 'center', backgroundColor: C.canvas, flexDirection: 'row', gap: 9, padding: 8 }, pendingPreview: { borderRadius: 8, height: 44, width: 44 }, pendingName: { color: C.navy, flex: 1, fontSize: 11 }, removeImage: { color: C.secondary, fontSize: 24, paddingHorizontal: 7 },
  composer: { alignItems: 'flex-end', borderTopColor: C.line, borderTopWidth: 1, flexDirection: 'row', gap: 6, padding: 10 }, attachButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 34 }, input: { backgroundColor: C.canvas, borderColor: C.line, borderRadius: 20, borderWidth: 1, color: C.navy, flex: 1, fontSize: 13, maxHeight: 96, minHeight: 40, paddingHorizontal: 13, paddingVertical: 9 }, sendButton: { alignItems: 'center', backgroundColor: C.blue, borderRadius: 21, height: 40, justifyContent: 'center', width: 40 }, sendDisabled: { opacity: 0.45 },
});
