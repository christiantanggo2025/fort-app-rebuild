import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const buttonSpacing = 20;
const buttonWidth = (width - 40 - 2 * buttonSpacing) / 3; // 40 = paddingHorizontal * 2

export default function CustomerAppEditorScreen() {
  const navigation = useNavigation();

  const buttons = [
    {
      label: 'Notifications',
      onPress: () => alert('Notifications Coming Soon'),
      grey: true,
    },
    {
      label: 'Leagues Dashboard',
      onPress: () => navigation.navigate('LeaguesDashboard'),
    },
    {
      label: 'Edit Links',
      onPress: () => navigation.navigate('RegisterTeamLink'),
    },
    {
      label: 'Events Dashboard',
      onPress: () => navigation.navigate('EventsDashboardScreen'),
    },
    {
      label: 'Home Screen Editor',
      onPress: () => navigation.navigate('HomeScreenEditor'),
    },
    {
      label: 'Home Carousel Editor',
      onPress: () => navigation.navigate('HomeCarouselEditorScreen'),
    },
  ];

  const rows = [];
  for (let i = 0; i < buttons.length; i += 3) {
    const rowItems = buttons.slice(i, i + 3);
    while (rowItems.length < 3) rowItems.push(null);
    rows.push(rowItems);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>App Editor</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Grid */}
      <View style={styles.buttonContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn, idx) =>
              btn ? (
                <TouchableOpacity
                  key={idx}
                  style={[styles.button, btn.grey && styles.greyButton]}
                  onPress={btn.onPress}
                >
                  <Text style={styles.buttonText}>{btn.label}</Text>
                </TouchableOpacity>
              ) : (
                <View key={idx} style={[styles.button, { backgroundColor: 'transparent' }]} />
              )
            )}
          </View>
        ))}
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
    color: '#333',
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
