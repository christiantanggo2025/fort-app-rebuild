import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function PrintVolleyballSchedulesScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [postedAt, setPostedAt] = useState('');

  useEffect(() => {
    fetchPostedScheduleForDate(selectedDate);
  }, [selectedDate]);

  const fetchPostedScheduleForDate = async (date) => {
    const formattedDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('match_date', formattedDate)
      .eq('is_posted', true)
      .order('round', { ascending: true })
      .order('court', { ascending: true });

    if (error) {
      Alert.alert('Error fetching schedule', error.message);
      return;
    }

    setSchedule(data);
    if (data.length > 0) {
      setPostedAt(data[0].created_at || formattedDate);
    } else {
      setPostedAt('');
    }
  };

  const handleDateChange = (event, date) => {
    if (date) setSelectedDate(date);
    setShowPicker(false);
  };

  const generatePDF = async () => {
    if (schedule.length === 0) {
      Alert.alert('No Schedule', 'No schedule has been posted for this date.');
      return;
    }

    const grouped = schedule.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});

    let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { text-align: center; }
          h2 { margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
            font-size: 14px;
          }
          .page-break {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <h1>Volleyball League Schedule</h1>
        <p><strong>Match Date:</strong> ${selectedDate.toDateString()}</p>
        <p><strong>Posted At:</strong> ${new Date(postedAt).toLocaleString()}</p>
    `;

    Object.entries(grouped).forEach(([round, matches]) => {
      html += `
        <div class="page-break">
          <h2>Round ${round}</h2>
          <table>
            <tr>
              <th>Court</th>
              <th>Team 1</th>
              <th>Team 2</th>
              <th>Winner</th>
              <th>Score</th>
            </tr>
            ${matches
              .map(
                (m) => `
              <tr>
                <td>${m.court}</td>
                <td>${m.team1}</td>
                <td>${m.team2}</td>
                <td></td>
                <td></td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
      `;
    });

    html += '</body></html>';

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Print Schedule</Text>
          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity style={styles.generateButton} onPress={generatePDF}>
          <Text style={styles.generateText}>Download Schedule PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  generateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
