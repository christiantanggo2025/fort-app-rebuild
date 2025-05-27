import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const SORT_OPTIONS = {
  ALPHA_ASC: 'A → Z',
  ALPHA_DESC: 'Z → A',
  POINTS_DESC: 'Points ↓',
  POINTS_ASC: 'Points ↑',
};

export default function StandingsScreen() {
  const navigation = useNavigation();
  const [standings, setStandings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.ALPHA_ASC);

  useEffect(() => {
    fetchStandings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, standings, sortOption]);

  const fetchStandings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('volleyball_scores_summary')
      .select('*');

    if (error) {
      console.error('❌ Error fetching standings:', error);
    } else {
      setStandings(data);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let result = standings.filter(
      (t) => t.team_name && t.team_name.trim() !== ''
    );

    if (search.trim() !== '') {
      const query = search.toLowerCase();
      result = result.filter((team) =>
        team.team_name.toLowerCase().includes(query)
      );
    }

    switch (sortOption) {
      case SORT_OPTIONS.ALPHA_ASC:
        result.sort((a, b) => a.team_name.localeCompare(b.team_name));
        break;
      case SORT_OPTIONS.ALPHA_DESC:
        result.sort((a, b) => b.team_name.localeCompare(a.team_name));
        break;
      case SORT_OPTIONS.POINTS_DESC:
        result.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        break;
      case SORT_OPTIONS.POINTS_ASC:
        result.sort((a, b) => (a.points ?? 0) - (b.points ?? 0));
        break;
    }

    setFiltered(result);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Standings</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by team name..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Legend */}
      <View style={styles.legendBox}>
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: 'bold' }}>Matches Played:</Text> Total matches your team has participated in{'\n'}
          <Text style={{ fontWeight: 'bold' }}>W – L:</Text> Number of Wins and Losses{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Scored:</Text> Points your team scored{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Conceded:</Text> Points scored against your team{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Points:</Text> Leaderboard total (3 per win, 1 per draw)
        </Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {Object.entries(SORT_OPTIONS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.sortButton,
              sortOption === label && styles.activeSortButton,
            ]}
            onPress={() => setSortOption(label)}
          >
            <Text
              style={[
                styles.sortText,
                sortOption === label && styles.activeSortText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#008080" />
        ) : (
          filtered.map((team, index) => {
            const {
              team_name,
              wins = 0,
              losses = 0,
              games_played = 0,
              points = 0,
              points_scored = 0,
              points_conceded = 0,
            } = team;

            return (
              <View key={team_name} style={styles.row}>
                <Text style={styles.rank}>{index + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.team}>{team_name}</Text>
                  <Text style={styles.details}>
                    Matches Played: {games_played} | W:{wins} L:{losses}
                  </Text>
                  <Text style={styles.details}>
                    Scored: {points_scored} | Conceded: {points_conceded}
                  </Text>
                </View>
                <Text style={styles.points}>{points} pts</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 6,
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  legendBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
  },
  legendText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  activeSortButton: {
    backgroundColor: '#008080',
  },
  sortText: {
    fontSize: 14,
    color: '#000',
  },
  activeSortText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start',
    gap: 8,
  },
  rank: {
    width: 28,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    paddingTop: 2,
  },
  team: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  details: {
    fontSize: 13,
    color: '#444',
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
    textAlign: 'right',
    minWidth: 60,
  },
});
