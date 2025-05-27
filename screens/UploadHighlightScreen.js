import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { uploadImageToSupabase } from '../utils/imageUploader';

export default function UploadHighlightScreen() {
  const [imageUrl, setImageUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  const handlePickImage = async () => {
    const url = await uploadImageToSupabase('post-images');
    if (url) setImageUrl(url);
  };

  const uploadImage = async () => {
    if (!imageUrl || !title || !description) {
      Alert.alert("Please fill out all fields and select an image");
      return;
    }

    setUploading(true);

    try {
      const user = supabase.auth.user();

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            image_url: imageUrl,
            title,
            description,
            auth_user_id: user?.id || null,
          },
        ]);

      if (error) {
        console.error('Insert error:', error);
        Alert.alert("Database error", error.message);
        return;
      }

      Alert.alert("Success", "Post submitted!");
      setImageUrl(null);
      setTitle('');
      setDescription('');
      navigation.goBack();
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert("Unexpected error", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Upload Highlight</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Enter title"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Enter description"
          multiline
        />

        <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Tap to select image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={uploadImage}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Submit Post</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageText: {
    color: '#888',
    fontSize: 16,
  },
  uploadBtn: {
    marginTop: 30,
    backgroundColor: '#008080',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});