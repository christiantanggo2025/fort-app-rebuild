import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/styles';

const { width } = Dimensions.get('window');
const buttonSpacing = 20;
const buttonWidth = (width - 40 - 2 * buttonSpacing) / 3;

export default function StylingTestScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const options = ['Option A', 'Option B', 'Option C'];

  const triggerConfirm = () => {
    Alert.alert('Are you sure?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => alert('Confirmed!') },
    ]);
  };

  const triggerComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is not available yet.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/Buttons/Nexo-Top-Logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Styling Guide</Text>
              <View style={{ width: 24 }} />
            </View>

            <Text style={styles.sectionTitle}>3x Button Grid</Text>
            <View style={styles.gridRow}>
              <TouchableOpacity style={styles.activeButton}>
                <Text style={styles.buttonText}>Grid 1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.activeButton}>
                <Text style={styles.buttonText}>Grid 2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.activeButton}>
                <Text style={styles.buttonText}>Grid 3</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Full Width Buttons</Text>
            <TouchableOpacity style={styles.activeFullWidth}>
              <Text style={styles.fullText}>Active Button</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveFullWidth}>
              <Text style={styles.fullText}>Inactive Button</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Inline Dropdown</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.dropdownText}>
                {selectedOption || 'Select Option'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#555"
                style={styles.dropdownArrow}
              />
            </TouchableOpacity>
            {showDropdown &&
              options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSelectedOption(option);
                    setShowDropdown(false);
                  }}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}

            <Text style={styles.sectionTitle}>Password Field</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Enter password"
                secureTextEntry={!passwordVisible}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Text Link</Text>
            <TouchableOpacity onPress={() => alert('Text Link Clicked')}>
              <Text style={styles.textLink}>Tap Here for Info</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Alert Samples</Text>
            <TouchableOpacity style={styles.activeFullWidth} onPress={triggerConfirm}>
              <Text style={styles.fullText}>Show Confirm Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveFullWidth} onPress={triggerComingSoon}>
              <Text style={styles.fullText}>Show Coming Soon</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Banner Sample</Text>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Games For Today Are Cancelled</Text>
            </View>

            <Text style={styles.sectionTitle}>Modal</Text>
            <TouchableOpacity style={styles.activeFullWidth} onPress={() => setShowModal(true)}>
              <Text style={styles.fullText}>Open Modal</Text>
            </TouchableOpacity>
            <Modal visible={showModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.sectionTitle}>Edit Field</Text>
                  <TextInput
                    placeholder="Edit something"
                    style={styles.input}
                  />
                  <TouchableOpacity style={styles.activeFullWidth} onPress={() => setShowModal(false)}>
                    <Text style={styles.fullText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
