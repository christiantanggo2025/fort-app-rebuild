// SECTION 1 – Imports and State
//---------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

//---------------------------------------------------
// SECTION 2 – Logic and Helper Functions
//---------------------------------------------------

const ScheduleCreatorScreen = () => {
  const navigation = useNavigation();
  const [matchDate, setMatchDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [configDropdownVisible, setConfigDropdownVisible] = useState(false);
  const [dayDropdownVisible, setDayDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      const { data } = await supabase.from("league_settings").select("*");
      setConfigs(data || []);
    };
    fetchConfigs();
  }, []);

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const generateSchedule = async () => {
    console.log("⚙️ generateSchedule triggered");

    if (!selectedConfig || !selectedDay) return;

    const dateStr = `${matchDate.getFullYear()}-${(matchDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${matchDate.getDate().toString().padStart(2, '0')}`;
    console.log("📅 Match Date (formatted):", dateStr);

    try {
      const { data: allTeams } = await supabase.from("teams").select("team_name, day");
      const { data: absences } = await supabase
        .from("absences")
        .select("team_name, absence_date")
        .eq("absence_date", dateStr);

      const absentTeams = absences?.map((a) => a.team_name) || [];
      console.log("❌ Absent teams from Supabase:", absentTeams);

      const eligibleTeams = allTeams
        .filter((t) => t.day === selectedDay && !absentTeams.includes(t.team_name))
        .map((t) => t.team_name);

      let maxCourtsPerRound = 4;
      if (eligibleTeams.length < 8) {
        maxCourtsPerRound = 3;
        Alert.alert("⚠️ Reduced Court Mode", `Only ${eligibleTeams.length} teams available. Scheduling with 3 courts.`);
}


      const teamMatches = {};
      const recentOpponents = {};
      const playedPairs = new Set();
      const matchSchedule = [];
      let extraMatchUsed = false;
      let roundCounter = 1;

      eligibleTeams.forEach((team) => {
        teamMatches[team] = 0;
        recentOpponents[team] = [];
      });

      while (true) {
        const underScheduled = eligibleTeams.filter((t) => teamMatches[t] < 6);
        if (underScheduled.length === 0) break;

        const usedThisRound = new Set();
        const matchesThisRound = [];

        // Sort by fewest matches, shuffle within priority
        const priorityList = shuffle([...underScheduled]).sort(
          (a, b) => teamMatches[a] - teamMatches[b]
        );

        for (let i = 0; i < priorityList.length; i++) {
          const t1 = priorityList[i];
          if (usedThisRound.has(t1)) continue;

          for (let j = i + 1; j < priorityList.length; j++) {
            const t2 = priorityList[j];
            if (usedThisRound.has(t2)) continue;

            const pairKey = [t1, t2].sort().join("-");
            const tooRecent = recentOpponents[t1].includes(t2) || recentOpponents[t2].includes(t1);

            if (!playedPairs.has(pairKey) && !tooRecent) {
              matchesThisRound.push({
                round: roundCounter,
                court: matchesThisRound.length + 1,
                team1: t1,
                team2: t2,
              });
              teamMatches[t1]++;
              teamMatches[t2]++;
              playedPairs.add(pairKey);
              usedThisRound.add(t1);
              usedThisRound.add(t2);
              recentOpponents[t1].unshift(t2);
              recentOpponents[t2].unshift(t1);
              recentOpponents[t1] = recentOpponents[t1].slice(0, 3);
              recentOpponents[t2] = recentOpponents[t2].slice(0, 3);
              break;
            }

            if (matchesThisRound.length === 4) break;
          }

          if (matchesThisRound.length === 4) break;
        }

        // Helpers for stragglers (only one team can hit 7)
        if (matchesThisRound.length < 4 && !extraMatchUsed) {
          const stragglers = eligibleTeams.filter(
            (t) => teamMatches[t] < 6 && !usedThisRound.has(t)
          );
          const helpers = eligibleTeams.filter(
            (t) => teamMatches[t] === 6 && !usedThisRound.has(t)
          );

          for (let s of stragglers) {
            for (let h of helpers) {
              const pairKey = [s, h].sort().join("-");
              const tooRecent = recentOpponents[s].includes(h) || recentOpponents[h].includes(s);

              if (!playedPairs.has(pairKey) && !tooRecent) {
                matchesThisRound.push({
                  round: roundCounter,
                  court: matchesThisRound.length + 1,
                  team1: s,
                  team2: h,
                });

                teamMatches[s]++;
                teamMatches[h]++; // This makes h reach 7
                extraMatchUsed = true;

                playedPairs.add(pairKey);
                usedThisRound.add(s);
                usedThisRound.add(h);
                recentOpponents[s].unshift(h);
                recentOpponents[h].unshift(s);
                recentOpponents[s] = recentOpponents[s].slice(0, 3);
                recentOpponents[h] = recentOpponents[h].slice(0, 3);
                break;
              }
            }
            if (extraMatchUsed || matchesThisRound.length === 4) break;
          }
        }

        // Fallback – allow rematches if needed
        if (matchesThisRound.length < 4) {
          const fallbackList = shuffle(
            eligibleTeams.filter((t) => teamMatches[t] < 6 && !usedThisRound.has(t))
          );

          for (let i = 0; i < fallbackList.length; i++) {
            const t1 = fallbackList[i];
            if (usedThisRound.has(t1)) continue;

            for (let j = i + 1; j < fallbackList.length; j++) {
              const t2 = fallbackList[j];
              if (usedThisRound.has(t2)) continue;

              matchesThisRound.push({
                round: roundCounter,
                court: matchesThisRound.length + 1,
                team1: t1,
                team2: t2,
              });
              teamMatches[t1]++;
              teamMatches[t2]++;
              playedPairs.add([t1, t2].sort().join("-"));
              usedThisRound.add(t1);
              usedThisRound.add(t2);
              break;
            }

            if (matchesThisRound.length === 4) break;
          }
        }

        if (matchesThisRound.length === 0) break;

        matchSchedule.push(...matchesThisRound);
        roundCounter++;
      }

      console.log("📊 Final match counts:", teamMatches);
      console.log("📋 Full schedule:", JSON.stringify(matchSchedule, null, 2));
      setSchedule(matchSchedule);

      const matchCountTable = Object.entries(teamMatches)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([team, count]) => {
          const name = team.padEnd(20, " ");
          const value = String(count).padStart(2, " ");
          return `${name}${value}`;
        })
        .join("\n");

      Alert.alert("✅ Schedule Generated", matchCountTable);
    } catch (err) {
      console.error("❌ Schedule error:", err);
      Alert.alert("Error", "Something went wrong while generating the schedule.");
    }
  };

