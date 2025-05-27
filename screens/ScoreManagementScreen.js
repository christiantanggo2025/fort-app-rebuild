import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function ScoreManagementScreen() {
  const navigation = useNavigation();
  const [submissions, setSubmissions] = useState([]);
  const [filterType, setFilterType] = useState('conflict');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingScores, setEditingScores] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('score_submissions')
      .select(`
        *,
        schedules (
          team1,
          team2
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      Alert.alert('Error fetching scores');
      return;
    }

    setSubmissions(data);
  };

  const approveScore = async (submission) => {
    const { error } = await supabase
      .from('score_submissions')
      .update({ is_approved: true })
      .eq('match_id', submission.match_id)
      .eq('submitted_by', submission.submitted_by);

    if (error) {
      Alert.alert('Error approving score');
      return;
    }

    Alert.alert('✅ Score approved');
    fetchSubmissions();
  };

  const saveEditedScore = async (s) => {
    const edited = editingScores[s.match_id]?.[s.submitted_by];
    if (!edited) return;

    const { error } = await supabase
      .from('score_submissions')
      .update({
        team1_score: parseInt(edited.team1),
        team2_score: parseInt(edited.team2),
      })
      .eq('match_id', s.match_id)
      .eq('submitted_by', s.submitted_by);

    if (error) {
      Alert.alert('Error saving score');
      return;
    }

    Alert.alert('✅ Score updated');
    setEditingScores((prev) => {
      const copy = { ...prev };
      delete copy[s.match_id]?.[s.submitted_by];
      return copy;
    });
    fetchSubmissions();
  };

  const handleEditChange = (match_id, submitted_by, teamKey, value) => {
    setEditingScores((prev) => ({
      ...prev,
      [match_id]: {
        ...prev[match_id],
        [submitted_by]: {
          ...prev[match_id]?.[submitted_by],
          [teamKey]: value.replace(/[^0-9]/g, ''),
        },
      },
    }));
  };

  const groupByMatch = (list) => {
    const grouped = {};
    for (let s of list) {
      if (!grouped[s.match_id]) grouped[s.match_id] = [];
      grouped[s.match_id].push(s);
    }
    return grouped;
  };

  const filtered = submissions.filter((s) =>
    s.submitted_by.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const grouped = groupByMatch(filtered);

  const matchesToShow = Object.entries(grouped).filter(([match_id, subs]) => {
    const bothSubmitted = subs.length === 2;
    const allApproved = subs.every((s) => s.is_approved);
    const conflict =
      bothSubmitted &&
      (subs[0].team1_score !== subs[1].team1_score ||
        subs[0].team2_score !== subs[1].team2_score);

    if (filterType === 'conflict') return conflict;
    if (filterType === 'approved') return allApproved;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Score Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            filterType === 'conflict' && styles.toggleActive,
          ]}
          onPress={() => setFilterType('conflict')}
        >
          <Text
            style={[
              styles.toggleText,
              filterType === 'conflict' && styles.toggleTextActive,
            ]}
          >
            Score Conflicts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            filterType === 'approved' && styles.toggleActive,
          ]}
          onPress={() => setFilterType('approved')}
        >
          <Text
            style={[
              styles.toggleText,
              filterType === 'approved' && styles.toggleTextActive,
            ]}
          >
            Approved Scores
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by team name..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {matchesToShow.length === 0 ? (
          <Text style={styles.placeholderText}>No matches found.</Text>
        ) : (
          matchesToShow.map(([match_id, subs]) => {
            const isApproved = subs.every((s) => s.is_approved);
            const conflict =
              subs.length === 2 &&
              (subs[0].team1_score !== subs[1].team1_score ||
                subs[0].team2_score !== subs[1].team2_score);

            return (
              <View key={match_id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  Match ID: {match_id.substring(0, 8)}...
                </Text>
                {subs.map((s, idx) => {
                  const isEditing = !!editingScores[s.match_id]?.[s.submitted_by];
                  const edit = editingScores[s.match_id]?.[s.submitted_by] || {};
                  return (
                    <View key={idx} style={styles.scoreBlock}>
                      {isEditing ? (
                        <>
                          <Text>{s.schedules?.team1}:</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={edit.team1 || s.team1_score.toString()}
                            onChangeText={(val) =>
                              handleEditChange(s.match_id, s.submitted_by, 'team1', val)
                            }
                          />
                          <Text>{s.schedules?.team2}:</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={edit.team2 || s.team2_score.toString()}
                            onChangeText={(val) =>
                              handleEditChange(s.match_id, s.submitted_by, 'team2', val)
                            }
                          />
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => saveEditedScore(s)}
                          >
                            <Text style={styles.approveText}>Save</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Text style={styles.scoreText}>
                            {s.schedules?.team1}: {s.team1_score}
                          </Text>
                          <Text style={styles.scoreText}>
                            {s.schedules?.team2}: {s.team2_score}
                          </Text>
                        </>
                      )}

                      <Text style={styles.submittedBy}>
                        Submitted by: {s.submitted_by}
                      </Text>

                      {!s.is_approved && !isEditing && (
                        <>
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => approveScore(s)}
                          >
                            <Text style={styles.approveText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() =>
                              setEditingScores((prev) => ({
                                ...prev,
                                [s.match_id]: {
                                  ...prev[s.match_id],
                                  [s.submitted_by]: {
                                    team1: s.team1_score.toString(),
                                    team2: s.team2_score.toString(),
                                  },
                                },
                              }))
                            }
                          >
                            <Text style={styles.approveText}>Edit</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}

                {conflict && (
                  <Text style={styles.conflict}>⚠️ Score Conflict</Text>
                )}
                {isApproved && (
                  <Text style={styles.approved}>✅ Approved</Text>
                )}
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 10,
  },
  toggleButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  toggleActive: {
    backgroundColor: '#008080',
  },
  toggleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#008080',
  },
  toggleTextActive: {
    color: '#fff',
  },
  searchInput: {
    margin: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scrollContainer: { paddingBottom: 80 },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  scoreBlock: { marginBottom: 10 },
  scoreText: { fontSize: 16, marginBottom: 2 },
  submittedBy: { fontStyle: 'italic', marginBottom: 6 },
  approveBtn: {
    backgroundColor: '#008080',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  editBtn: {
    backgroundColor: '#999',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  approveText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  conflict: { color: 'red', fontWeight: 'bold', marginTop: 10 },
  approved: { color: 'green', fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
});
