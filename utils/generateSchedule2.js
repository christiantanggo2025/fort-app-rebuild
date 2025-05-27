import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

export const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export const generateSchedule = async ({ selectedConfig, selectedDay, matchDate }) => {
  console.log("⚙️ generateSchedule triggered");

  if (!selectedConfig || !selectedDay || !matchDate) {
    Alert.alert("Missing Info", "Select day, config, and date.");
    return [];
  }

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
    const eligibleTeams = allTeams
      .filter((t) => t.day === selectedDay && !absentTeams.includes(t.team_name))
      .map((t) => t.team_name);

    const maxCourtsPerRound = 4;
    const maxMatchesPerTeam = 6;

    const teamMatches = {};
    const previousRoundMatches = new Set();
    const allPairs = new Set();
    const schedule = [];

    eligibleTeams.forEach((team) => {
      teamMatches[team] = 0;
    });

    let round = 1;
    let overflowSafety = 0;

    while (true) {
      const underplayed = eligibleTeams
        .filter((team) => teamMatches[team] < maxMatchesPerTeam)
        .sort((a, b) => teamMatches[a] - teamMatches[b]);

      if (underplayed.length < 2) break;

      const usedThisRound = new Set();
      const matchesThisRound = [];

      for (let i = 0; i < underplayed.length; i++) {
        const t1 = underplayed[i];
        if (usedThisRound.has(t1)) continue;

        for (let j = i + 1; j < underplayed.length; j++) {
          const t2 = underplayed[j];
          if (usedThisRound.has(t2)) continue;

          const pairKey = [t1, t2].sort().join("-");
          if (previousRoundMatches.has(pairKey)) continue;

          matchesThisRound.push({
            round,
            court: matchesThisRound.length + 1,
            team1: t1,
            team2: t2,
          });

          teamMatches[t1]++;
          teamMatches[t2]++;
          allPairs.add(pairKey);
          usedThisRound.add(t1);
          usedThisRound.add(t2);

          break; // move to next t1
        }

        if (matchesThisRound.length >= maxCourtsPerRound) break;
      }

      if (matchesThisRound.length === 0) {
        overflowSafety++;
        if (overflowSafety > 3) {
          console.warn("⚠️ Could not complete schedule. Ending generation.");
          break;
        } else {
          console.warn("⚠️ Unable to fill a full round. Attempting final overflow round...");
          round++;
          continue;
        }
      }

      // Fill incomplete round with duplicates if needed
      if (matchesThisRound.length < maxCourtsPerRound) {
        const fillerCandidates = eligibleTeams.filter((t) => teamMatches[t] < maxMatchesPerTeam);
        const fillerShuffled = shuffle(fillerCandidates);

        for (let i = 0; i < fillerShuffled.length; i++) {
          const t1 = fillerShuffled[i];
          if (usedThisRound.has(t1)) continue;

          for (let j = i + 1; j < fillerShuffled.length; j++) {
            const t2 = fillerShuffled[j];
            if (usedThisRound.has(t2)) continue;

            const pairKey = [t1, t2].sort().join("-");
            if (previousRoundMatches.has(pairKey)) continue;

            matchesThisRound.push({
              round,
              court: matchesThisRound.length + 1,
              team1: t1,
              team2: t2,
            });

            teamMatches[t1]++;
            teamMatches[t2]++;
            allPairs.add(pairKey);
            usedThisRound.add(t1);
            usedThisRound.add(t2);
            break;
          }

          if (matchesThisRound.length >= maxCourtsPerRound) break;
        }
      }

      // Final fallback — allow any duplicate to finish filling the round
      if (matchesThisRound.length < maxCourtsPerRound) {
        const fillTeams = eligibleTeams.filter((t) => teamMatches[t] < maxMatchesPerTeam);

        for (let i = 0; i < fillTeams.length; i++) {
          const t1 = fillTeams[i];
          if (usedThisRound.has(t1)) continue;

          for (let j = i + 1; j < fillTeams.length; j++) {
            const t2 = fillTeams[j];
            if (usedThisRound.has(t2)) continue;

            const pairKey = [t1, t2].sort().join("-");

            matchesThisRound.push({
              round,
              court: matchesThisRound.length + 1,
              team1: t1,
              team2: t2,
            });

            teamMatches[t1]++;
            teamMatches[t2]++;
            usedThisRound.add(t1);
            usedThisRound.add(t2);
            break;
          }

          if (matchesThisRound.length >= maxCourtsPerRound) break;
        }
      }

      // Final push to schedule
      matchesThisRound.forEach((m) =>
        previousRoundMatches.add([m.team1, m.team2].sort().join("-"))
      );

      schedule.push(...matchesThisRound);
      round++;
    }

    console.log("📊 Final match counts:", teamMatches);
    console.log("📋 Full schedule:", JSON.stringify(schedule, null, 2));

    const matchCountTable = Object.entries(teamMatches)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([team, count]) => `${team.padEnd(20)} ${String(count).padStart(2)}`)
      .join("\n");

    Alert.alert("✅ Schedule Generated", matchCountTable);
    return schedule;
  } catch (err) {
    console.error("❌ Schedule error:", err);
    Alert.alert("Error", "Something went wrong while generating the schedule.");
    return [];
  }
};
