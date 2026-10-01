import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Notice, Section, StaffShell, StatCard, STAFF_COLORS } from '@/components/staff-ui';
import { getDashboardSummary, listPatients, type DashboardSummary, type Patient } from '@/lib/staff';

const EMPTY_SUMMARY: DashboardSummary = { patients: 0, appointments: 0, followUpsDue: 0, overdueAppointments: 0, pendingTests: 0, recentUpdates: 0 };

export default function StaffDashboardScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([getDashboardSummary(), listPatients()]).then(([nextSummary, nextPatients]) => {
      setSummary(nextSummary);
      setPatients(nextPatients.slice(0, 6));
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  return (
    <StaffShell title="Dashboard">
      {error ? <Notice error message={error} /> : null}
      <View style={styles.statRow}>
        <StatCard accent="#087EF5" label="Total active patients" value={summary.patients} />
        <StatCard accent="#00B979" label="Appointments today" value={summary.appointments} />
        <StatCard accent="#F29C38" label="Follow-ups due" value={summary.followUpsDue} />
        <StatCard accent="#D94E5D" label="Overdue" value={summary.overdueAppointments} />
        <StatCard accent="#7058D8" label="Reports to review" value={summary.pendingTests} />
      </View>

      <View style={styles.contentGrid}>
        <Section style={styles.gridCard} title="Follow-up priority">
          <View style={styles.miniChart}><View style={[styles.chartBar, { height: 54 }]} /><View style={[styles.chartBar, { height: 40 }]} /><View style={[styles.chartBar, { height: 68 }]} /><View style={[styles.chartBar, { height: 48 }]} /><View style={[styles.chartBar, { height: 31 }]} /><View style={[styles.chartBar, { height: 23 }]} /><View style={[styles.chartBar, { height: 36 }]} /></View>
          <View style={styles.chartLabels}><Text>12 Mar</Text><Text>13 Mar</Text><Text>14 Mar</Text><Text>15 Mar</Text><Text>16 Mar</Text><Text>17 Mar</Text><Text>18 Mar</Text></View>
          <Text style={styles.attentionTitle}>Patients needing attention</Text>
          {patients.slice(0, 3).map((patient, index) => <View key={patient.id} style={styles.attentionRow}><View style={styles.smallAvatar}><Text style={styles.smallAvatarText}>{patient.first_name[0]}{patient.last_name[0]}</Text></View><View style={styles.attentionCopy}><Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text><Text style={styles.patientMeta}>{patient.condition || 'Follow-up review'}</Text></View><Text style={styles.attentionDate}>{index === 0 ? '12 Mar 2025' : index === 1 ? '13 Mar 2025' : '14 Mar 2025'}</Text><Text style={[styles.statusChip, index === 1 ? styles.statusOverdue : styles.statusDue]}>{index === 1 ? 'Overdue' : 'Due soon'}</Text></View>)}
        </Section>
        <Section style={styles.gridCard} title="Today’s appointments">
          <AppointmentPreview time="09:30 AM" name="Anita Reddy" purpose="General consultation" status="Checked in" color="#DDF8EE" />
          <AppointmentPreview time="11:00 AM" name="Rohit Varma" purpose="Follow-up (Hypertension)" status="Scheduled" color="#E8F5FF" />
          <AppointmentPreview time="12:30 PM" name="Farah Khan" purpose="Antenatal check-up" status="Scheduled" color="#EDE9FF" />
        </Section>
      </View>

      <Section title="Recent activity">
        <View style={styles.activityGrid}><ActivityItem title="Report uploaded" detail="CBC report uploaded for S. Ramesh" time="12 Mar 2025, 08:52 IST" /><ActivityItem title="Appointment rescheduled" detail="P. Vani’s appointment moved to 14 Mar" time="12 Mar 2025, 08:20 IST" /><ActivityItem title="Care plan updated" detail="Care plan updated for M. Krishna" time="12 Mar 2025, 07:45 IST" /></View>
      </Section>

      <Section title="Patients needing attention">
        {loading ? <ActivityIndicator color={STAFF_COLORS.blue} /> : patients.length === 0 ? <Text style={styles.empty}>No patients are allocated to your account yet.</Text> : patients.map((patient) => (
          <Pressable key={patient.id} onPress={() => router.push({ pathname: '/staff/patients/[id]', params: { id: patient.id } })} style={styles.patientRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{patient.first_name[0]}{patient.last_name[0]}</Text></View>
            <View style={styles.patientCopy}><Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text><Text style={styles.patientMeta}>{patient.condition || 'No condition recorded'} · {patient.phone || 'No phone'}</Text></View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </Section>
    </StaffShell>
  );
}

function AppointmentPreview({ time, name, purpose, status, color }: { time: string; name: string; purpose: string; status: string; color: string }) {
  return <View style={styles.appointmentRow}><Text style={styles.appointmentTime}>{time}</Text><View style={[styles.smallAvatar, { backgroundColor: color }]}><Text style={styles.smallAvatarText}>{name.split(' ').map((part) => part[0]).join('')}</Text></View><View style={styles.appointmentCopy}><Text style={styles.patientName}>{name}</Text><Text style={styles.patientMeta}>{purpose}</Text></View><Text style={[styles.statusChip, status === 'Checked in' ? styles.statusChecked : styles.statusScheduled]}>{status}</Text></View>;
}

function ActivityItem({ title, detail, time }: { title: string; detail: string; time: string }) {
  return <View style={styles.activityItem}><View style={styles.activityIcon}><Text>▤</Text></View><View style={styles.activityCopy}><Text style={styles.patientName}>{title}</Text><Text style={styles.patientMeta}>{detail}</Text><Text style={styles.activityTime}>{time}</Text></View></View>;
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 24 },
  link: { color: STAFF_COLORS.blue, fontSize: 14, fontWeight: '700' },
  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  gridCard: { flex: 1, minWidth: 430 },
  miniChart: { alignItems: 'flex-end', borderBottomColor: '#DDEAF6', borderBottomWidth: 1, flexDirection: 'row', gap: 18, height: 84, justifyContent: 'center', paddingHorizontal: 10 },
  chartBar: { backgroundColor: '#6DB8F5', borderRadius: 6, width: 22 },
  chartLabels: { color: STAFF_COLORS.muted, flexDirection: 'row', fontSize: 10, justifyContent: 'space-between', marginTop: 8 },
  attentionTitle: { color: STAFF_COLORS.navy, fontSize: 16, fontWeight: '800', marginTop: 22 },
  attentionRow: { alignItems: 'center', borderTopColor: '#EDF2F7', borderTopWidth: 1, flexDirection: 'row', paddingVertical: 11 },
  smallAvatar: { alignItems: 'center', backgroundColor: '#DFF1FF', borderRadius: 20, height: 38, justifyContent: 'center', width: 38 },
  smallAvatarText: { color: STAFF_COLORS.blue, fontSize: 11, fontWeight: '800' },
  attentionCopy: { flex: 1, marginLeft: 10 },
  attentionDate: { color: STAFF_COLORS.navy, fontSize: 12, marginRight: 10 },
  statusChip: { borderRadius: 15, fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  statusDue: { backgroundColor: '#FFF1D7', color: '#B66A00' },
  statusOverdue: { backgroundColor: '#FFE3E7', color: '#CA3F50' },
  statusChecked: { backgroundColor: '#DDF8EE', color: '#0A9F75' },
  statusScheduled: { backgroundColor: '#E8F5FF', color: STAFF_COLORS.blue },
  appointmentRow: { alignItems: 'center', borderTopColor: '#EDF2F7', borderTopWidth: 1, flexDirection: 'row', paddingVertical: 13 },
  appointmentTime: { color: STAFF_COLORS.navy, fontSize: 12, fontWeight: '800', width: 67 },
  appointmentCopy: { flex: 1, marginLeft: 10 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  activityItem: { alignItems: 'flex-start', borderRightColor: '#E6EEF7', borderRightWidth: 1, flex: 1, flexDirection: 'row', minWidth: 240, paddingRight: 15 },
  activityIcon: { alignItems: 'center', backgroundColor: '#E8F5FF', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  activityCopy: { flex: 1, marginLeft: 10 },
  activityTime: { color: '#9AAEC5', fontSize: 11, marginTop: 5 },
  empty: { color: STAFF_COLORS.muted, fontSize: 15 },
  patientRow: { alignItems: 'center', borderBottomColor: '#EDF2F7', borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 14 },
  avatar: { alignItems: 'center', backgroundColor: '#E8F5FF', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  avatarText: { color: STAFF_COLORS.blue, fontWeight: '800' },
  patientCopy: { flex: 1, marginLeft: 14 },
  patientName: { color: STAFF_COLORS.navy, fontSize: 15, fontWeight: '800' },
  patientMeta: { color: STAFF_COLORS.muted, fontSize: 13, marginTop: 4 },
  chevron: { color: STAFF_COLORS.muted, fontSize: 27, fontWeight: '300' },
});
