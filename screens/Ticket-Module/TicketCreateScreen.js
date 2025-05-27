import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { generateRecurringEvents } from '../../utils/generateRecurringEvents';
import QRCode from 'react-native-qrcode-svg';
import { v4 as uuidv4 } from 'uuid';

const timeOptions = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? '00' : '30';
  const formattedHour = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${formattedHour}:${minute} ${ampm}`;
});

const frequencyOptions = ['One time', 'Weekly', 'Bi-weekly', 'Same Weekday', 'Same Day of Month'];

export default function TicketCreateScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [frequency, setFrequency] = useState('One time');
  const [eventLink, setEventLink] = useState('');
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('');
  const [ticketType, setTicketType] = useState('General');
  const [ticketId, setTicketId] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (route.params?.ticketSource === 'event-upload') {
      setTitle(route.params.eventTitle || '');
      setStartDate(route.params.eventDate ? new Date(route.params.eventDate) : new Date());
      setStartTime(route.params.startTime || '');
    }
  }, [route.params]);

  const handleCreateTicket = async () => {
    try {
      const id = uuidv4();
      setTicketId(id);

      const { error } = await supabase.from('tickets').insert([
        {
          id,
          event_name: title,
          ticket_type: ticketType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          start_time: startTime,
          end_time: endTime || null,
          frequency,
          event_link: eventLink || null,
          location: location || null,
          stage: stage || null,
          used: false,
        },
      ]);

      if (error) {
        console.error('Insert error:', error);
        Alert.alert('Error creating ticket');
        return;
      }

      Alert.alert('✅ Ticket Created', `Ticket ID: ${id}`);
      navigation.navigate('TicketListScreen');
    } catch (err) {
      console.error(err);
      Alert.alert('Something went wrong');
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePreviewDates = () => {
    const generated = generateRecurringEvents(startDate, endDate, frequency);
    Alert.alert('Generated Dates', generated.map(d => new Date(d).toDateString()).join('\n'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Ticket</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event name" />

        <Text style={styles.label}>Start Date</Text>
        <DateTimePicker value={startDate} mode="date" display="default" onChange={(event, selectedDate) => selectedDate && setStartDate(selectedDate)} />

        <Text style={styles.label}>End Date</Text>
        <DateTimePicker value={endDate} mode="date" display="default" onChange={(event, selectedDate) => selectedDate && setEndDate(selectedDate)} />

        <Text style={styles.label}>Start Time</Text>
        <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="e.g. 6:00 PM" />

        <Text style={styles.label}>End Time (Optional)</Text>
        <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="e.g. 9:00 PM" />

        <Text style={styles.label}>Frequency</Text>
        <TextInput style={styles.input} value={frequency} onChangeText={setFrequency} placeholder="One time / Weekly" />

        <TouchableOpacity style={styles.previewButton} onPress={handlePreviewDates}>
          <Text style={styles.previewText}>Preview Dates</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Event Link</Text>
        <TextInput style={styles.input} value={eventLink} onChangeText={setEventLink} placeholder="https://..." />

        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />

        <Text style={styles.label}>Stage (Optional)</Text>
        <TextInput style={styles.input} value={stage} onChangeText={setStage} placeholder="Stage name" />

        <Text style={styles.label}>Ticket Type</Text>
        <TextInput style={styles.input} value={ticketType} onChangeText={setTicketType} placeholder="General / VIP" />

        <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
          <Text style={styles.previewText}>Upload Image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <TouchableOpacity style={styles.button} onPress={handleCreateTicket}>
          <Text style={styles.buttonText}>Create Ticket</Text>
        </TouchableOpacity>

        {ticketId && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrLabel}>Generated QR Code</Text>
            <QRCode value={ticketId} size={200} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerText: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#333' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#008080', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  previewButton: { backgroundColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  previewText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  imageButton: { backgroundColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover', borderRadius: 8, marginBottom: 16 },
  qrContainer: { marginTop: 30, alignItems: 'center' },
  qrLabel: { marginBottom: 10, fontSize: 16, fontWeight: 'bold' },
});
