import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { uploadImageToSupabase } from '../utils/imageUploader';
import { supabase } from '../lib/supabase';

export default function HomeCarouselEditorScreen() {
  const navigation = useNavigation();
  const [imageUrl, setImageUrl] = useState(null);

  const handlePickImage = async () => {
    const url = await uploadImageToSupabase('home-carousel');
    if (url) {
      setImageUrl(url);
    } else {
      Alert.alert('Upload Failed', 'Please try again.');
    }
  };

  const handleSave = async () => {
    if (!imageUrl) return Alert.alert('No image selected');

    const { error } = await supabase
      .from('home_carousel')
      .insert({ image_url: imageUrl });

    if (error) {
      Alert.alert('Error saving to database', error.message);
    } else {
      Alert.alert('Success', 'Image added to Home carousel.');
      setImageUrl(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Home Carousel Editor</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <TouchableOpacity onPress={handlePickImage} style={styles.imageBox}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Tap to Select Image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !imageUrl && styles.disabled]}
          onPress={handleSave}
          disabled={!imageUrl}
        >
          <Text style={styles.buttonText}>Save to Home Carousel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
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
  container: {
    padding: 20,
    alignItems: 'center',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageText: {
    color: '#888',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#008080',
    padding: 14,
    borderRadius: 10,
    width: '100%',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
