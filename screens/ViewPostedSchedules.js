import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ViewPostedSchedules() {
  const navigation = useNavigation();
  const [postedSchedules, setPostedSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState([]);

  useEffect(() => {
    fetchPostedSchedules();
  }, []);

  const fetchPostedSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('is_posted', true)
      .order('match_date', { ascending: true });

    if (data && !error) {
      const grouped = data.reduce((acc, match) => {
        const dateOnly = match.match_date.split('T')[0]; // YYYY-MM-DD
        if (!acc[dateOnly]) acc[dateOnly] = [];
        acc[dateOnly].push(match);
        return acc;
      }, {});
      setPostedSchedules(grouped);
    }
  };

  const toggleExpand = (date) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedDates.includes(date)) {
      setExpandedDates(expandedDates.filter((d) => d !== date));
    } else {
      setExpandedDates([...expandedDates, date]);
    }
  };

  const getAllTeams = (matches) => {
    const teams = new Set();
    matches.forEach((m) => {
      if (m.team1) teams.add(m.team1);
      if (m.team2) teams.add(m.team2);
    });
    return Array.from(teams);
  };

  const getByeTeamsForRound = (allTeams, matches) => {
    const playing = new Set();
    matches.forEach((m) => {
      if (m.team1) playing.add(m.team1);
      if (m.team2) playing.add(m.team2);
    });
    return allTeams.filter((t) => !playing.has(t));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.header}>View Posted Schedules</Text>
          <View style={{ width: 24 }} />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by team or day..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Object.entries(postedSchedules)
            .filter(([date, matches]) =>
              matches.some(
                (m) =>
                  m.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.day.toLowerCase().includes(searchQuery.toLowerCase())
              )
            )
            .map(([date, matches]) => {
              const allTeams = getAllTeams(matches);
              const groupedByRound = matches.reduce((acc, m) => {
                if (!acc[m.round]) acc[m.round] = [];
                acc[m.round].push(m);
                return acc;
              }, {});
              const sortedRounds = Object.keys(groupedByRound).sort((a, b) => Number(a) - Number(b));

              return (
                <View key={date} style={styles.dateSection}>
                  <TouchableOpacity
                    onPress={() => toggleExpand(date)}
                    style={styles.dateButton}
                  >
                    <Text style={styles.dateButtonText}>{date}</Text>
                  </TouchableOpacity>
                  {expandedDates.includes(date) && (
                    <View style={styles.matchList}>
                      {sortedRounds.map((round) => {
                        const roundMatches = groupedByRound[round].sort((a, b) => a.court - b.court);
                        const byeTeams = getByeTeamsForRound(allTeams, roundMatches);
                        return (
                          <View key={round} style={{ marginBottom: 10 }}>
                            <Text style={styles.roundTitle}>Round {round}</Text>
                            {roundMatches.map((m, i) => (
                              <Text key={i} style={styles.matchText}>
                                Court {m.court}: {m.team1 || '—'} vs {m.team2 || 'BYE'}
                              </Text>
                            ))}
                            {byeTeams.length > 0 && (
                              <Text style={styles.byeText}>
                                Teams with a bye: {byeTeams.join(', ')}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContainer: { paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  dateSection: {
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  matchList: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchText: {
    fontSize: 14,
    marginBottom: 5,
  },
  byeText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    color: '#444',
  },
});
