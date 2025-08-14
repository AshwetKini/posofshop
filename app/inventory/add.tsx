import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/services/supabase';
import { pickImage, takePhoto, uploadImage } from '@/services/imageUpload';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AddInventoryScreen() {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { store } = useStore(user?.id);
  const { data: suppliers } = useRealtime('suppliers', store?.id);

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how to add item image',
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

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (!store?.id) {
      Alert.alert('Error', 'Store not found');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageUri) {
        const fileName = `item_${Date.now()}.jpg`;
        const { url, error: uploadError } = await uploadImage(
          imageUri,
          'ITEM_IMAGES',
          fileName
        );

        if (uploadError) {
          Alert.alert('Warning', 'Failed to upload image, but item will be created without it');
        } else {
          imageUrl = url;
        }
      }

      const { error } = await supabase
        .from('inventory_items')
        .insert({
          store_id: store.id,
          name: name.trim(),
          sku: sku.trim() || null,
          barcode: barcode.trim() || null,
          category: category.trim() || null,
          price: parseFloat(price),
          cost: parseFloat(cost) || 0,
          stock_quantity: parseInt(stockQuantity) || 0,
          reorder_level: parseInt(reorderLevel) || 0,
          supplier_id: supplierId || null,
          image_url: imageUrl,
        });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Item added successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.form}>
          <TouchableOpacity style={styles.imageSection} onPress={handleImagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.itemImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={32} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Input
            label="Item Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter item name"
            required
          />

          <View style={styles.row}>
            <Input
              label="SKU"
              value={sku}
              onChangeText={setSku}
              placeholder="Item SKU"
              style={styles.halfInput}
            />
            <Input
              label="Barcode"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Barcode"
              style={styles.halfInput}
            />
          </View>

          <Input
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Fruits, Vegetables, Dairy"
          />

          <View style={styles.row}>
            <Input
              label="Selling Price"
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="numeric"
              required
              style={styles.halfInput}
            />
            <Input
              label="Cost Price"
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>

          <View style={styles.row}>
            <Input
              label="Stock Quantity"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfInput}
            />
            <Input
              label="Reorder Level"
              value={reorderLevel}
              onChangeText={setReorderLevel}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>

          <Button
            title={loading ? 'Adding Item...' : 'Add Item'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    padding: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
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
    bottom: -4,
    right: '35%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
  },
});