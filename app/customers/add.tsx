import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { supabase } from '@/services/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AddCustomerScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { store } = useStore(user?.id);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }

    if (email && !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (!store?.id) {
      Alert.alert('Error', 'Store not found');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          store_id: store.id,
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
        });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Customer added successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add customer');
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
        <Text style={styles.title}>Add Customer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.form}>
          <Input
            label="Customer Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter customer name"
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes about customer"
            multiline
            numberOfLines={3}
          />

          <Button
            title={loading ? 'Adding Customer...' : 'Add Customer'}
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
  submitButton: {
    marginTop: 16,
  },
});