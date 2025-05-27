import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as CameraModule from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Camera = CameraModule.CameraView;

console.log('📦 CameraModule keys:', Object.keys(CameraModule));
console.log('📷 typeof Camera:', typeof Camera);
console.log('🔍 CameraModule.Camera === Camera:', CameraModule.Camera === Camera);

export default function TicketScanScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await CameraModule.Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      console.log('📲 Camera permission status:', status);
    })();
  }, []);

  if (hasPermission === null) return <Text>Requesting camera permission…</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  if (!Camera || typeof Camera !== 'function') {
    console.log('❌ Camera is not a valid React component:', Camera);
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.fallbackText}>Camera module failed to load</Text>
        <Text style={styles.fallbackText}>Check console logs for more details</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan Tickets</Text>
        <View style={{ width: 24 }} />
      </View>

      <Camera
        ref={cameraRef}
        style={styles.camera}
        ratio="16:9"
      />

      <Text style={styles.instruction}>Align the QR code within the frame</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  instruction: {
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 16,
  },
  fallbackText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
});
