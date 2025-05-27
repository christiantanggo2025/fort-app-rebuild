import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const buttonSpacing = 20;
const buttonWidth = (width - 40 - 2 * buttonSpacing) / 3;

export default function EmployeeDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/Buttons/Tavari-Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Employee Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CustomerAppEditor')}
          >
            <Text style={styles.buttonText}>Customer App Editor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('EmployeeCreator')}
          >
            <Text style={styles.buttonText}>Employee Editor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.greyButton]}
            onPress={() => alert('App Settings Coming Soon')}
          >
            <Text style={styles.buttonText}>App Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.greyButton]}
            onPress={() => alert('Nexo Task Manager Coming Soon')}
          >
            <Text style={styles.buttonText}>Nexo Task Manager</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('TicketManagerScreen')}
          >
            <Image
              source={require('../assets/Buttons/Tavari-Tickets-Button.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('StylingTestScreen')}
          >
            <Text style={styles.buttonText}>Styling Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('EmployeeLogin')}
        >
          <Text style={styles.logoutText}>Logout</Text>
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
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    width: 180,
    height: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    width: buttonWidth,
    aspectRatio: 1,
    backgroundColor: '#008080',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greyButton: {
    backgroundColor: '#999',
  },
  imageButton: {
    width: buttonWidth,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logoutButton: {
    backgroundColor: '#008080',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
