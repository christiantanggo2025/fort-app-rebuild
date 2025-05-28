import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const buttonSpacing = 20;
const buttonWidth = (width - 40 - 2 * buttonSpacing) / 3;

export default function VolleyballLeagueScreen() {
  const navigation = useNavigation();

  const buttons = [
    { title: 'Absence Manager', screen: 'AbsenceManagement' },
    { title: 'Banner Editor', screen: 'GameDayBannerScreen' },
    { title: 'Score Manager', screen: 'ScoreManagement' },
    { title: 'Schedule Manager', screen: 'ScheduleCreator' },
    { title: 'Print Schedules', screen: 'PrintVolleyballSchedules' },
    { title: 'View Posted Schedules', screen: 'ViewPostedSchedules' },
    { title: 'Carousel Editor', screen: 'VolleyballCarouselEditorScreen' },
    {
      title: 'Volleyball Store',
      action: () => Alert.alert('Coming Soon', 'This feature is coming soon.'),
    },
    { title: 'Team Manager', screen: 'TeamMaintenance' },
    { title: 'League Settings', screen: 'LeagueSettings' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back + Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Volleyball Leagues</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {/* Render buttons in rows of 3 */}
        {Array.from({ length: Math.ceil(buttons.length / 3) }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {buttons.slice(rowIndex * 3, rowIndex * 3 + 3).map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={styles.button}
                onPress={() => {
                  if (btn.screen) {
                    navigation.navigate(btn.screen);
                  } else if (btn.action) {
                    btn.action();
                  }
                }}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
