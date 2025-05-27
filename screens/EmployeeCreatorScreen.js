import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EmployeeCreatorScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');

  const createEmployee = async () => {
    console.log('👷 Create button pressed');

    if (!firstName || !lastName || !email || !pin || pin.length !== 6) {
      Alert.alert('All fields are required. PIN must be 6 digits.');
      return;
    }

    let auth_user_id = null;

    try {
      console.log('🔐 Trying sign in...');
      const { user: signInUser, error: signInError } = await supabase.auth.signIn({
        email,
        password: pin,
      });

      if (signInError) {
        console.log('❌ Sign-in failed:', signInError.message);
      }

      if (signInUser?.id) {
        console.log('🔁 Existing user signed in');
        auth_user_id = signInUser.id;
      } else {
        console.log('🆕 Trying sign up...');
        const { user: signUpUser, error: signUpError } = await supabase.auth.signUp({
          email,
          password: pin,
        });

        if (signUpError || !signUpUser?.id) {
          console.error('❌ Signup error:', signUpError);
          Alert.alert('Signup/Login Failed', signUpError?.message || 'User may already exist.');
          return;
        }

        auth_user_id = signUpUser.id;
        console.log('✅ Sign up successful:', auth_user_id);

        const { error: loginError } = await supabase.auth.signIn({
          email,
          password: pin,
        });

        if (loginError) {
          console.error('❌ Login after sign-up failed:', loginError);
          Alert.alert('Login Failed', 'Could not log in after signup.');
          return;
        }

        console.log('✅ Logged in after sign up');
      }

      const sessionCheck = await supabase.auth.session();
      console.log('🔍 Session:', sessionCheck);

      if (!auth_user_id || !sessionCheck) {
        Alert.alert('No session', 'Cannot insert without a valid session.');
        return;
      }

      console.log('📥 Inserting into employees table...');
      const { error: dbError } = await supabase
        .from('employees')
        .insert([{
          first_name: firstName,
          last_name: lastName,
          email,
          pin,
          auth_user_id,
        }]);

      if (dbError) {
        console.error('❌ Insert error:', dbError);
        Alert.alert('Database Insert Failed', dbError.message);
        return;
      }

      console.log('✅ Employee inserted into table');
      Alert.alert('Success', `Employee created: ${firstName} ${lastName}`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPin('');

    } catch (err) {
      console.error('🔥 Unexpected error in createEmployee:', err);
      Alert.alert('Unexpected Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Employee</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="6-digit PIN"
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          value={pin}
          onChangeText={setPin}
        />
        <TouchableOpacity style={styles.button} onPress={createEmployee}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
