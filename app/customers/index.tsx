import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, User, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { useRealtime } from '@/hooks/useRealtime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CustomersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { store } = useStore(user?.id);
  const { data: customers, loading } = useRealtime('customers', store?.id);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchQuery)) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCustomer = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/customers/view/${item.id}`)}>
      <Card style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.name}</Text>
            {item.phone && <Text style={styles.customerPhone}>{item.phone}</Text>}
            {item.email && <Text style={styles.customerEmail}>{item.email}</Text>}
          </View>
          <View style={styles.customerStats}>
            <Text style={styles.totalPurchases}>₹{item.total_purchases.toFixed(2)}</Text>
            <Text style={styles.totalPurchasesLabel}>Total Purchases</Text>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/customers/add')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first customer'}
            </Text>
            <Button
              title="Add Customer"
              onPress={() => router.push('/customers/add')}
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
  backButton: {
    padding: 4,
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
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  customerCard: {
    marginBottom: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerStats: {
    alignItems: 'flex-end',
  },
  totalPurchases: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  totalPurchasesLabel: {
    fontSize: 12,
    color: '#6B7280',
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