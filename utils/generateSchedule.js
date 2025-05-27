import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

export const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export const generateSchedule = async ({ configName, day, matchDate, teamCount, teams }) => {
  console.log("⚡ generateSchedule() called with", {
    configName,
    day,
    matchDate,
    teamCount,
  });

  if (!day || !matchDate || !teams || teams.length === 0) {
    Alert.alert("Missing Info", "Select day, config, and date.");
    return [];
  }

  const dateStr = `${matchDate.getFullYear()}-${(matchDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${matchDate.getDate().toString().padStart(2, "0")}`;

  const { data: absences, error: absError } = await supabase
    .from("absences")
    .select("team_name")
    .eq("absence_date", dateStr);

  if (absError) {
    console.error("❌ Absences fetch error:", absError);
    Alert.alert("Error", "Could not check for team absences.");
    return [];
  }

  const absentTeamNames = absences?.map((a) => a.team_name) || [];
  const eligibleTeamObjects = teams.filter((t) => !absentTeamNames.includes(t.name));
  const eligibleTeams = eligibleTeamObjects.map((t) => t.name);

  if (eligibleTeams.length >= 4 && eligibleTeams.length <= 16) {
    return generateScheduleSmall({ day, matchDate, teams: eligibleTeamObjects });
  }

  Alert.alert("Unsupported", "Only 4–16 teams are supported with current hardcoded logic.");
  return [];
};

