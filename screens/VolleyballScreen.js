// FULL VolleyballScreen.js with EXACT CustomerAppDashboard.js bottom navigation

import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Linking } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function VolleyballScreen() {
  const navigation = useNavigation();
  const carouselRef = useRef(null);

  const [carouselPosts, setCarouselPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topTeams, setTopTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [bannerStatus, setBannerStatus] = useState('no_games');

  const bannerMessages = {
    no_games: 'No Games Scheduled For Today',
    games_on: 'Games For Today Are On',
    cancelled: 'Games For Today Are Cancelled',
    pending: 'Games For Today Are Pending',
    free_practice: 'Free Practice Today',
  };

  const bannerColors = {
    no_games: '#999999',
    games_on: '#00AA00',
    cancelled: '#FF0000',
    pending: '#FFD700',
    free_practice: '#007FFF',
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBannerStatus();
      fetchTopTeams();
      fetchNextRound();
      fetchCarouselPosts();
      autoApproveAndUpdateStandings();
    }, [])
  );

  const fetchBannerStatus = async () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekday = today.toLocaleString('en-US', { weekday: 'long' });

    const { data: teams } = await supabase.from('teams').select('team_name').eq('day', weekday);
    if (!teams || teams.length === 0) return setBannerStatus('no_games');

    const { data: games } = await supabase.from('schedules').select('id').eq('match_date', todayStr);
    if (games && games.length > 0) setBannerStatus('games_on');
    else setBannerStatus('no_games');
  };

  const fetchCarouselPosts = async () => {
    const { data } = await supabase.from('volleyball_carousel').select('*').order('created_at', { ascending: false });
    if (data?.length > 0) setCarouselPosts(data);
    else setCarouselPosts([{ id: 'fallback', image_url: require('../assets/FortLogo.png') }]);
  };

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const fetchTopTeams = async () => {
    const { data } = await supabase
      .from('volleyball_scores_summary')
      .select('*')
      .order('points', { ascending: false })
      .limit(3);
    if (data) setTopTeams(data);
  };

  const fetchNextRound = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .gte('match_date', today)
      .order('match_date', { ascending: true });

    const round1Matches = data?.filter((m) => m.round === 1) || [];
    setUpcomingMatches(round1Matches);
  };

  const autoApproveAndUpdateStandings = async () => {
    await supabase.rpc('resolve_score_conflicts_and_update_standings');
  };

  const handleRegisterButton = async () => {
    const { data } = await supabase.from('app_links').select('registration_link').eq('id', 1).single();
    if (data?.registration_link) Linking.openURL(data.registration_link);
    else Alert.alert('No Link Available');
  };

  const renderItem = ({ item }) => (
    <Image
      source={typeof item.image_url === 'string' ? { uri: item.image_url } : item.image_url}
      style={styles.carouselImage}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Volleyball</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerAccountScreen')}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={[styles.phaseBanner, { backgroundColor: bannerColors[bannerStatus] }]}>
        <Text style={styles.phaseText}>{bannerMessages[bannerStatus]}</Text>
        <Text style={styles.phaseSubtext}>(Final Confirmation Daily @ 3:30pm)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.carouselWrapper}>
          <TouchableOpacity onPress={() => scrollToIndex(Math.max(currentIndex - 1, 0))}>
            <Ionicons name="chevron-back-circle" size={30} color="black" />
          </TouchableOpacity>
          <FlatList
            ref={carouselRef}
            horizontal
            pagingEnabled
            data={carouselPosts}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCurrentIndex(index);
            }}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity onPress={() => scrollToIndex(Math.min(currentIndex + 1, carouselPosts.length - 1))}>
            <Ionicons name="chevron-forward-circle" size={30} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.indicatorRow}>
          {carouselPosts.map((_, index) => (
            <View key={index} style={[styles.indicatorDot, currentIndex === index && styles.activeDot]} />
          ))}
        </View>

        <View style={styles.centeredSection}>
          <Text style={styles.sectionHeader}>Upcoming Schedule</Text>
          {upcomingMatches.length === 0 ? (
            <Text style={styles.sectionText}>Check Back for Upcoming Schedule</Text>
          ) : (
            upcomingMatches.slice(0, 4).map((match, i) => (
              <Text key={i} style={styles.sectionText}>Court {match.court}: {match.team1} vs {match.team2}</Text>
            ))
          )}
          <TouchableOpacity onPress={() => navigation.navigate('ViewSchedule')}>
            <Text style={styles.linkText}>View Full Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centeredSection}>
          <Text style={styles.sectionHeader}>Top 3 Teams</Text>
          {topTeams.map((team, i) => (
            <View key={i} style={styles.badgeRow}>
              <Text style={styles.badgeText}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</Text>
              <Text style={styles.teamText}>{team.team_name} – {team.points} pts</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('Standings')}>
            <Text style={[styles.linkText, { marginBottom: 20 }]}>View Full Standings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Feature Coming Soon')}>
          <Text style={styles.buttonText}>Volleyball Store</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegisterButton}>
          <Text style={styles.buttonText}>Register Your Team</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ EXACT bottom navigation from CustomerAppDashboard.js */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navIconButton} onPress={() => navigation.navigate('CustomerAppDashboard')}>
          <Ionicons name="home-outline" size={26} color="#008080" />
          <Text style={styles.iconLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navIconButton} onPress={() => alert('Entertainment section coming soon.') }>
          <Ionicons name="musical-notes-outline" size={26} color="#008080" />
          <Text style={styles.iconLabel}>Entertainment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navIconButton} onPress={() => navigation.navigate('Volleyball')}>
          <Ionicons name="football-outline" size={26} color="#008080" />
          <Text style={styles.iconLabel}>Volleyball</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingBottom: 120 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  phaseBanner: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  phaseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  phaseSubtext: { color: '#fff', fontSize: 8, marginTop: 4 },
  carouselWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  carouselImage: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: '#008080' },
  centeredSection: { alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 10, textAlign: 'center' },
  sectionText: { fontSize: 16, color: '#000', marginVertical: 2, textAlign: 'center' },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  badgeText: { fontSize: 20 },
  teamText: { fontSize: 16, fontWeight: '500', color: '#000' },
  linkText: {
    fontSize: 14,
    color: '#008080',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  navIconButton: { alignItems: 'center' },
  iconLabel: { fontSize: 12, color: '#008080' },
});
