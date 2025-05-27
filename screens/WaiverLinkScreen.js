import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WaiverLinkScreen() {
  const navigation = useNavigation();

  return React.createElement(
    SafeAreaView,
    { style: styles.safeArea },
    React.createElement(
      View,
      { style: styles.headerRow },
      React.createElement(
        TouchableOpacity,
        { onPress: function () { navigation.goBack(); } },
        React.createElement(Ionicons, {
          name: 'arrow-back',
          size: 24,
          color: 'black',
        })
      ),
      React.createElement(Text, { style: styles.headerText }, 'Waiver / Registration Link'),
      React.createElement(View, { style: { width: 24 } })
    ),
    React.createElement(
      View,
      { style: styles.container },
      React.createElement(Text, { style: styles.placeholderText }, 'Waiver link management will go here.')
    )
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
});
