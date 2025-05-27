import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function CaptainLoginScreen() {
  const navigation = useNavigation();
  const [code, setCode] = useState('');

  const handleCodeLogin = async () => {
    console.log('🟢 Captain code entered:', code);

    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code.');
      return;
    }

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('captain_code', code)
      .single();

    if (error || !data) {
      console.error('❌ Captain code login failed:', error);
      Alert.alert('Invalid Code', 'That captain code was not found.');
      return;
    }

    console.log('✅ Captain team found:', data);

    // Optional: Store team data in global context, Redux, or AsyncStorage
    // For now, we just navigate with a success log
    navigation.navigate('CaptainDashboard', { team: data });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Captain Login</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.screenPadding}>
        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit code"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.fullWidthButton} onPress={handleCodeLogin}>
          <Text style={styles.fullWidthButtonText}>Login</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  screenPadding: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  fullWidthButton: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullWidthButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
