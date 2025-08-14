import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, FileText, LogOut, Download, ChartBar as BarChart3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { store } = useStore(user?.id);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/signin');
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Store Details',
      subtitle: 'Update store information',
      icon: Store,
      onPress: () => router.push('/settings/store'),
      color: '#3B82F6',
    },
    {
      title: 'Reports',
      subtitle: 'Sales and inventory reports',
      icon: BarChart3,
      onPress: () => router.push('/settings/reports'),
      color: '#10B981',
    },
    {
      title: 'Export Data',
      subtitle: 'Backup your data',
      icon: Download,
      onPress: () => router.push('/settings/export'),
      color: '#F59E0B',
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity key={item.title} onPress={item.onPress}>
      <Card style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
            <item.icon size={24} color={item.color} />
          </View>
          <View style={styles.menuItemText}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (!store) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeDetails}>
                {store.address && `${store.address}\n`}
                {store.phone}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.accountCard}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userMetadata}>
              {user?.user_metadata?.full_name || 'User'}
            </Text>
          </Card>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutButton}
        />
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  storeCard: {
    marginBottom: 24,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  storeDetails: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  accountSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  accountCard: {
    padding: 20,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userMetadata: {
    fontSize: 14,
    color: '#6B7280',
  },
  signOutButton: {
    marginTop: 16,
  },
});