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
import { generateSchedule } from "../utils/generateSchedule";

const ScheduleCreatorScreen = () => {
  const navigation = useNavigation();
  const [matchDate, setMatchDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [configDropdownVisible, setConfigDropdownVisible] = useState(false);
  const [dayDropdownVisible, setDayDropdownVisible] = useState(false);
  const [absentTeams, setAbsentTeams] = useState([]);
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchConfigs = async () => {
      const { data } = await supabase.from("league_settings").select("*");
      setConfigs(data || []);
    };
    fetchConfigs();
  }, []);

  const handleGenerate = async () => {
    if (!selectedConfig) {
      Alert.alert("Error", "No config selected.");
      return;
    }

    if (!selectedDay) {
      Alert.alert("Error", "No day selected.");
      return;
    }

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("day", selectedDay);

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      Alert.alert("Error fetching teams");
      return;
    }

    const structuredTeams = data.map((team) => ({
      name: team.team_name,
      rank: team.average_score || 0,
    }));

    const dateStr = `${matchDate.getFullYear()}-${(matchDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${matchDate.getDate().toString().padStart(2, "0")}`;

    const { data: absences } = await supabase
      .from("absences")
      .select("team_name")
      .eq("absence_date", dateStr);

    const absentNames = absences?.map((a) => a.team_name) || [];
    setAbsentTeams(absentNames.sort());

    const eligibleTeams = structuredTeams.filter((t) => !absentNames.includes(t.name));

    const result = await generateSchedule({
      configName: selectedConfig.name,
      day: selectedDay,
      matchDate,
      teamCount: eligibleTeams.length,
      teams: eligibleTeams,
    });

    if (result && result.length > 0) {
      setSchedule(result);

      const matchCountMap = {};
      result.forEach((match) => {
        [match.team1, match.team2].forEach((team) => {
          matchCountMap[team] = (matchCountMap[team] || 0) + 1;
        });
      });

      const matchSummary = Object.entries(matchCountMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([team, count]) => `${team.padEnd(15)} ${count}`)
        .join("\n");

      Alert.alert("Schedule Generated", matchSummary);
    } else {
      Alert.alert("⚠️ Failed to generate schedule.");
    }
  };

  const postScheduleToSupabase = async () => {
    if (!schedule || !schedule.length) {
      Alert.alert("Error", "Please generate a schedule first.");
      return;
    }

    const formattedDate = `${matchDate.getFullYear()}-${(matchDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${matchDate.getDate().toString().padStart(2, "0")}`;

    try {
      const { data: existing, error } = await supabase
        .from("schedules")
        .select("id")
        .gte("match_date", `${formattedDate}T00:00:00`)
        .lte("match_date", `${formattedDate}T23:59:59.999`);

      if (error) {
        console.error("❌ Supabase lookup error:", error);
        Alert.alert("Error", "Could not check existing schedules.");
        return;
      }

      if (existing.length > 0) {
        Alert.alert(
          "Schedule Already Exists",
          "A schedule already exists for this date. Do you want to overwrite it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Overwrite",
              style: "destructive",
              onPress: async () => {
                const { error: deleteError } = await supabase
                  .from("schedules")
                  .delete()
                  .gte("match_date", `${formattedDate}T00:00:00`)
                  .lte("match_date", `${formattedDate}T23:59:59.999`);

                if (deleteError) {
                  console.error("❌ Delete error:", deleteError);
                  Alert.alert("Error deleting existing schedule.");
                  return;
                }

                await uploadSchedule(formattedDate);
              },
            },
          ]
        );
      } else {
        await uploadSchedule(formattedDate);
      }
    } catch (e) {
      console.error("❌ Post schedule error:", e);
      Alert.alert("Unexpected error occurred.");
    }
  };

  const uploadSchedule = async (date) => {
    const { error } = await supabase.from("schedules").insert(
      schedule.map((match) => ({
        team1: match.team1,
        team2: match.team2,
        round: match.round,
        court: match.court,
        match_date: date,
        day: selectedDay,
        is_posted: true, // ✅ Required to show in print screen
      }))
    );

    if (error) {
      console.error("❌ Upload error:", error);
      Alert.alert("Error uploading schedule.");
    } else {
      Alert.alert("✅ Schedule posted successfully!");
      await autoSubmitForAbsentTeams(date);
    }
  };

  const autoSubmitForAbsentTeams = async (date) => {
    const matchesToScore = schedule.filter(
      (match) => absentTeams.includes(match.team1) || absentTeams.includes(match.team2)
    );

    const submissions = matchesToScore.map((match) => {
      const isTeam1Absent = absentTeams.includes(match.team1);
      const isTeam2Absent = absentTeams.includes(match.team2);

      return {
        match_id: null,
        submitted_by: "system",
        team1_score: isTeam1Absent ? 0 : 1,
        team2_score: isTeam2Absent ? 0 : 1,
        winner_team:
          isTeam1Absent && !isTeam2Absent
            ? match.team2
            : isTeam2Absent && !isTeam1Absent
            ? match.team1
            : "Draw",
        is_approved: true,
        team1: match.team1,
        team2: match.team2,
      };
    });

    const { data: scheduleData, error } = await supabase
      .from("schedules")
      .select("id, team1, team2")
      .eq("match_date", date);

    if (error || !scheduleData) {
      console.error("❌ Could not fetch posted schedule to link IDs");
      return;
    }

    for (const s of submissions) {
      const match = scheduleData.find(
        (m) =>
          (m.team1 === s.team1 && m.team2 === s.team2) ||
          (m.team1 === s.team2 && m.team2 === s.team1)
      );
      if (match) s.match_id = match.id;
    }

    const finalSubmissions = submissions.filter((s) => s.match_id);

    if (finalSubmissions.length > 0) {
      const { error: submitError } = await supabase
        .from("score_submissions")
        .insert(finalSubmissions);

      if (submitError) {
        console.error("❌ Failed to auto-submit scores:", submitError);
      } else {
        console.log("✅ Auto-submitted scores for absent teams");
      }
    }
  };

  const renderScheduleByRound = () => {
    const grouped = {};
    schedule.forEach((match) => {
      if (!grouped[match.round]) grouped[match.round] = [];
      grouped[match.round].push(match);
    });

    return Object.keys(grouped).map((round) => (
      <View key={round} style={{ marginBottom: 16 }}>
        <Text style={styles.roundHeader}>Round {round}</Text>
        {grouped[round].map((match, index) => (
          <Text key={index} style={styles.matchText}>
            Court {match.court} - {match.team1} vs {match.team2}
          </Text>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Schedule Creator</Text>
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
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setMatchDate(date);
            }}
          />
        )}

        <TouchableOpacity style={styles.tealButton} onPress={handleGenerate}>
          <Text style={styles.buttonText}>Generate Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tealButton} onPress={postScheduleToSupabase}>
          <Text style={styles.buttonText}>Post Schedule</Text>
        </TouchableOpacity>

        {schedule.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.label}>Match Schedule</Text>
            {renderScheduleByRound()}

            {absentTeams.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Absent:</Text>
                {absentTeams.map((team, index) => (
                  <Text key={index} style={styles.matchText}>- {team}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  label: {
    marginTop: 16,
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdown: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 8,
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    marginTop: 2,
    borderRadius: 4,
  },
  tealButton: {
    marginTop: 20,
    backgroundColor: "#008080",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  roundHeader: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "bold",
    fontSize: 16,
  },
  matchText: {
    marginLeft: 8,
    fontSize: 15,
  },
});

export default ScheduleCreatorScreen;
