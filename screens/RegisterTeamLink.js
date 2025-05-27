import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function RegisterTeamLink() {
  const navigation = useNavigation();
  const [websiteLink, setWebsiteLink] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [waiverLink, setWaiverLink] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('app_links')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching links:', error);
    } else {
      setWebsiteLink(data.website_link || '');
      setRegistrationLink(data.registration_link || '');
      setWaiverLink(data.waiver_link || '');
    }
  };

  const saveLinksToSupabase = async () => {
    try {
      const { error } = await supabase.from('app_links').upsert([
        {
          id: 1,
          website_link: websiteLink,
          registration_link: registrationLink,
          waiver_link: waiverLink,
        },
      ]);

      if (error) {
        console.error('Error saving links:', error);
        Alert.alert('Error', 'Failed to save links.');
      } else {
        Alert.alert('Success', 'Links saved successfully.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Links</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Website Link</Text>
          <TextInput
            style={styles.input}
            value={websiteLink}
            onChangeText={setWebsiteLink}
            placeholder="https://yourwebsite.com"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Team Registration Link</Text>
          <TextInput
            style={styles.input}
            value={registrationLink}
            onChangeText={setRegistrationLink}
            placeholder="https://yourform.com/register"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Waiver Link</Text>
          <TextInput
            style={styles.input}
            value={waiverLink}
            onChangeText={setWaiverLink}
            placeholder="https://yourform.com/waiver"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveLinksToSupabase}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    marginTop: 40,
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
