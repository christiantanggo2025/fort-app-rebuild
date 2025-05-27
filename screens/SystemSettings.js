import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const TIMEZONES = [
  'America/New_York',
  'America/Toronto',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Vancouver',
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function SystemSettings() {
  const navigation = useNavigation();
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    fetchTimezone();
  }, []);

  useEffect(() => {
    if (selectedTimezone) {
      const interval = setInterval(() => {
        const now = new Date().toLocaleString('en-US', {
          timeZone: selectedTimezone,
        });
        setCurrentTime(now);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedTimezone]);

  const fetchTimezone = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('timezone')
      .limit(1)
      .single();

    if (!error && data?.timezone) {
      setSelectedTimezone(data.timezone);
    }
  };

  const saveTimezone = async (tz) => {
    setSelectedTimezone(tz);
    setDropdownVisible(false);

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, timezone: tz }, { onConflict: ['id'] });

    if (error) {
      console.error('Error saving timezone:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>System Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Timezone</Text>
        <TouchableOpacity style={styles.dropdownField} onPress={() => setDropdownVisible(true)}>
          <Text style={styles.dropdownText}>
            {selectedTimezone || 'Select Timezone'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>

        {selectedTimezone && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.label}>Current Time</Text>
            <Text style={styles.currentTime}>{currentTime}</Text>
          </View>
        )}

        {dropdownVisible && (
          <Modal transparent animationType="fade">
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={styles.dropdownList}>
                <FlatList
                  data={TIMEZONES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => saveTimezone(item)}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    maxHeight: 300,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  currentTime: {
    fontSize: 18,
    color: '#008080',
    fontWeight: '600',
  },
});
