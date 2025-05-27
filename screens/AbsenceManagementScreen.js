import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function AbsenceManagementScreen() {
  const navigation = useNavigation();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [absences, setAbsences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timezone, setTimezone] = useState('America/Toronto');

  useEffect(() => {
    fetchTimezone();
  }, []);

  useEffect(() => {
    if (timezone) {
      fetchTeams();
      fetchAbsences();
    }
  }, [timezone]);

  const formatDate = (dateObj) => {
    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
  };

  const fetchTimezone = async () => {
    const { data, error } = await supabase.from('timezone_settings').select('timezone').single();
    if (data?.timezone) {
      setTimezone(data.timezone);
    }
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase.from('teams').select('id, team_name');
    if (!error) setTeams(data);
  };

  const fetchAbsences = async () => {
    const { data, error } = await supabase.from('absences').select('*').order('absence_date');
    if (error || !data) return;

    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    const upcoming = data.filter((a) => a.absence_date >= today);
    setAbsences(upcoming);
  };

  const handleSave = async () => {
    if (!selectedTeam) {
      Alert.alert('Error', 'Please select a team.');
      return;
    }

    const dateString = formatDate(selectedDate);

    const { error } = await supabase.from('absences').insert([
      {
        team_id: selectedTeam.id,
        team_name: selectedTeam.team_name,
        absence_date: dateString,
      },
    ]);

    if (error) {
      Alert.alert('Error', 'Could not save absence.');
    } else {
      Alert.alert('Saved', 'Absence recorded.');
      setSelectedTeam(null);
      setSelectedDate(new Date());
      fetchAbsences();
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this absence?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('absences').delete().eq('id', id);
          fetchAbsences();
        },
      },
    ]);
  };

  const filteredAbsences = absences.filter((a) =>
    a.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Absence Manager</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {/* Team Dropdown */}
        <Text style={styles.label}>Select Team:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownText}>
            {selectedTeam ? selectedTeam.team_name : '-- Choose a team --'}
          </Text>
          <Ionicons name={dropdownVisible ? 'chevron-up' : 'chevron-down'} size={20} />
        </TouchableOpacity>

        {dropdownVisible && (
          <ScrollView style={styles.dropdownList}>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTeam(team);
                  setDropdownVisible(false);
                }}
              >
                <Text>{team.team_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Date Picker */}
        <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>
            {formatDate(selectedDate)}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowPicker(Platform.OS === 'ios');
              if (date) setSelectedDate(date);
            }}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Absence</Text>
        </TouchableOpacity>

        {/* Search */}
        <TextInput
          placeholder="Search by team..."
          style={styles.search}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {/* Absences List */}
        <FlatList
          data={filteredAbsences}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.absenceItem}>
              <Text style={styles.absenceText}>
                {item.team_name} – {item.absence_date}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dateButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  absenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  absenceText: {
    fontSize: 16,
  },
});
