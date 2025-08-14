import { supabase, STORAGE_BUCKETS } from './supabase';
import * as ImagePicker from 'expo-image-picker';

export const uploadImage = async (
  uri: string,
  bucket: keyof typeof STORAGE_BUCKETS,
  fileName: string
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(fileName, formData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err instanceof Error ? err.message : 'Upload failed' };
  }
};

export const pickImage = async (): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Permission to access camera roll is required!');
  }

  return await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
};

export const takePhoto = async (): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Permission to access camera is required!');
  }

  return await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
};