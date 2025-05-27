import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EditTeamScreen() {
  const navigation = useNavigation();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableDays, setAvailableDays] = useState(['Monday', 'Wednesday', 'Thursday']);

  useEffect(function () {
    fetchTeams();
  }, []);

  function fetchTeams() {
    setTeams([
      { id: 1, name: 'Team Alpha', day: 'Monday' },
      { id: 2, name: 'Team Beta', day: 'Wednesday' },
    ]);
  }

  function handleUpdate() {
    if (!selectedTeam || !newName || !selectedDay) {
      Alert.alert('Missing Info', 'Please select a team, new name, and day.');
      return;
    }

    Alert.alert('Team Updated', `Team "${newName}" is now playing on ${selectedDay}.`);
    setSelectedTeam(null);
    setNewName('');
    setSelectedDay('');
  }

  function renderTeamItem({ item }) {
    return React.createElement(
      TouchableOpacity,
      {
        style: styles.teamItem,
        onPress: function () {
          setSelectedTeam(item);
          setNewName(item.name);
          setSelectedDay(item.day);
        },
      },
      React.createElement(Text, null, item.name + ' - ' + item.day)
    );
  }

  function renderDayItem({ item }) {
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
      React.createElement(Text, { style: styles.headerText }, 'Edit Team'),
      React.createElement(View, { style: { width: 24 } })
    ),
    React.createElement(
      View,
      { style: styles.container },
      React.createElement(FlatList, {
        data: teams,
        renderItem: renderTeamItem,
        keyExtractor: function (item) { return item.id.toString(); },
        style: { marginBottom: 20 },
      }),
      selectedTeam &&
        React.createElement(
          View,
          null,
          React.createElement(TextInput, {
            placeholder: 'New team name',
            value: newName,
            onChangeText: setNewName,
            style: styles.input,
          }),
          React.createElement(
            TouchableOpacity,
            {
              onPress: function () { setDropdownOpen(!dropdownOpen); },
              style: styles.dropdownToggle,
            },
            React.createElement(Text, null, selectedDay || 'Select new day')
          ),
          dropdownOpen &&
            React.createElement(FlatList, {
              data: availableDays,
              renderItem: renderDayItem,
              keyExtractor: function (item, index) { return index.toString(); },
              style: styles.dropdownList,
            }),
          React.createElement(
            TouchableOpacity,
            { onPress: handleUpdate, style: styles.updateButton },
            React.createElement(Text, { style: styles.buttonText }, 'Update Team')
          )
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
  teamItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  updateButton: {
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
