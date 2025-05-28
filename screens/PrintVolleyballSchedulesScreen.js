// UPDATED: PrintVolleyballSchedulesScreen.js — uses date range (gte/lt) for reliable schedule match

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
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPostedScheduleForDate(selectedDate);
  }, [selectedDate]);

  const fetchPostedScheduleForDate = async (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .gte('match_date', start.toISOString())
      .lt('match_date', end.toISOString())
      .eq('is_posted', true)
      .order('round', { ascending: true })
      .order('court', { ascending: true });

    if (error) {
      Alert.alert('Error fetching schedule', error.message);
      return;
    }

    setSchedule(data);
    setPostedAt(data.length > 0 ? data[0].created_at || start.toDateString() : '');
    setShowPreview(false);
  };

  const getAllTeams = (matches) => {
    const teams = new Set();
    matches.forEach(m => {
      if (m.team1) teams.add(m.team1);
      if (m.team2) teams.add(m.team2);
    });
    return Array.from(teams);
  };

  const getByeTeamsForRound = (allTeams, matches) => {
    const playing = new Set();
    matches.forEach(m => {
      if (m.team1) playing.add(m.team1);
      if (m.team2) playing.add(m.team2);
    });
    return allTeams.filter(t => !playing.has(t));
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

    const allTeams = getAllTeams(schedule);
    const grouped = schedule.reduce((acc, m) => {
      if (!acc[m.round]) acc[m.round] = [];
      acc[m.round].push(m);
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
      const byeTeams = getByeTeamsForRound(allTeams, matches);
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
            ${matches.map(m => `
              <tr>
                <td>${m.court}</td>
                <td>${m.team1 || '—'}</td>
                <td>${m.team2 || 'BYE'}</td>
                <td></td>
                <td></td>
              </tr>
            `).join('')}
          </table>
          ${byeTeams.length > 0 ? `<p><strong>Teams with a bye:</strong> ${byeTeams.join(', ')}</p>` : ''}
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

        <TouchableOpacity style={styles.previewButton} onPress={() => setShowPreview(!showPreview)}>
          <Text style={styles.generateText}>Preview Schedule</Text>
        </TouchableOpacity>

        {showPreview && schedule.length > 0 && (
          <View style={{ marginTop: 20 }}>
            {Object.entries(
              schedule.reduce((acc, m) => {
                if (!acc[m.round]) acc[m.round] = [];
                acc[m.round].push(m);
                return acc;
              }, {})
            ).map(([round, matches]) => {
              const allTeams = getAllTeams(schedule);
              const byeTeams = getByeTeamsForRound(allTeams, matches);
              return (
                <View key={round} style={{ marginBottom: 16 }}>
                  <Text style={styles.roundTitle}>Round {round}</Text>
                  {matches.map((m, i) => (
                    <Text key={i} style={styles.matchText}>
                      Court {m.court}: {m.team1 || '—'} vs {m.team2 || 'BYE'}
                    </Text>
                  ))}
                  {byeTeams.length > 0 && (
                    <Text style={styles.byeText}>
                      Teams with a bye: {byeTeams.join(', ')}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {showPreview && schedule.length === 0 && (
          <Text style={{ marginTop: 16, fontStyle: 'italic' }}>
            No schedule available for selected date.
          </Text>
        )}
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
    marginTop: 10,
  },
  previewButton: {
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  generateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 15,
    marginBottom: 4,
  },
  byeText: {
    marginTop: 6,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#444',
  },
});
