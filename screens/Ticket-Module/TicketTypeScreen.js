import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

export default function TicketTypeScreen() {
  const navigation = useNavigation();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [newType, setNewType] = useState('');

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  const fetchTicketTypes = async () => {
    const { data, error } = await supabase.from('ticket_types').select('*');
    if (error) {
      Alert.alert('Error fetching ticket types');
    } else {
      setTicketTypes(data);
    }
  };

  const addTicketType = async () => {
    if (!newType.trim()) return;
    const { error } = await supabase.from('ticket_types').insert([{ name: newType.trim() }]);
    if (error) {
      Alert.alert('Error adding type');
    } else {
      setNewType('');
      fetchTicketTypes();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Ticket Types</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Add New Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. VIP, General"
          value={newType}
          onChangeText={setNewType}
        />
        <TouchableOpacity style={styles.button} onPress={addTicketType}>
          <Text style={styles.buttonText}>Add Type</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Existing Types</Text>
        <FlatList
          data={ticketTypes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerText: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#333' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#008080', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  itemText: { fontSize: 16, color: '#000' },
});
