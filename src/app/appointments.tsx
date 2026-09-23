import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { DEFAULT_APPOINTMENT, loadAppointment, type AppointmentSchedule } from '@/lib/appointment';

export default function AppointmentsScreen() {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentSchedule>(DEFAULT_APPOINTMENT);
  useEffect(() => { void loadAppointment().then(setAppointment); }, []);
  return <ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to More" onPress={() => router.replace('/more')}><Text style={styles.back}>‹  More</Text></Pressable>
    <Text style={styles.title}>My Appointments</Text><Text style={styles.subtitle}>View and manage your upcoming care.</Text>
    <View style={styles.card}><Text style={styles.eyebrow}>UPCOMING FOLLOW-UP</Text><Text style={styles.name}>Dr. K. Sathwik</Text><Text style={styles.date}>{appointment.date} · {appointment.time}</Text><Text style={styles.status}>{appointment.status === 'confirmed' ? 'Confirmed' : appointment.status === 'reschedule-requested' ? 'Reschedule requested' : 'Awaiting confirmation'}</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Open alerts" onPress={() => router.replace('/alerts')} style={styles.button}><Text style={styles.buttonText}>View appointment updates</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Open home" onPress={() => router.replace('/home')} style={styles.secondary}><Text style={styles.secondaryText}>Back to home</Text></Pressable>
  </ScrollView>;
}
const styles=StyleSheet.create({content:{backgroundColor:'#F8FBFF',flexGrow:1,padding:28,paddingTop:58},back:{color:'#0A376E',fontSize:17,fontWeight:'600'},title:{color:'#072B66',fontSize:30,fontWeight:'800',marginTop:34},subtitle:{color:'#6580A3',fontSize:16,marginTop:8},card:{backgroundColor:'#FFF',borderColor:'#E2ECF6',borderRadius:24,borderWidth:1,marginTop:28,padding:24},eyebrow:{color:'#087EF5',fontSize:12,fontWeight:'800'},name:{color:'#0A376E',fontSize:21,fontWeight:'800',marginTop:14},date:{color:'#183A6A',fontSize:17,marginTop:10},status:{color:'#00A86B',fontSize:15,fontWeight:'700',marginTop:14},button:{alignItems:'center',backgroundColor:'#087EF5',borderRadius:18,marginTop:24,padding:17},buttonText:{color:'#FFF',fontSize:16,fontWeight:'800'},secondary:{alignItems:'center',borderColor:'#B9D5EE',borderRadius:18,borderWidth:1,marginTop:12,padding:17},secondaryText:{color:'#087EF5',fontSize:16,fontWeight:'800'}});
