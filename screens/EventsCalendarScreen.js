import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function EventsCalendarScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('date');
    if (!error) {
      setEvents(data);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const eventMonth = new Date(event.date).getMonth();
    return matchesSearch && eventMonth === selectedMonth;
  });

  const renderEvent = ({ item, index }) => {
    const isEven = index % 2 === 0;
    const eventDate = new Date(item.date);
    const month = months[eventDate.getMonth()].substring(0, 3);
    const day = eventDate.getDate();
    const backgroundColor = item.is_cancelled ? '#ffd6d6' : isEven ? '#f0f0f0' : '#e0e0e0';

    return (
      <View style={[styles.eventContainer, { backgroundColor }]}>
        <View style={styles.row}>
          <View style={styles.tealDateBox}>
            <Text style={styles.monthText}>{month}</Text>
            <Text style={styles.dayText}>{day}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>
              {item.title}{item.is_cancelled ? ' (Cancelled)' : ''}
            </Text>
            <Text>{item.description}</Text>
            {item.location ? <Text>📍 {item.location}</Text> : null}
            {item.stage ? <Text>🎤 Live on {item.stage} Stage</Text> : null}
            {item.event_link ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.event_link)}>
                <Text style={styles.link}>Additional Details</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Events Calendar</Text>
          <View style={{ width: 24 }} />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
        >
          <Text style={styles.dropdownText}>{months[selectedMonth]}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {monthDropdownVisible && (
          <View style={styles.dropdownList}>
            {months.map((month, index) => (
              <TouchableOpacity key={index} onPress={() => {
                setSelectedMonth(index);
                setMonthDropdownVisible(false);
              }}>
                <Text style={styles.dropdownItem}>{month}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  listContent: {
    paddingBottom: 40
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 20
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#000'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5
  },
  dropdownText: { fontSize: 16 },
  dropdownArrow: { fontSize: 16 },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16
  },
  eventContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row'
  },
  tealDateBox: {
    backgroundColor: '#008080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    minWidth: 60
  },
  monthText: {
    fontSize: 14,
    color: '#fff'
  },
  dayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  eventDetails: {
    flex: 1
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  link: {
    color: '#008080',
    fontWeight: 'bold',
    marginTop: 6
  }
});
