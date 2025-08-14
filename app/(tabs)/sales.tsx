import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ShoppingCart, User, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { useRealtime } from '@/hooks/useRealtime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SalesScreen() {
  const { user } = useAuth();
  const { store } = useStore(user?.id);
  const { data: sales, loading } = useRealtime('sales', store?.id);
  const { data: customers } = useRealtime('customers', store?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'partial': return '#F59E0B';
      case 'pending': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return 'Walk-in Customer';
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const renderSale = ({ item }: { item: any }) => (
    <Card style={styles.saleCard}>
      <View style={styles.saleHeader}>
        <View style={styles.saleInfo}>
          <Text style={styles.invoiceNumber}>#{item.invoice_number}</Text>
          <Text style={styles.customerName}>{getCustomerName(item.customer_id)}</Text>
          <Text style={styles.saleDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.saleAmount}>
          <Text style={styles.amount}>₹{item.total.toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.saleActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/sales/view/${item.id}`)}
        >
          <FileText size={16} color="#3B82F6" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        {item.status !== 'completed' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/sales/payment/${item.id}`)}
          >
            <ShoppingCart size={16} color="#10B981" />
            <Text style={styles.actionText}>Payment</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  if (!store) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/sales/new')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{sales.length}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {sales.filter(s => s.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{customers.length}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </Card>
      </View>

      <View style={styles.customerActions}>
        <Button
          title="Manage Customers"
          onPress={() => router.push('/customers')}
          variant="secondary"
          style={styles.customerButton}
        />
      </View>

      <FlatList
        data={sales}
        renderItem={renderSale}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShoppingCart size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No sales yet</Text>
            <Text style={styles.emptySubtitle}>Start by creating your first sale</Text>
            <Button
              title="New Sale"
              onPress={() => router.push('/sales/new')}
              style={styles.emptyButton}
            />
          </View>
        }
      />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerActions: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  customerButton: {
    backgroundColor: '#8B5CF6',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  saleCard: {
    marginBottom: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  saleInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  saleDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  saleAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saleActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
});