import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

const SubmitScoresScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const team = route.params?.team;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [editing, setEditing] = useState({});
  const [timezone, setTimezone] = useState("America/Toronto");

  useEffect(() => {
    fetchTimezone();
  }, []);

  useEffect(() => {
    if (team?.team_name && selectedDate) {
      fetchMatchesAndSubmissions();
    }
  }, [selectedDate, timezone]);

  const fetchTimezone = async () => {
    const { data, error } = await supabase.from("timezone_settings").select("*").single();
    if (data?.timezone) setTimezone(data.timezone);
  };

  const fetchMatchesAndSubmissions = async () => {
    const formattedDate = selectedDate.toISOString().split("T")[0];

    const { data: matchData, error: matchError } = await supabase
      .from("schedules")
      .select("*")
      .eq("match_date", formattedDate)
      .or(`team1.eq.${team.team_name},team2.eq.${team.team_name}`);

    if (matchError) {
      Alert.alert("Error loading matches.");
      console.error(matchError);
      return;
    }

    setMatches(matchData);

    const matchIds = matchData.map((m) => m.id);
    const { data: subData, error: subError } = await supabase
      .from("score_submissions")
      .select("*")
      .in("match_id", matchIds);

    if (subError) {
      Alert.alert("Error loading submissions.");
      console.error(subError);
      return;
    }

    const byMatch = {};
    subData.forEach((entry) => {
      if (!byMatch[entry.match_id]) byMatch[entry.match_id] = [];
      byMatch[entry.match_id].push(entry);
    });

    setSubmissions(byMatch);
  };

  const isLockedOut = (matchDateStr) => {
    const matchDate = new Date(matchDateStr);
    const now = new Date();

    const isSameDay =
      matchDate.getFullYear() === now.getFullYear() &&
      matchDate.getMonth() === now.getMonth() &&
      matchDate.getDate() === now.getDate();

    if (isSameDay) {
      return now.getHours() < 18;
    }

    return false;
  };

  const handleScoreInput = (matchId, field, value) => {
    const num = value.replace(/[^0-9]/g, "");
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: num,
      },
    }));
  };

  const saveOrUpdateScore = async (match) => {
    const entry = scores[match.id];
    if (!entry || entry.team1Score === "" || entry.team2Score === "") {
      Alert.alert("Enter both scores before saving.");
      return;
    }

    if (isLockedOut(match.match_date)) {
      Alert.alert("Scores cannot be submitted until 6PM on game day.");
      return;
    }

    const payload = {
      match_id: match.id,
      submitted_by: team.team_name,
      team1_score: parseInt(entry.team1Score),
      team2_score: parseInt(entry.team2Score),
      winner:
        parseInt(entry.team1Score) > parseInt(entry.team2Score)
          ? match.team1
          : parseInt(entry.team2Score) > parseInt(entry.team1Score)
          ? match.team2
          : "Draw",
      is_approved: false,
    };

    const { error } = await supabase
      .from("score_submissions")
      .upsert(payload, {
        onConflict: ["match_id", "submitted_by"],
      });

    if (error) {
      Alert.alert("Error saving score.");
      console.error(error);
      return;
    }

    Alert.alert("✅ Score saved.");
    setEditing((prev) => ({ ...prev, [match.id]: false }));
    fetchMatchesAndSubmissions();
  };

  const getMatchStatus = (matchId) => {
    const subs = submissions[matchId] || [];
    const thisTeam = subs.find((s) => s.submitted_by === team.team_name);
    const otherTeam = subs.find((s) => s.submitted_by !== team.team_name);

    if (thisTeam && otherTeam) {
      if (
        thisTeam.team1_score === otherTeam.team1_score &&
        thisTeam.team2_score === otherTeam.team2_score
      ) {
        return "approved";
      } else {
        return "conflict";
      }
    } else if (thisTeam) {
      return "waiting";
    }

    return "unsubmitted";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Scores</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subheading}>For {team?.team_name}</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{selectedDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, newDate) => {
              setShowDatePicker(false);
              if (newDate) setSelectedDate(newDate);
            }}
          />
        )}

        {matches.length === 0 ? (
          <Text style={{ marginTop: 20 }}>No matches scheduled for this date.</Text>
        ) : (
          matches.map((match) => {
            const status = getMatchStatus(match.id);
            const thisTeamSubmission = (submissions[match.id] || []).find(
              (s) => s.submitted_by === team.team_name
            );

            const isEditing = editing[match.id] || false;
            const isLocked = !!thisTeamSubmission && !isEditing;
            const entry = isLocked
              ? {
                  team1Score: thisTeamSubmission.team1_score.toString(),
                  team2Score: thisTeamSubmission.team2_score.toString(),
                }
              : scores[match.id] || {};

            const lockedOut = isLockedOut(match.match_date);

            return (
              <View key={match.id} style={styles.matchCard}>
                <Text style={styles.matchText}>
                  Round {match.round} – Court {match.court}
                </Text>
                <Text style={styles.matchText}>
                  {match.team1} vs {match.team2}
                </Text>
                <Text style={styles.matchText}>Date: {match.match_date}</Text>

                <View style={styles.inputRow}>
                  <TextInput
                    placeholder={`${match.team1} Score`}
                    keyboardType="numeric"
                    editable={!lockedOut && (!isLocked || isEditing)}
                    value={entry.team1Score || ""}
                    onChangeText={(val) => handleScoreInput(match.id, "team1Score", val)}
                    style={[styles.input, lockedOut && styles.locked]}
                  />
                  <Text style={{ marginHorizontal: 8 }}>–</Text>
                  <TextInput
                    placeholder={`${match.team2} Score`}
                    keyboardType="numeric"
                    editable={!lockedOut && (!isLocked || isEditing)}
                    value={entry.team2Score || ""}
                    onChangeText={(val) => handleScoreInput(match.id, "team2Score", val)}
                    style={[styles.input, lockedOut && styles.locked]}
                  />
                </View>

                {lockedOut && (
                  <Text style={styles.statusConflict}>
                    Score entry opens at 6:00PM on game day.
                  </Text>
                )}

                {isLocked ? (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditing((prev) => ({ ...prev, [match.id]: true }))}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveOrUpdateScore(match)}
                  >
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                )}

                {status === "approved" && (
                  <Text style={styles.statusApproved}>✅ Score Approved</Text>
                )}
                {status === "waiting" && (
                  <Text style={styles.statusWaiting}>⏳ Waiting for other team</Text>
                )}
                {status === "conflict" && (
                  <Text style={styles.statusConflict}>⚠️ Conflicting Scores</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginRight: 32,
  },
  container: { padding: 20, paddingBottom: 80 },
  subheading: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  matchCard: {
    padding: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 16,
  },
  matchText: { fontSize: 16, marginBottom: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  locked: {
    backgroundColor: "#e0e0e0",
    color: "#999",
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#008080",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  editButton: {
    marginTop: 10,
    backgroundColor: "#aaa",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: { color: "#fff", fontWeight: "bold" },
  statusApproved: { marginTop: 10, color: "green", fontWeight: "bold" },
  statusWaiting: { marginTop: 10, color: "#555" },
  statusConflict: { marginTop: 10, color: "red", fontWeight: "bold" },
});

export default SubmitScoresScreen;
