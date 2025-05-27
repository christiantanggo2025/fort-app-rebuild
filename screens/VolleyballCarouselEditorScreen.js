import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { uploadImageToSupabase } from '../utils/imageUploader';
import { supabase } from '../lib/supabase';

export default function VolleyballCarouselEditorScreen() {
  const navigation = useNavigation();
  const [imageUrl, setImageUrl] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchCarousel();
  }, []);

  const fetchCarousel = async () => {
    const { data, error } = await supabase
      .from('volleyball_carousel')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      setImages(data);
    }
  };

  const handlePickImage = async () => {
    const url = await uploadImageToSupabase('volleyball-carousel');
    if (url) {
      setImageUrl(url);
    } else {
      Alert.alert('Upload Failed', 'Please try again.');
    }
  };

  const handleSave = async () => {
    if (!imageUrl) return Alert.alert('No image selected');

    const nextPriority = (images[images.length - 1]?.priority || 0) + 1;

    const { error } = await supabase
      .from('volleyball_carousel')
      .insert({ image_url: imageUrl, priority: nextPriority });

    if (error) {
      Alert.alert('Error saving to database', error.message);
    } else {
      Alert.alert('Success', 'Image added to carousel.');
      setImageUrl(null);
      fetchCarousel();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('volleyball_carousel').delete().eq('id', id);
    if (!error) {
      fetchCarousel();
    } else {
      Alert.alert('Delete Failed', error.message);
    }
  };

  const updatePriority = async (id, direction) => {
    const index = images.findIndex((img) => img.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    )
      return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const current = images[index];
    const swap = images[swapIndex];

    // Swap priorities
    const updates = [
      supabase
        .from('volleyball_carousel')
        .update({ priority: swap.priority })
        .eq('id', current.id),
      supabase
        .from('volleyball_carousel')
        .update({ priority: current.priority })
        .eq('id', swap.id),
    ];

    const [res1, res2] = await Promise.all(updates);
    if (!res1.error && !res2.error) {
      fetchCarousel();
    } else {
      Alert.alert('Priority Update Failed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Volleyball Carousel</Text>
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
          <Text style={styles.buttonText}>Save to Carousel</Text>
        </TouchableOpacity>
      </View>

      {/* Existing Images Preview */}
      <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.previewHeader}>Current Carousel Images</Text>
        {images.map((img, index) => (
          <View key={img.id} style={styles.previewCard}>
            <Image source={{ uri: img.image_url }} style={styles.previewImage} />
            <View style={styles.previewControls}>
              <TouchableOpacity
                onPress={() => updatePriority(img.id, 'up')}
                style={styles.controlButton}
              >
                <Ionicons name="arrow-up" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updatePriority(img.id, 'down')}
                style={styles.controlButton}
              >
                <Ionicons name="arrow-down" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(img.id)}
                style={[styles.controlButton, { marginLeft: 'auto' }]}
              >
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  previewScroll: {
    flex: 1,
  },
  previewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewCard: {
    marginBottom: 20,
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 10,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  previewControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    marginRight: 10,
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
});
