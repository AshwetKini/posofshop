import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Truck, Package, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { supabase } from '@/services/supabase';
import { DashboardCard } from '@/components/DashboardCard';
import { QuickActionButton } from '@/components/QuickActionButton';

interface DashboardMetrics {
  totalRevenue: number;
  todaySales: number;
  todayCount: number;
  customerCount: number;
  totalOrders: number;
}

export default function HomeScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    todaySales: 0,
    todayCount: 0,
    customerCount: 0,
    totalOrders: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { store } = useStore(user?.id);
  const { pendingCount, syncOfflineData, syncing } = useOfflineSync(store?.id);

  useEffect(() => {
    if (store?.id) {
      loadMetrics();
      setupRealtimeSubscription();
    }
  }, [store?.id]);

  const loadMetrics = async () => {
    if (!store?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get total revenue
      const { data: totalRevenueData } = await supabase
        .from('sales')
        .select('total')
        .eq('store_id', store.id)
        .eq('status', 'completed');

      const totalRevenue = totalRevenueData?.reduce((sum, sale) => sum + sale.total, 0) || 0;

      // Get today's sales
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('total')
        .eq('store_id', store.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const todaySales = todaySalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0;
      const todayCount = todaySalesData?.length || 0;

      // Get customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

      // Get total orders
      const { count: totalOrders } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

      setMetrics({
        totalRevenue,
        todaySales,
        todayCount,
        customerCount: customerCount || 0,
        totalOrders: totalOrders || 0,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!store?.id) return;

    const subscription = supabase
      .channel('dashboard-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `store_id=eq.${store.id}`,
        },
        () => {
          loadMetrics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `store_id=eq.${store.id}`,
        },
        () => {
          loadMetrics();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const handleSync = async () => {
    if (pendingCount > 0) {
      Alert.alert(
        'Sync Offline Data',
        `You have ${pendingCount} pending items. Sync now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sync', onPress: syncOfflineData },
        ]
      );
    } else {
      Alert.alert('Info', 'No pending items to sync');
    }
  };

  if (!store) {
    return null; // This will be handled by the main navigation logic
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.storeName}>{store.name}</Text>
          {pendingCount > 0 && (
            <TouchableOpacity style={styles.syncBadge} onPress={handleSync}>
              <Text style={styles.syncBadgeText}>
                {syncing ? 'Syncing...' : `${pendingCount} pending`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metricsGrid}>
          <DashboardCard
            title="Total Revenue"
            value={`₹${metrics.totalRevenue.toFixed(2)}`}
            color="#10B981"
          />
          <DashboardCard
            title="Today's Sales"
            value={`₹${metrics.todaySales.toFixed(2)}`}
            subtitle={`${metrics.todayCount} orders`}
            color="#3B82F6"
          />
        </View>

        <View style={styles.metricsGrid}>
          <DashboardCard
            title="Total Customers"
            value={metrics.customerCount}
            color="#8B5CF6"
          />
          <DashboardCard
            title="Total Orders"
            value={metrics.totalOrders}
            color="#F59E0B"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickActionButton
              title="Add Customer"
              icon={UserPlus}
              onPress={() => router.push('/customers/add')}
              color="#8B5CF6"
            />
            <QuickActionButton
              title="Add Supplier"
              icon={Truck}
              onPress={() => router.push('/suppliers/add')}
              color="#F59E0B"
            />
            <QuickActionButton
              title="Add Item"
              icon={Package}
              onPress={() => router.push('/inventory/add')}
              color="#10B981"
            />
            <QuickActionButton
              title="New Sale"
              icon={Plus}
              onPress={() => router.push('/sales/new')}
              color="#3B82F6"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    color: '#6B7280',
  },
  syncBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  syncBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  quickActions: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
});