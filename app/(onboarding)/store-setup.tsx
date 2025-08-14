import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { pickImage, takePhoto, uploadImage } from '@/services/imageUpload';

export default function StoreSetupScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { createStore } = useStore();

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how to add your store image',
      [
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto();
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageUri) {
        const fileName = `store_${user.id}_${Date.now()}.jpg`;
        const { url, error: uploadError } = await uploadImage(
          imageUri,
          'STORE_IMAGES',
          fileName
        );

        if (uploadError) {
          Alert.alert('Warning', 'Failed to upload image, but store will be created without it');
        } else {
          imageUrl = url;
        }
      }

      const { error } = await createStore({
        owner_id: user.id,
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        image_url: imageUrl,
      });

      if (error) {
        Alert.alert('Error', error);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Store</Text>
          <Text style={styles.subtitle}>Let's get your grocery store configured</Text>
        </View>

        <Card style={styles.form}>
          <TouchableOpacity style={styles.imageSection} onPress={handleImagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.storeImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={48} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Tap to add store photo</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Input
            label="Store Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your store name"
            required
          />

          <Input
            label="Store Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your store address"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter store phone number"
            keyboardType="phone-pad"
          />

          <Button
            title={loading ? 'Setting Up Store...' : 'Complete Setup'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.button}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    padding: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  storeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  button: {
    marginTop: 16,
  },
});