//---------------------------------------------------
// SECTION 3 – JSX Return and Styles
//---------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Schedule Manager</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Select Config:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setConfigDropdownVisible(!configDropdownVisible)}
        >
          <Text>{selectedConfig?.name || "Choose config"}</Text>
        </TouchableOpacity>
        {configDropdownVisible &&
          configs.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedConfig(c);
                setConfigDropdownVisible(false);
              }}
            >
              <Text>{c.name}</Text>
            </TouchableOpacity>
          ))}

        <Text style={styles.label}>Select League Day:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDayDropdownVisible(!dayDropdownVisible)}
        >
          <Text>{selectedDay || "Choose day"}</Text>
        </TouchableOpacity>
        {dayDropdownVisible &&
          allDays.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedDay(d);
                setDayDropdownVisible(false);
              }}
            >
              <Text>{d}</Text>
            </TouchableOpacity>
          ))}

        <Text style={styles.label}>Select Match Date:</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{matchDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={matchDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setMatchDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.generateButton} onPress={generateSchedule}>
          <Text style={styles.generateButtonText}>Generate Schedule</Text>
        </TouchableOpacity>

        {schedule.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.label}>Match Schedule</Text>

            {schedule.map((match, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "bold" }}>
                  Round {match.round} – Court {match.court}
                </Text>
                <Text>
                  {match.team1} vs {match.team2}
                </Text>
              </View>
            ))}

            {/* POST BUTTON */}
            <TouchableOpacity
              style={styles.postButton}
              onPress={postScheduleToSupabase}
            >
              <Text style={styles.postButtonText}>Post Schedule to Supabase</Text>
            </TouchableOpacity>
          </View>
          )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 60,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#000" },
  container: { paddingHorizontal: 60, paddingBottom: 60 },
  label: { fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  generateButton: {
    backgroundColor: "#008080",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  generateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ScheduleCreatorScreen;

// ------------------------
// SECTION 4 – Supabase Save Logic
// ------------------------

const saveScheduleToSupabase = async (schedule, matchDate) => {
  try {
    const formattedDate = matchDate.toISOString().split('T')[0];

    // Step 1: Delete any existing matches for this date
    const { error: deleteError } = await supabase
      .from('match_schedule')
      .delete()
      .eq('match_date', formattedDate);

    if (deleteError) {
      console.error('❌ Error deleting old schedule:', deleteError);
      return;
    }

    // Step 2: Insert new schedule
    const insertData = schedule.map((match) => ({
      round: match.round,
      court: match.court,
      team1: match.team1,
      team2: match.team2,
      match_date: formattedDate,
    }));

    const { error: insertError } = await supabase
      .from('match_schedule')
      .insert(insertData);

    if (insertError) {
      console.error('❌ Error saving new schedule:', insertError);
    } else {
      console.log('✅ Schedule successfully saved to Supabase');
    }
  } catch (err) {
    console.error('❌ Unexpected error in saveScheduleToSupabase:', err);
  }
};

const postScheduleToSupabase = async () => {
  if (schedule.length === 0) {
    Alert.alert("No schedule to post");
    return;
  }

  const formattedDate = matchDate.toISOString().split("T")[0];

  const insertData = schedule.map((match) => ({
    match_date: formattedDate,
    round: match.round,
    court: match.court,
    team1: match.team1,
    team2: match.team2,
    is_posted: true,
  }));

  const { error } = await supabase.from("schedules").insert(insertData);

  if (error) {
    console.error("❌ Error posting schedule:", error);
    Alert.alert("Error", "Could not post schedule.");
  } else {
    Alert.alert("✅ Schedule posted to Supabase");
    navigation.goBack();
  }
};
