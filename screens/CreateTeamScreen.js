import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CreateTeamScreen() {
  const navigation = useNavigation();
  const [teamName, setTeamName] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableDays, setAvailableDays] = useState(['Monday', 'Wednesday', 'Thursday']);

  useEffect(function () {
    fetchDays();
  }, []);

  function fetchDays() {
    // Normally this would fetch from a server
    setAvailableDays(['Monday', 'Wednesday', 'Thursday']);
  }

  function handleCreateTeam() {
    if (!teamName || !selectedDay) {
      Alert.alert('Missing Info', 'Please enter a team name and select a day.');
      return;
    }

    Alert.alert('Team Created', `Team "${teamName}" registered for ${selectedDay}.`);
    setTeamName('');
    setSelectedDay('');
    setDropdownOpen(false);
  }

  function renderItem({ item }) {
    return React.createElement(
      TouchableOpacity,
      {
        style: styles.dropdownItem,
        onPress: function () {
          setSelectedDay(item);
          setDropdownOpen(false);
        },
      },
      React.createElement(Text, null, item)
    );
  }

  return React.createElement(
    SafeAreaView,
    { style: styles.safeArea },
    React.createElement(
      View,
      { style: styles.headerRow },
      React.createElement(
        TouchableOpacity,
        { onPress: function () { navigation.goBack(); } },
        React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: 'black' })
      ),
      React.createElement(Text, { style: styles.headerText }, 'Create Team'),
      React.createElement(View, { style: { width: 24 } })
    ),
    React.createElement(
      View,
      { style: styles.container },
      React.createElement(TextInput, {
        placeholder: 'Enter team name',
        value: teamName,
        onChangeText: setTeamName,
        style: styles.input,
      }),
      React.createElement(
        TouchableOpacity,
        {
          onPress: function () { setDropdownOpen(!dropdownOpen); },
          style: styles.dropdownToggle,
        },
        React.createElement(Text, null, selectedDay || 'Select a day')
      ),
      dropdownOpen &&
        React.createElement(FlatList, {
          data: availableDays,
          renderItem: renderItem,
          keyExtractor: function (item, index) { return index.toString(); },
          style: styles.dropdownList,
        }),
      React.createElement(
        TouchableOpacity,
        { onPress: handleCreateTeam, style: styles.createButton },
        React.createElement(Text, { style: styles.buttonText }, 'Create Team')
      )
    )
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownToggle: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  createButton: {
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
