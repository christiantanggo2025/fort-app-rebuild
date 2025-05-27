import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CustomerAccountScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate('CustomerLogin');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.screenPadding}>
        <TouchableOpacity style={styles.fullWidthButton} onPress={handleLogout}>
          <Text style={styles.fullWidthButtonText}>Log Out</Text>
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
    color: '#000',
  },
  screenPadding: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  fullWidthButton: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  fullWidthButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
