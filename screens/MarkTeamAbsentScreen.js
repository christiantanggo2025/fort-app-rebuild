import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const MarkTeamAbsentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const team = route.params?.team;

  const [selectedDate, setSelectedDate] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dates, setDates] = useState([]);
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    const generateDates = () => {
      const today = new Date();
      const futureDates = [];
      for (let i = 0; i <= 60; i++) {
        const newDate = new Date(today);
        newDate.setDate(today.getDate() + i);
        futureDates.push({
          value: newDate.toISOString().split('T')[0],
          label: newDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        });
      }
      setDates(futureDates);
    };
    generateDates();
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .eq('team_id', team.id)
      .gt('absence_date', new Date().toISOString().split('T')[0]);

    if (!error) {
      setAbsences(data);
    }
  };

  const saveAbsence = async () => {
    if (!selectedDate) {
      Alert.alert('Please select a date.');
      return;
    }

    const { error } = await supabase.from('absences').insert([
      {
        team_id: team.id,
        team_name: team.team_name,
        absence_date: selectedDate,
      },
    ]);

    if (error) {
      Alert.alert('Error saving absence.');
    } else {
      Alert.alert('Absence saved!');
      fetchAbsences();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('absences').delete().eq('id', id);
    if (!error) {
      fetchAbsences();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mark Team Absent</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Choose a Date</Text>
        <TouchableOpacity
          style={styles.dropdownField}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownText}>
            {selectedDate
              ? dates.find((d) => d.value === selectedDate)?.label
              : 'Select a date'}
          </Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={dates}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    item.value === selectedDate && styles.dropdownSelected,
                  ]}
                  onPress={() => {
                    setSelectedDate(item.value);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedDate && styles.selectedText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={saveAbsence}>
          <Text style={styles.saveText}>Save Absence</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Upcoming Absences</Text>
        {absences.length === 0 ? (
          <Text>No upcoming absences.</Text>
        ) : (
          absences.map((absence) => (
            <View key={absence.id} style={styles.absenceRow}>
              <Text style={styles.absenceText}>{absence.absence_date}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(absence.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
};

export default MarkTeamAbsentScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    paddingHorizontal: 60,
    paddingBottom: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 18,
  },
  dropdownContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownOption: {
    padding: 12,
  },
  dropdownSelected: {
    backgroundColor: '#008080',
  },
  optionText: {
    fontSize: 16,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  absenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  absenceText: {
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FF0000',
    borderRadius: 4,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
