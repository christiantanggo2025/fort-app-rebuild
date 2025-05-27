import React from 'react';
import { Text, View } from 'react-native';
import { getRuntimeVersion } from 'expo-constants';

export default function CheckEngine() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hermes Enabled: {global.HermesInternal ? 'YES' : 'NO'}</Text>
    </View>
  );
}
