import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Switch,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { uploadImageToSupabase } from '../utils/imageUploader';

export default function ViewExistingEvents() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.log('❌ Error fetching events:', error);
    } else {
      setEvents(data);
    }
  };

  const handleDelete = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) {
              Alert.alert('Error deleting event', error.message);
            } else {
              fetchEvents();
            }
          },
        },
      ]
    );
  };

  const handleCancel = (eventId) => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to mark this event as cancelled?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel It',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('events')
              .update({ is_cancelled: true })
              .eq('id', eventId);
            if (error) {
              Alert.alert('Error cancelling event', error.message);
            } else {
              fetchEvents();
            }
          },
        },
      ]
    );
  };

  const handleEditToggle = (eventId) => {
    setEditingId(editingId === eventId ? null : eventId);
    if (editingId !== eventId) {
      const event = events.find((e) => e.id === eventId);
      setEditedFields({ ...event });
    }
  };

  const handleEditChange = (key, value) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickImage = async () => {
    const url = await uploadImageToSupabase('event-images');
    if (url) setEditedFields((prev) => ({ ...prev, image_url: url }));
  };

  const handleSave = async () => {
    const { id, ...fieldsToUpdate } = editedFields;
    const { error } = await supabase.from('events').update(fieldsToUpdate).eq('id', id);
    if (error) {
      Alert.alert('Error updating event', error.message);
    } else {
      setEditingId(null);
      fetchEvents();
    }
  };

  const isDate = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);

  const filteredEvents = events.filter((event) => {
    if (isDate(searchQuery)) {
      return event.date === searchQuery;
    }
    return (
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Existing Events</Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput
        placeholder="Search title, description, or date (YYYY-MM-DD)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            {event.is_cancelled && (
              <Text style={styles.cancelledTag}>Cancelled</Text>
            )}
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text>{event.date}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditToggle(event.id)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(event.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(event.id)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {editingId === event.id && (
              <View style={styles.editForm}>
                <TextInput style={styles.input} placeholder="Title" value={editedFields.title} onChangeText={(text) => handleEditChange('title', text)} />
                <TextInput style={styles.input} placeholder="Description" value={editedFields.description} onChangeText={(text) => handleEditChange('description', text)} multiline />
                <TextInput style={styles.input} placeholder="Location" value={editedFields.location} onChangeText={(text) => handleEditChange('location', text)} />
                <TextInput style={styles.input} placeholder="Link" value={editedFields.event_link} onChangeText={(text) => handleEditChange('event_link', text)} />
                <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={editedFields.date} onChangeText={(text) => handleEditChange('date', text)} />
                <TextInput style={styles.input} placeholder="Start Time" value={editedFields.start_time} onChangeText={(text) => handleEditChange('start_time', text)} />
                <TextInput style={styles.input} placeholder="End Time" value={editedFields.end_time} onChangeText={(text) => handleEditChange('end_time', text)} />
                <TextInput style={styles.input} placeholder="Frequency" value={editedFields.frequency} onChangeText={(text) => handleEditChange('frequency', text)} />
                <TextInput style={styles.input} placeholder="Stage" value={editedFields.stage} onChangeText={(text) => handleEditChange('stage', text)} />
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Create Tickets</Text>
                  <Switch
                    value={editedFields.create_tickets}
                    onValueChange={(val) => handleEditChange('create_tickets', val)}
                  />
                </View>

                <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
                  {editedFields.image_url ? (
                    <Image source={{ uri: editedFields.image_url }} style={styles.image} />
                  ) : (
                    <Text style={styles.imageText}>Tap to select image</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  eventCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  cancelledTag: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#008080',
    padding: 10,
    marginRight: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF0000',
    padding: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#008080',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editForm: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageText: {
    color: '#888',
    fontSize: 16,
  },
});