export const generateScheduleSmall = ({ day, matchDate, teams }) => {
  const schedule = [];
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name);
  });

  const teamMap = {};
  sortedTeams.forEach((team, index) => {
    teamMap[index + 1] = team.name;
  });

  const teamCount = teams.length;
  let rounds = [];

  if (teamCount === 16) {
    rounds = [
      [[1, 2], [3, 4], [5, 6], [7, 8]],
      [[9, 10], [11, 12], [13, 14], [15, 16]],
      [[1, 3], [2, 4], [5, 7], [6, 8]],
      [[9, 11], [10, 12], [13, 15], [14, 16]],
      [[1, 4], [2, 3], [5, 8], [6, 7]],
      [[9, 12], [10, 11], [13, 16], [14, 15]],
      [[1, 5], [2, 6], [3, 7], [4, 8]],
      [[9, 13], [10, 14], [11, 15], [12, 16]],
      [[1, 6], [2, 5], [3, 8], [4, 7]],
      [[9, 14], [10, 13], [11, 16], [12, 15]],
      [[1, 7], [2, 8], [3, 5], [4, 6]],
      [[9, 16], [10, 15], [11, 13], [12, 14]],
    ];
    } else if (teamCount === 15) {
    rounds = [
      [[1, 2], [3, 4], [5, 6], [7, 8]],
      [[9, 10], [11, 12], [13, 14], [15, 8]],
      [[1, 3], [2, 4], [5, 7], [6, 9]],
      [[10, 11], [12, 13], [14, 15], [1, 4]],
      [[2, 3], [5, 8], [6, 7], [9, 11]],
      [[10, 12], [13, 10], [14, 11], [15, 13]],
      [[1, 5], [2, 6], [3, 7], [4, 8]],
      [[9, 12], [14, 10], [15, 11], [1, 6]],
      [[2, 5], [3, 8], [4, 7], [9, 13]],
      [[12, 14], [15, 10], [1, 7], [2, 8]],
      [[3, 5], [4, 6], [9, 14], [11, 13]],
      [[12, 15]],
    ];
  } else if (teamCount === 14) {
    rounds = [
        [[1, 2], [3, 4], [5, 6], [7, 8]],
        [[9, 10], [11, 12], [13, 14], [1, 3]],
        [[2, 4], [5, 7], [6, 8], [9, 11]],
        [[10, 13], [12, 14], [1, 4], [2, 5]],
        [[3, 6], [7, 9], [8, 10], [11, 12]],
        [[13, 14], [1, 5], [2, 6], [3, 7]],
        [[4, 8], [9, 12], [10, 11], [13, 7]],
        [[14, 11], [1, 6], [2, 8], [3, 5]],
        [[4, 9], [10, 7], [12, 8], [13, 11]],
        [[14, 10], [1, 9], [2, 12], [3, 13]],
        [[4, 5], [6, 14]],
    ];
  } else if (teamCount === 13) {
    rounds = [
        [[1, 2], [3, 4], [5, 6], [7, 8]],
        [[9, 10], [11, 12], [13, 1], [2, 3]],
        [[4, 5], [6, 7], [8, 9], [10, 11]],
        [[12, 13], [1, 3], [2, 4], [5, 7]],
        [[6, 8], [9, 11], [10, 12], [13, 7]],
        [[1, 4], [2, 5], [3, 6], [8, 10]],
        [[9, 12], [11, 13], [1, 5], [2, 11]],
        [[3, 7], [4, 8], [9, 13], [10, 6]],
        [[12, 7], [13, 8], [1, 6], [2, 9]],
        [[3, 10], [4, 11], [5, 12]],    
    ];
  } else if (teamCount === 12) {
    rounds = [
        [[1, 2], [3, 4], [5, 6], [7, 8]],      
        [[9, 10], [11, 12], [1, 3], [2, 4]],    
        [[5, 7], [6, 8], [9, 11], [10, 12]],  
        [[1, 4], [2, 5], [3, 6], [7, 9]],     
        [[8, 10], [11, 1], [12, 2], [3, 5]],   
        [[4, 6], [7, 10], [8, 9], [11, 2]],   
        [[12, 1], [3, 7], [4, 5], [6, 9]],      
        [[8, 11], [10, 1], [12, 3], [2, 6]],    
        [[4, 7], [5, 8], [9, 12], [10, 11]],    
    ];
  } else if (teamCount === 11) {
    rounds = [
        [[1, 2], [3, 4], [5, 6], [7, 8]],          // Round 1
        [[9, 10], [1, 11], [2, 3], [4, 5]],        // Round 2
        [[6, 7], [8, 9], [10, 11], [1, 3]],        // Round 3
        [[2, 4], [5, 7], [6, 8], [9, 11]],         // Round 4
        [[10, 1], [2, 5], [3, 6], [4, 7]],         // Round 5
        [[8, 10], [9, 1], [11, 2], [3, 5]],        // Round 6
        [[4, 6], [7, 10], [8, 11], [9, 2]],        // Round 7
        [[1, 8], [3, 7], [4, 9], [5, 10]],         // Round 8
        [[6, 11]],
    ];
  } else if (teamCount === 10) {
    rounds = [
        [[1, 2], [3, 4], [5, 6], [7, 8]],           // Round 1
        [[9, 10], [1, 3], [2, 4], [5, 7]],          // Round 2
        [[6, 8], [9, 1], [10, 2], [3, 5]],          // Round 3
        [[6, 7], [8, 9], [10, 1], [2, 3]],          // Round 4
        [[4, 5], [6, 9], [7, 10], [8, 1]],          // Round 5
        [[4, 6], [5, 2], [3, 7], [8, 10]],          // Round 6
        [[9, 4], [1, 5], [2, 6], [3, 8]],           // Round 7
        [[9, 7], [4, 10]],
    ];
  } else if (teamCount === 9) {
    rounds = [
        [[3, 4], [5, 6], [7, 8], [1, 2]],           // Round 1
        [[1, 3], [2, 9], [5, 7], [6, 8]],           // Round 2
        [[2, 3], [1, 4], [6, 7], [9, 8]],           // Round 3
        [[4, 9], [3, 8], [1, 5], [2, 6]],           // Round 4
        [[1, 7], [3, 5], [6, 9], [4, 2]],           // Round 5
        [[2, 7], [1, 8], [3, 9], [4, 5]],           // Round 6
        [[7, 9], [5, 8], [4, 6]],
    ];
  } else if (teamCount === 8) {
    rounds = [
      [[1, 2], [3, 4], [5, 6], [7, 8]],
      [[2, 4], [1, 3], [6, 8], [5, 7]],
      [[5, 8], [2, 3], [1, 4], [6, 7]],
      [[6, 2], [3, 7], [4, 8], [1, 5]],
      [[6, 1], [4, 5], [2, 7], [3, 8]],
      [[3, 6], [7, 1], [5, 2], [4, 8]],
    ];
  } else if (teamCount === 7) {
    rounds = [
      [[1, 2], [7, 4], [5, 6]],
      [[5, 7], [1, 3], [2, 4]],
      [[2, 5], [1, 4], [3, 6]],
      [[7, 3], [6, 4], [1, 5]],
      [[6, 1], [7, 2], [3, 5]],
      [[3, 2], [4, 6], [7, 1]],
      [[6, 7], [4, 5], [2, 3]],
    ];
  } else if (teamCount === 6) {
    rounds = [
        [[1, 4], [2, 5], [3, 6]],                   // Round 1
        [[1, 6], [2, 4], [3, 5]],                   // Round 2
        [[1, 5], [2, 6], [3, 4]],                   // Round 3
        [[1, 2], [3, 4], [5, 6]],                   // Round 4
        [[1, 3], [2, 5], [6, 4]],                   // Round 5
        [[1, 4], [2, 3], [5, 6]],                   // Round 6
    ];
  } else if (teamCount === 5) {
    rounds = [
      [[3, 4], [1, 2]],
      [[2, 4], [3, 5]],
      [[1, 4], [2, 5]],
      [[2, 3], [1, 5]],
      [[4, 5], [1, 3]],
      [[1, 5], [2, 4]],
      [[1, 3], [5, 2]],
      [[3, 4]],
    ];
  } else if (teamCount === 4) {
    rounds = [
      [[2, 1], [3, 4]],
      [[4, 2], [1, 3]],
      [[1, 4], [2, 3]],
      [[2, 1], [3, 4]],
      [[4, 2], [1, 3]],
      [[1, 4], [2, 3]],
    ];
  } else {
    console.warn("⚠️ No hardcoded schedule found for this team count.");
    return schedule;
  }

  rounds.forEach((courtMatches, roundIndex) => {
    courtMatches.forEach((pair, courtIndex) => {
      schedule.push({
        match_date: matchDate,
        day,
        round: roundIndex + 1,
        court: courtIndex + 1,
        team1: teamMap[pair[0]],
        team2: teamMap[pair[1]],
        is_posted: false,
        is_submitted: false,
      });
    });
  });

  console.log(`📋 ${teamCount}-team hardcoded schedule:`, schedule);
  return schedule;
};
