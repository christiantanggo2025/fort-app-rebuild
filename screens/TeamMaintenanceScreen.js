import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const TeamMaintenanceScreen = () => {
  const navigation = useNavigation();

  const [teamName, setTeamName] = useState('');
  const [day, setDay] = useState('');
  const [captainCode, setCaptainCode] = useState('');
  const [teams, setTeams] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load teams:', error);
    } else {
      setTeams(data);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setDay('');
    setCaptainCode('');
    setEditingId(null);
  };

  const generateRandomCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptainCode(newCode);
  };

  const handleSave = async () => {
    if (!teamName || !day || captainCode.length !== 6) {
      Alert.alert('Error', 'Please complete all fields. Captain code must be 6 digits.');
      return;
    }

    // Check for existing duplicate captain code
    const { data: existingTeam, error: lookupError } = await supabase
      .from('teams')
      .select('id')
      .eq('captain_code', captainCode)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('Captain code lookup error:', lookupError);
      Alert.alert('Error', 'Unable to check for duplicate codes.');
      return;
    }

    if (existingTeam && existingTeam.id !== editingId) {
      Alert.alert('Duplicate Code', 'That captain code is already in use by another team.');
      return;
    }

    const payload = {
      team_name: teamName,
      day,
      captain_code: captainCode,
    };

    if (editingId) {
      const { error } = await supabase.from('teams').update(payload).eq('id', editingId);
      if (error) {
        Alert.alert('Update Failed', error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('teams').insert([payload]);
      if (error) {
        Alert.alert('Insert Failed', error.message);
        return;
      }
    }

    resetForm();
    fetchTeams();
    Alert.alert('Success', editingId ? 'Team updated.' : 'Team created.');
  };

  const handleEdit = (team) => {
    setTeamName(team.team_name);
    setDay(team.day);
    setCaptainCode(team.captain_code);
    setEditingId(team.id);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Team', 'Are you sure you want to delete this team?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('teams').delete().eq('id', id);
          if (error) {
            Alert.alert('Delete Failed', error.message);
            return;
          }
          fetchTeams();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Team Maintenance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Form */}
        <Text style={styles.label}>Team Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter team name"
          value={teamName}
          onChangeText={setTeamName}
        />

        <Text style={styles.label}>Choose The Day</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => setShowDayModal(true)}
        >
          <Text style={day ? styles.dropdownText : styles.dropdownPlaceholder}>
            {day || 'Select a day'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#555" />
        </TouchableOpacity>

        <Modal
          visible={showDayModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowDayModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDayModal(false)}>
            <View style={styles.modalContent}>
              {daysOfWeek.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={styles.modalItem}
                  onPress={() => {
                    setDay(d);
                    setShowDayModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        <Text style={styles.label}>Captain Code</Text>
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          keyboardType="numeric"
          maxLength={6}
          value={captainCode}
          onChangeText={setCaptainCode}
        />

        {!captainCode ? (
          <TouchableOpacity
            onPress={generateRandomCode}
            style={styles.generateButton}
          >
            <Text style={styles.generateButtonText}>Generate Random Code</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Regenerate Code?', 'This will overwrite the current code.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Regenerate',
                  style: 'default',
                  onPress: generateRandomCode,
                },
              ]);
            }}
            style={styles.generateButton}
          >
            <Text style={styles.generateButtonText}>Regenerate Code</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{editingId ? 'Update Team' : 'Create Team'}</Text>
        </TouchableOpacity>

        {/* Existing Teams */}
        <Text style={styles.sectionTitle}>Existing Teams</Text>

        {teams.map((team) => (
          <View key={team.id} style={styles.teamCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamText}>{team.team_name}</Text>
              <Text style={styles.teamSubText}>Day: {team.day}</Text>
              <Text style={styles.teamSubText}>Code: {team.captain_code}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(team)}>
              <Ionicons name="create-outline" size={24} color="#008080" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(team.id)} style={{ marginLeft: 10 }}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000077',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    borderRadius: 10,
    paddingVertical: 10,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#333',
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  teamText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  teamSubText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TeamMaintenanceScreen;
