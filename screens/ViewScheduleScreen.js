import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function ViewScheduleScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchScheduleForDate(selectedDate);
  }, [selectedDate]);

  const fetchScheduleForDate = async (date) => {
    const formattedDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('match_date', formattedDate)
      .order('round', { ascending: true })
      .order('court', { ascending: true });

    if (error) {
      console.error('❌ Error fetching schedule:', error);
      return;
    }

    setSchedule(data);
  };

  const handleDateChange = (event, date) => {
    if (date) setSelectedDate(date);
    setShowPicker(false);
  };

  const groupedByRound = schedule.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>View Schedule</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Date Picker */}
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

        {/* Schedule Display */}
        {Object.keys(groupedByRound).length === 0 ? (
          <Text style={styles.noScheduleText}>No matches scheduled for this date.</Text>
        ) : (
          Object.entries(groupedByRound).map(([round, matches]) => (
            <View key={round} style={styles.roundBlock}>
              <Text style={styles.roundTitle}>Round {round}</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Court</Text>
                <Text style={styles.tableHeaderText}>Team 1</Text>
                <Text style={styles.tableHeaderText}>Team 2</Text>
              </View>
              {matches.map((match, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.cell}>{match.court}</Text>
                  <Text style={styles.cell}>{match.team1}</Text>
                  <Text style={styles.cell}>{match.team2}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  dateText: {
    fontSize: 16,
    color: '#333'
  },
  roundBlock: {
    marginBottom: 20
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 4
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#666'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 4
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#444'
  },
  noScheduleText: {
    fontSize: 16,
    color: '#666'
  }
});
