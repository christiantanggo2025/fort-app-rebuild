import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

export default function ManualTicketEntryScreen() {
  const navigation = useNavigation();

  const [events, setEvents] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [eventDropdownVisible, setEventDropdownVisible] = useState(false);
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const { data: eventsData } = await supabase
      .from('events')
      .select('id, title, date')
      .eq('create_tickets', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    const { data: typesData } = await supabase.from('ticket_types').select('*');

    setEvents(eventsData || []);
    setTicketTypes(typesData || []);
  };

  const handleCreateTicket = async () => {
    if (!selectedEvent || !selectedType || !firstName || !lastName || !email) {
      return alert('All required fields must be filled.');
    }

    const { error } = await supabase.from('tickets').insert({
      event_id: selectedEvent.id,
      ticket_type: selectedType.type_name,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      used: false,
      source: 'manual',
    });

    if (error) {
      console.log('❌ Ticket creation failed:', error);
      alert('Error creating ticket.');
    } else {
      alert('✅ Ticket created successfully!');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Manual Ticket Entry</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Event Selector */}
        <Text style={styles.label}>Select Event</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setEventDropdownVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {selectedEvent ? `${selectedEvent.title} – ${selectedEvent.date}` : 'Select an event'}
          </Text>
        </TouchableOpacity>

        {/* Ticket Type Selector */}
        <Text style={styles.label}>Select Ticket Type</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setTypeDropdownVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {selectedType ? selectedType.type_name : 'Select ticket type'}
          </Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone Number (Optional)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Create Ticket */}
        <TouchableOpacity style={styles.submitButton} onPress={handleCreateTicket}>
          <Text style={styles.submitText}>Create Ticket</Text>
        </TouchableOpacity>

        {/* Preview Ticket */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: '#888', marginTop: 10 }]}
          onPress={() => setShowPreview(!showPreview)}
        >
          <Text style={styles.submitText}>Preview Ticket</Text>
        </TouchableOpacity>

        {showPreview && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>🎟️ Ticket Preview</Text>
            <Text style={styles.previewText}>Event: {selectedEvent?.title || 'N/A'}</Text>
            <Text style={styles.previewText}>Date: {selectedEvent?.date || 'N/A'}</Text>
            <Text style={styles.previewText}>Type: {selectedType?.type_name || 'N/A'}</Text>
            <Text style={styles.previewText}>Name: {firstName} {lastName}</Text>
            <Text style={styles.previewText}>Email: {email}</Text>
            {phone ? <Text style={styles.previewText}>Phone: {phone}</Text> : null}
          </View>
        )}
      </ScrollView>

      {/* Event Dropdown Modal */}
      <Modal visible={eventDropdownVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Event</Text>
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedEvent(item);
                  setEventDropdownVisible(false);
                }}
              >
                <Text>{item.title} – {item.date}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setEventDropdownVisible(false)} style={styles.modalClose}>
            <Text style={{ fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Ticket Type Dropdown Modal */}
      <Modal visible={typeDropdownVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Ticket Type</Text>
          <FlatList
            data={ticketTypes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedType(item);
                  setTypeDropdownVisible(false);
                }}
              >
                <Text>{item.type_name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setTypeDropdownVisible(false)} style={styles.modalClose}>
            <Text style={{ fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dropdownText: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewText: {
    fontSize: 15,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  modalClose: {
    padding: 20,
    alignItems: 'center',
  },
});
