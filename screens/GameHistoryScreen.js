import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const GameHistoryScreen = ({ navigation, route }) => {
  const team = route.params?.team;
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [searchQuery, history]);

  const fetchHistory = async () => {
    if (!team?.team_name) return;
    setLoading(true);

    const { data, error } = await supabase.rpc(
      'get_approved_matches_for_team',
      { team_input: team.team_name }
    );

    if (error) {
      console.error('❌ Fetch error:', error);
    } else {
      setHistory(data);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
      return;
    }

    const query = searchQuery.toLowerCase();

    const filtered = history.filter((item) => {
      return (
        item.match_date.includes(query) ||
        item.team1.toLowerCase().includes(query) ||
        item.team2.toLowerCase().includes(query)
      );
    });

    setFilteredHistory(filtered);
  };

  const renderMatch = ({ item }) => {
    const isTeam1 = item.team1 === team.team_name;
    const yourScore = isTeam1 ? item.team1_score : item.team2_score;
    const oppScore = isTeam1 ? item.team2_score : item.team1_score;
    const opponent = isTeam1 ? item.team2 : item.team1;

    return (
      <View style={styles.card}>
        <Text style={styles.matchMeta}>
          Round {item.round} • Court {item.court} • {item.match_date}
        </Text>
        <Text style={styles.scoreLine}>
          <Text style={styles.teamName}>{team.team_name}</Text> {yourScore} vs{' '}
          <Text style={styles.teamName}>{opponent}</Text> {oppScore}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game History</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by date or team name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#aaa"
      />

      {/* Match List */}
      {loading ? (
        <ActivityIndicator size="large" color="#008080" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    color: '#000',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  matchMeta: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  scoreLine: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamName: {
    fontWeight: 'bold',
  },
});

export default GameHistoryScreen;
