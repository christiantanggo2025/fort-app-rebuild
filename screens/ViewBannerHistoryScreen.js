import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const phaseColors = {
  no_games: '#999999',
  games_on: '#00AA00',
  cancelled: '#FF0000',
  pending: '#FFD700',
  free_practice: '#007FFF',
};

const phaseLabels = {
  no_games: 'No Games Scheduled',
  games_on: 'Games Are On',
  cancelled: 'Games Cancelled',
  pending: 'Games Pending',
  free_practice: 'Free Practice Today',
};

export default function ViewBannerHistoryScreen() {
  const navigation = useNavigation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from('volleyball_banners')
      .select('*')
      .order('banner_date', { ascending: false });

    if (error) {
      console.log('❌ Error loading banner history:', error.message);
    } else {
      setBanners(data);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Banner History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#008080" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {banners.map((item) => (
            <View
              key={item.id}
              style={[
                styles.bannerCard,
                { backgroundColor: phaseColors[item.status] || '#eee' },
              ]}
            >
              <Text style={styles.bannerDate}>{item.banner_date}</Text>
              <Text style={styles.bannerText}>{phaseLabels[item.status]}</Text>
              {item.repeat_day && (
                <Text style={styles.repeatText}>Repeats Every {capitalize(item.repeat_day)}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 20,
  },
  bannerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  bannerDate: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  bannerText: {
    color: '#fff',
    marginTop: 4,
  },
  repeatText: {
    color: '#fff',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
