import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function LeagueSettingsScreen() {
  const navigation = useNavigation();
  const [settingsList, setSettingsList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('league_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setSettingsList(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
        setForm(data[0]);
      } else {
        setSelectedId(null);
        setForm({});
      }
    } else {
      console.error('Error fetching settings:', error.message);
    }
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const saveSettings = async () => {
    if (!selectedId) {
      Alert.alert('No Config Selected', 'Please select or create a config first.');
      return;
    }

    setLoading(true);

    const updatePayload = { ...form };
    delete updatePayload.created_at;
    delete updatePayload.id;

    const { error } = await supabase
      .from('league_settings')
      .update(updatePayload)
      .eq('id', selectedId);

    setLoading(false);

    if (error) {
      console.error('Save error:', error.message);
      Alert.alert('Error', 'Could not save settings.');
    } else {
      Alert.alert('Saved', 'Settings updated.');
      fetchSettings();
    }
  };

  const createNewSettings = async () => {
    const name = `New Config ${settingsList.length + 1}`;
    const { data, error } = await supabase
      .from('league_settings')
      .insert([{ name }])
      .select();

    if (!error && data.length > 0) {
      setSettingsList([data[0], ...settingsList]);
      setSelectedId(data[0].id);
      setForm(data[0]);
    } else {
      Alert.alert('Error', 'Could not create new config.');
      console.error('Insert error:', error?.message);
    }
  };

  const deleteCurrentConfig = async () => {
    if (!selectedId) return;

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${form.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('league_settings')
              .delete()
              .eq('id', selectedId);

            if (error) {
              Alert.alert('Error', 'Could not delete config.');
              console.error('Delete error:', error.message);
            } else {
              Alert.alert('Deleted', 'Configuration removed.');
              fetchSettings();
            }
          },
        },
      ]
    );
  };

  const commonFields = [
    { key: 'name', label: 'Configuration Name', type: 'text' },
    { key: 'total_rounds', label: 'Total Rounds', type: 'number' },
    { key: 'number_of_courts', label: 'Number of Courts', type: 'number' },
    { key: 'min_matches', label: 'Min Matches', type: 'number' },
    { key: 'max_matches', label: 'Max Matches', type: 'number' },
  ];

  const timedFields = [
    { key: 'match_length', label: 'Match Length (min)', type: 'number' },
    { key: 'padding_min', label: 'Padding Between Matches (min)', type: 'number' },
    { key: 'start_time', label: 'Start Time (HH:MM)', type: 'text' },
    { key: 'end_time', label: 'End Time (HH:MM)', type: 'text' },
  ];

  const toggleFields = [
    { key: 'use_timed_rounds', label: 'Use Timed Rounds' },
    { key: 'auto_post_after_confirm', label: 'Auto Post After Confirm' },
    { key: 'boost_weakest', label: 'Boost Weakest Team if Odd' },
    { key: 'dynamic_court_allocation', label: 'Dynamic Court Allocation' },
    { key: 'force_first_two', label: 'Force First Two Rounds' },
    { key: 'geo_lock_schedule_view', label: 'Geo Lock Schedule View' },
    { key: 'prevent_back', label: 'Prevent Back-to-Back' },
    { key: 'rest_priority', label: 'Prioritize Rest' },
    { key: 'prioritize_weakest_matching', label: 'Prioritize Weakest Matching' },
    { key: 'prioritize_strongest_matching', label: 'Prioritize Strongest Matching' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>League Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Config Dropdown */}
        <Text style={styles.label}>Selected Configuration:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownText}>
            {form?.name || '-- Choose a config --'}
          </Text>
          <Ionicons
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#000"
          />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownList}>
            {settingsList.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedId(s.id);
                  setForm(s);
                  setDropdownVisible(false);
                }}
              >
                <Text>{s.name || 'Unnamed Config'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={createNewSettings} style={styles.createButton}>
            <Text style={styles.createText}>+ Create New Config</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={deleteCurrentConfig} style={styles.deleteButton}>
            <Text style={styles.deleteText}>🗑 Delete Config</Text>
          </TouchableOpacity>
        </View>

        {/* Common Fields */}
        {commonFields.map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={form[field.key] ? String(form[field.key]) : ''}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              onChangeText={(text) =>
                handleChange(field.key, field.type === 'number' ? parseInt(text) || 0 : text)
              }
            />
          </View>
        ))}

        {/* Timed Rounds Toggle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Use Timed Rounds</Text>
          <TouchableOpacity
            style={[styles.toggle, form.use_timed_rounds && styles.toggleOn]}
            onPress={() => handleChange('use_timed_rounds', !form.use_timed_rounds)}
          >
            <Text style={styles.toggleText}>
              {form.use_timed_rounds ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {form.use_timed_rounds &&
          timedFields.map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={form[field.key] ? String(form[field.key]) : ''}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                onChangeText={(text) =>
                  handleChange(field.key, field.type === 'number' ? parseInt(text) || 0 : text)
                }
              />
            </View>
          ))}

        {toggleFields
          .filter((f) => f.key !== 'use_timed_rounds')
          .map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TouchableOpacity
                style={[styles.toggle, form[field.key] && styles.toggleOn]}
                onPress={() => handleChange(field.key, !form[field.key])}
              >
                <Text style={styles.toggleText}>
                  {form[field.key] ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    marginTop: 20,
    marginBottom: 20,
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  form: { paddingHorizontal: 60, paddingBottom: 60 },
  label: { fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggle: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  toggleOn: { backgroundColor: '#008080' },
  toggleText: { color: '#fff', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#008080',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputGroup: { marginBottom: 15 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  dropdownText: { fontSize: 16 },
  dropdownList: {
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
  createButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  createText: {
    color: '#008080',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
