import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { uploadImageToSupabase } from '../utils/imageUploader';
import { generateRecurringEvents } from '../utils/generateRecurringEvents';

export default function UploadEventsCalendarScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [frequency, setFrequency] = useState('One Time');
  const [showFrequencyOptions, setShowFrequencyOptions] = useState(false);
  const [previewDates, setPreviewDates] = useState([]);
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('');
  const [createTickets, setCreateTickets] = useState(false);

  const frequencyOptions = [
    'One Time',
    'Weekly',
    'Bi-Weekly',
    'Same Day of the Month',
    'Same Weekday of the Month',
    'Select Multiple Dates',
  ];

  const timeOptions = [...Array(30)].map((_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minutes = i % 2 === 0 ? '00' : '30';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hourFormatted = ((hour - 1) % 12 + 1);
    return `${hourFormatted}:${minutes} ${suffix}`;
  });

  const handlePickImage = async () => {
    const url = await uploadImageToSupabase('event-images');
    if (url) setImageUrl(url);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setEventDate(selectedDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const previewGeneratedDates = () => {
    const dates = generateRecurringEvents(
      formatDate(eventDate),
      frequency,
      endDate ? formatDate(endDate) : null
    );
    setPreviewDates(dates);
  };

  const handleSubmit = async () => {
    const user = supabase.auth.user();
    if (!user?.id) {
      Alert.alert('Authentication Error', 'User not authenticated.');
      return;
    }

    if (!title || !description || !eventDate || !startTime || !imageUrl) {
      Alert.alert('Missing Fields', 'Please fill in all required fields and select an image.');
      return;
    }

    const datesToInsert = generateRecurringEvents(
      formatDate(eventDate),
      frequency,
      endDate ? formatDate(endDate) : null
    );

    const payloads = datesToInsert.map((date) => ({
      title,
      description,
      date,
      end_date: endDate ? formatDate(endDate) : null,
      start_time: startTime,
      end_time: endTime || null,
      image_url: imageUrl,
      event_link: eventLink,
      user_id: user.id,
      frequency,
      location: location || null,
      stage: stage || null,
      create_tickets: createTickets,
    }));

    const { error } = await supabase.from('events').insert(payloads);
    if (error) {
      console.log('❌ Insert error:', error);
      Alert.alert('Insert Error', error.message);
    } else {
      Alert.alert('Event(s) Added!');
      setTitle('');
      setDescription('');
      setEventDate(new Date());
      setEndDate(null);
      setStartTime('');
      setEndTime('');
      setEventLink('');
      setImageUrl(null);
      setFrequency('One Time');
      setLocation('');
      setStage('');
      setCreateTickets(false);
      setPreviewDates([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{'←'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Upload Event</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Enter event title" />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Enter event description"
            multiline
          />

          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dropdownInput}>
            <Text>{formatDate(eventDate)}</Text>
            <Text style={{ position: 'absolute', right: 10, top: 12 }}>{'▼'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={eventDate} mode="date" display="default" onChange={handleDateChange} />
          )}

          <Text style={styles.label}>End Date (optional)</Text>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dropdownInput}>
            <Text>{endDate ? formatDate(endDate) : 'Select end date'}</Text>
            <Text style={{ position: 'absolute', right: 10, top: 12 }}>{'▼'}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={handleEndDateChange} />
          )}

          <Text style={styles.label}>Frequency</Text>
          <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowFrequencyOptions(!showFrequencyOptions)}>
            <Text>{frequency}</Text>
            <Text style={{ position: 'absolute', right: 10, top: 12 }}>{'▼'}</Text>
          </TouchableOpacity>
          {showFrequencyOptions && (
            <View style={styles.dropdownOptions}>
              {frequencyOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setFrequency(option);
                    setShowFrequencyOptions(false);
                  }}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.previewButton} onPress={previewGeneratedDates}>
            <Text style={styles.btnText}>Preview Dates</Text>
          </TouchableOpacity>

          {previewDates.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Generated Dates:</Text>
              {previewDates.map((date, idx) => (
                <Text key={idx}>{date}</Text>
              ))}
            </View>
          )}

          <Text style={styles.label}>Start Time</Text>
          <TextInput
            style={styles.dropdownInput}
            placeholder="Select start time"
            value={startTime}
            onFocus={() => Alert.alert('Select Start Time', null, timeOptions.map((t) => ({ text: t, onPress: () => setStartTime(t) })))}
          />

          <Text style={styles.label}>End Time (optional)</Text>
          <TextInput
            style={styles.dropdownInput}
            placeholder="Select end time"
            value={endTime}
            onFocus={() => Alert.alert('Select End Time', null, timeOptions.map((t) => ({ text: t, onPress: () => setEndTime(t) })))}
          />

          <Text style={styles.label}>Event Link (optional)</Text>
          <TextInput value={eventLink} onChangeText={setEventLink} style={styles.input} placeholder="https://..." />

          <Text style={styles.label}>Location (optional)</Text>
          <TextInput value={location} onChangeText={setLocation} style={styles.input} placeholder="Enter location" />

          <Text style={styles.label}>Stage (optional)</Text>
          <TextInput value={stage} onChangeText={setStage} style={styles.input} placeholder="Enter stage name" />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 16, marginRight: 10 }}>Create Digital Tickets</Text>
            <Switch value={createTickets} onValueChange={setCreateTickets} />
          </View>

          <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : <Text style={styles.imageText}>Tap to select image</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Submit Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
  headerText: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 16, marginTop: 20, marginBottom: 8, fontWeight: '600', color: '#000' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 16 },
  dropdownInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 16, justifyContent: 'center', marginBottom: 10 },
  dropdownOptions: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, backgroundColor: '#fff', marginBottom: 10 },
  dropdownOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  imageBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, height: 200, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  image: { width: '100%', height: '100%', borderRadius: 10 },
  imageText: { color: '#888', fontSize: 16 },
  uploadBtn: { marginTop: 30, backgroundColor: '#008080', padding: 16, borderRadius: 10, alignItems: 'center', width: '100%' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  previewButton: { marginTop: 10, backgroundColor: '#eee', padding: 12, borderRadius: 8, alignItems: 'center' },
});
