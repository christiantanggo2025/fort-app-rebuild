import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function EmployeeLoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleLogin = async () => {
    console.log('🔐 Login started...');
    if (!email || pin.length !== 6) {
      Alert.alert('Missing Info', 'Please enter your email and 6-digit PIN.');
      return;
    }

    try {
      const { user, error: loginError } = await supabase.auth.signIn({
        email,
        password: pin,
      });

      if (loginError || !user) {
        console.error('❌ Login failed:', loginError);
        Alert.alert('Login Failed', loginError?.message || 'Invalid credentials.');
        return;
      }

      console.log('✅ Login successful. UID:', user.id);

      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (employeeError || !employee) {
        console.error('❌ Employee not found:', employeeError);
        Alert.alert('Login Failed', 'Employee profile not found.');
        return;
      }

      console.log('👤 Employee:', employee.first_name, employee.last_name);
      Alert.alert('Welcome', `Hello, ${employee.first_name}!`);
      navigation.navigate('EmployeeDashboard');

    } catch (err) {
      console.error('🔥 Unexpected error:', err);
      Alert.alert('Unexpected Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Employee Login</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.centerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="6-digit PIN"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={!showCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCode(!showCode)}
            >
              <Ionicons
                name={showCode ? 'eye-off' : 'eye'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20, // updated from 60
    marginTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20, // updated from 60
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 20,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  loginButton: {
    backgroundColor: '#008080',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
