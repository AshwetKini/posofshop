import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Package, CreditCard as Edit3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { useRealtime } from '@/hooks/useRealtime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();
  const { store } = useStore(user?.id);
  const { data: items, loading } = useRealtime('inventory_items', store?.id);

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.sku && <Text style={styles.itemSku}>SKU: {item.sku}</Text>}
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/inventory/edit/${item.id}`)}
        >
          <Edit3 size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.priceSection}>
          <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
          <Text style={styles.cost}>Cost: ₹{item.cost.toFixed(2)}</Text>
        </View>
        
        <View style={styles.stockSection}>
          <Text style={[
            styles.stock,
            item.stock_quantity <= item.reorder_level && styles.lowStock
          ]}>
            Stock: {item.stock_quantity}
          </Text>
          {item.stock_quantity <= item.reorder_level && (
            <Text style={styles.reorderAlert}>Low Stock!</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category && styles.selectedCategoryChipText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (!store) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/inventory/add')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategory)}
        </ScrollView>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first inventory item'}
            </Text>
            <Button
              title="Add Item"
              onPress={() => router.push('/inventory/add')}
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
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  cost: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockSection: {
    alignItems: 'flex-end',
  },
  stock: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  lowStock: {
    color: '#EF4444',
  },
  reorderAlert: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
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