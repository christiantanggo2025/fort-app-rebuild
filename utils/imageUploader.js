import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

export const uploadImageToSupabase = async (bucketName = 'post-images') => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert('No image selected.');
      return null;
    }

    const asset = result.assets[0];
    const filePath = `image-${Date.now()}.jpg`;
    const contentType = 'image/jpeg';

    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, Buffer.from(base64, 'base64'), {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      Alert.alert('Upload Failed', uploadError.message);
      return null;
    }

    // Manually construct the public URL based on the Supabase project ID and bucket
    const SUPABASE_URL = 'https://czsxysbtaagitczfcidi.supabase.co';
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;

    console.log('✅ Final image public URL:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Unexpected error during image upload:', err);
    Alert.alert('Error', 'An unexpected error occurred while uploading image.');
    return null;
  }
};