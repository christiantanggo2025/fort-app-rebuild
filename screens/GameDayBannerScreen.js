import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const bannerPhases = [
  { key: 'no_games', label: 'No Games Scheduled For Today', color: '#999999' },
  { key: 'games_on', label: 'Games For Today Are On', color: '#00AA00' },
  { key: 'cancelled', label: 'Games For Today Are Cancelled', color: '#FF0000' },
  { key: 'pending', label: 'Games For Today Are Pending', color: '#FFD700' },
  { key: 'free_practice', label: 'Free Practice Today', color: '#007FFF' },
];

export default function GameDayBannerScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [repeatDay, setRepeatDay] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentBannerStatus, setCurrentBannerStatus] = useState(null);

  useEffect(() => {
    fetchCurrentBannerStatus();
  }, [selectedDate]);

  const fetchCurrentBannerStatus = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const weekday = selectedDate.toLocaleString('en-US', { weekday: 'long' });
    const weekdayLower = weekday.toLowerCase();

    const { data: specific } = await supabase
      .from('volleyball_banners')
      .select('*')
      .eq('banner_date', dateStr)
      .single();

    if (specific?.status) {
      setCurrentBannerStatus(specific.status);
      return;
    }

    const { data: recurring } = await supabase
      .from('volleyball_banners')
      .select('*')
      .eq('repeat_day', weekdayLower)
      .single();

    if (recurring?.status) {
      setCurrentBannerStatus(recurring.status);
      return;
    }

    const { data: teams } = await supabase
      .from('teams')
      .select('team_name')
      .eq('day', weekday);

    if (!teams || teams.length === 0) return setCurrentBannerStatus('no_games');

    const { data: games } = await supabase
      .from('schedules')
      .select('id')
      .eq('match_date', dateStr);

    if (games && games.length > 0) {
      setCurrentBannerStatus('games_on');
    } else {
      setCurrentBannerStatus('no_games');
    }
  };

  const handleDateChange = (_, date) => {
    setShowPicker(false);
    if (date) setSelectedDate(date);
  };

  const saveBanner = async () => {
    if (!selectedPhase) {
      Alert.alert('Select a phase before saving.');
      return;
    }

    const payload = {
      status: selectedPhase,
      banner_date: selectedDate.toISOString().split('T')[0],
    };

    if (repeatDay) {
      const weekday = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      payload.repeat_day = weekday;
    }

    const { error } = await supabase
      .from('volleyball_banners')
      .upsert(payload, { onConflict: ['banner_date'] });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Banner phase updated.');
      fetchCurrentBannerStatus();
    }
  };

  const selectedLabel =
    bannerPhases.find((p) => p.key === selectedPhase)?.label || 'Select Phase';

  const currentBanner = bannerPhases.find((p) => p.key === currentBannerStatus) || bannerPhases[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Game Day Banner</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Select Banner Phase:</Text>
        <TouchableOpacity
          style={styles.dropdownField}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownText}>{selectedLabel}</Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>

        <Modal
          transparent
          visible={dropdownVisible}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={styles.dropdownList}>
              {bannerPhases.map((phase) => (
                <TouchableOpacity
                  key={phase.key}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedPhase(phase.key);
                    setDropdownVisible(false);
                  }}
                >
                  <Text>{phase.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <TouchableOpacity
          style={[styles.button, repeatDay && styles.toggleActive]}
          onPress={() => setRepeatDay(!repeatDay)}
        >
          <Text style={styles.buttonText}>
            {repeatDay ? '✓ Repeat Every Week' : 'Repeat Every Week'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={saveBanner}>
          <Text style={styles.buttonText}>Save Banner</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Current Customer Banner:</Text>
        <View style={[styles.phaseBanner, { backgroundColor: currentBanner.color }]}>
          <Text style={styles.phaseText}>{currentBanner.label}</Text>
          <Text style={styles.phaseSubtext}>(Final Confirmation Daily @ 3:30pm)</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => navigation.navigate('ViewBannerHistoryScreen')}
        >
          <Text style={styles.buttonText}>View Past Dates</Text>
        </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: { padding: 20 },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: { fontSize: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  dropdownField: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownText: { fontSize: 16, color: '#333' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 10 },
  button: {
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  toggleActive: { backgroundColor: '#004d4d' },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  phaseBanner: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  phaseText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  phaseSubtext: {
    color: '#fff',
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
  },
});
