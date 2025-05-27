import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TicketManagerScreen() {
  const navigation = useNavigation();

  const ButtonItem = ({ label, screen }) => (
    <TouchableOpacity style={styles.gridButton} onPress={() => navigation.navigate(screen)}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Ticket Manager</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.gridRow}>
          <ButtonItem label="Scan Tickets" screen="TicketScanScreen" />
          <ButtonItem label="Manual Tickets" screen="ManualTicketEntry" />
          <ButtonItem label="View Tickets" screen="TicketListScreen" />
        </View>
        <View style={styles.gridRow}>
          <ButtonItem label="Ticket Logs" screen="TicketScanHistoryScreen" />
          <ButtonItem label="Create Ticket" screen="TicketCreateScreen" />
          <ButtonItem label="Ticket Settings" screen="TicketTypeScreen" />
        </View>
      </ScrollView>
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
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#008080',
    marginHorizontal: 5,
    paddingVertical: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
