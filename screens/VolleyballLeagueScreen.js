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

export default function VolleyballLeagueScreen() {
  const navigation = useNavigation();

  const buttons = [
    { label: 'Absence Manager', screen: 'AbsenceManagement' },
    { label: 'Schedule Manager', screen: 'ScheduleCreator' },
    { label: 'Score Manager', screen: 'ScoreManagement' },
    { label: 'Team Manager', screen: 'TeamMaintenance' },
    { label: 'League Settings', screen: 'LeagueSettings' },
    { label: 'Print Schedules', screen: 'PrintVolleyballSchedules' },
    { label: 'Carousel Editor', screen: 'VolleyballCarouselEditorScreen' },
    { label: 'Banner Editor', screen: 'GameDayBannerScreen' },
    { label: 'Volleyball Store', screen: null }, // Feature Coming Soon
  ];

  // Generate rows with 3 buttons per row
  const buttonRows = [];
  for (let i = 0; i < buttons.length; i += 3) {
    buttonRows.push(buttons.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Volleyball Leagues</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Button Grid */}
      <View style={styles.mainContent}>
        {buttonRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.button}
                onPress={() => {
                  if (btn.label === 'Volleyball Store') {
                    alert("Feature Coming Soon");
                  } else {
                    navigation.navigate(btn.screen);
                  }
                }}
              >
                <Text style={styles.buttonText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
            {/* Fill empty slots with transparent fillers */}
            {Array(3 - row.length)
              .fill(null)
              .map((_, fillerIndex) => (
                <View key={`filler-${fillerIndex}`} style={styles.buttonFiller} />
              ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const totalPadding = 40; // 20px left + 20px right
const spacing = 20;
const buttonWidth = (width - totalPadding - spacing * 2) / 3;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  button: {
    width: buttonWidth,
    aspectRatio: 1,
    backgroundColor: '#008080',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  buttonFiller: {
    width: buttonWidth,
    aspectRatio: 1,
    marginRight: 20,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
