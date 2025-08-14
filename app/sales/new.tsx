import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Minus, Trash2, User, Receipt } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { useRealtime } from '@/hooks/useRealtime';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { supabase } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateInvoicePDF, shareInvoice } from '@/services/invoiceGenerator';
import { TextInput } from 'react-native';


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function NewSaleScreen() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { store } = useStore(user?.id);
  const { data: items } = useRealtime('inventory_items', store?.id);
  const { data: customers } = useRealtime('customers', store?.id);
  const { storeOfflineSale, isOnline } = useOfflineSync(store?.id);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * 0.18; // 18% GST
  const total = subtotal + taxAmount;
  const balance = total - paidAmount;

  const addToCart = (item: any) => {
    if (item.stock_quantity <= 0) {
      Alert.alert('Error', 'Item is out of stock');
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      if (existingItem.quantity >= item.stock_quantity) {
        Alert.alert('Error', 'Not enough stock available');
        return;
      }
      updateQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCart(prev => [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        stock: item.stock_quantity,
      }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item && newQuantity > item.stock) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const generateInvoiceNumber = () => {
    return `INV-${Date.now()}`;
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Please add items to cart');
      return;
    }

    if (!store?.id) {
      Alert.alert('Error', 'Store not found');
      return;
    }

    setLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      const saleData = {
        store_id: store.id,
        customer_id: selectedCustomer?.id || null,
        invoice_number: invoiceNumber,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: 0,
        total,
        paid_amount: paidAmount,
        status: balance <= 0 ? 'completed' : 'partial',
        payment_method: paymentMethod,
      };

      if (!isOnline) {
        // Store offline for later sync
        await storeOfflineSale({
          id: invoiceNumber,
          storeId: store.id,
          customerData: selectedCustomer,
          items: cart,
          totals: {
            subtotal,
            tax: taxAmount,
            discount: 0,
            total,
            paid: paidAmount,
            status: balance <= 0 ? 'completed' : 'partial',
            paymentMethod,
          },
          timestamp: new Date().toISOString(),
        });

        Alert.alert('Success', 'Sale saved offline. Will sync when online.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      // Online sale processing
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      for (const item of cart) {
        await supabase.from('sale_items').insert({
          sale_id: sale.id,
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        });

        // Update inventory stock
        await supabase
          .from('inventory_items')
          .update({ 
            stock_quantity: item.stock - item.quantity 
          })
          .eq('id', item.id);

        // Log stock adjustment
        await supabase.from('stock_adjustments').insert({
          store_id: store.id,
          item_id: item.id,
          adjustment_type: 'out',
          quantity: item.quantity,
          reason: 'Sale',
          reference_type: 'sale',
          reference_id: sale.id,
        });
      }

      // Update customer total purchases
      if (selectedCustomer) {
        await supabase
          .from('customers')
          .update({
            total_purchases: selectedCustomer.total_purchases + total,
          })
          .eq('id', selectedCustomer.id);
      }

      Alert.alert(
        'Sale Completed',
        'Would you like to generate an invoice?',
        [
          { text: 'Skip', onPress: () => router.back() },
          { text: 'Generate Invoice', onPress: () => generateInvoice(sale) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (sale: any) => {
    try {
      const { uri, error } = await generateInvoicePDF({
        sale,
        items: cart.map(item => ({
          id: item.id,
          sale_id: sale.id,
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          created_at: new Date().toISOString(),
        })),
        store,
        customer: selectedCustomer,
      });

      if (error) {
        Alert.alert('Error', error);
        router.back();
        return;
      }

      Alert.alert(
        'Invoice Generated',
        'Invoice PDF has been created. Would you like to share it?',
        [
          { text: 'Done', onPress: () => router.back() },
          { text: 'Share', onPress: () => shareInvoice(uri!) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate invoice');
      router.back();
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Minus size={16} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInventoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.inventoryItem}
      onPress={() => addToCart(item)}
      disabled={item.stock_quantity <= 0}
    >
      <Text style={styles.inventoryItemName}>{item.name}</Text>
      <Text style={styles.inventoryItemPrice}>₹{item.price.toFixed(2)}</Text>
      <Text style={[
        styles.inventoryItemStock,
        item.stock_quantity <= 0 && styles.outOfStock
      ]}>
        Stock: {item.stock_quantity}
      </Text>
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
        <Text style={styles.title}>New Sale</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <TouchableOpacity
            style={styles.customerSelect}
            onPress={() => router.push('/customers/select')}
          >
            <User size={20} color="#6B7280" />
            <Text style={styles.customerSelectText}>
              {selectedCustomer ? selectedCustomer.name : 'Select Customer (Optional)'}
            </Text>
          </TouchableOpacity>
        </Card>

        {cart.length > 0 && (
          <Card style={styles.cartSection}>
            <Text style={styles.sectionTitle}>Cart ({cart.length} items)</Text>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
            
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax (18%):</Text>
                <Text style={styles.totalValue}>₹{taxAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.finalTotal]}>
                <Text style={styles.finalTotalLabel}>Total:</Text>
                <Text style={styles.finalTotalValue}>₹{total.toFixed(2)}</Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.inventorySection}>
          <Text style={styles.sectionTitle}>Select Items</Text>
          <FlatList
            data={items}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.inventoryRow}
          />
        </Card>

        {cart.length > 0 && (
          <Card style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment</Text>
            
            <View style={styles.paymentMethods}>
              {['cash', 'card', 'upi'].map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.selectedPaymentMethodText
                  ]}>
                    {method.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.amountInput}>
              <Text style={styles.inputLabel}>Amount Paid: ₹</Text>
              <TextInput
                style={styles.amountTextInput}
                value={paidAmount.toString()}
                onChangeText={(text) => setPaidAmount(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            {balance > 0 && (
              <Text style={styles.balanceText}>
                Balance Due: ₹{balance.toFixed(2)}
              </Text>
            )}

            <Button
              title={loading ? 'Processing...' : 'Complete Sale'}
              onPress={completeSale}
              disabled={loading}
              style={styles.completeButton}
            />
          </Card>
        )}
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  customerSection: {
    marginBottom: 16,
    padding: 20,
  },
  customerSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  customerSelectText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  cartSection: {
    marginBottom: 16,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  totals: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  finalTotal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  inventorySection: {
    marginBottom: 16,
    padding: 20,
  },
  inventoryRow: {
    justifyContent: 'space-between',
  },
  inventoryItem: {
    flex: 0.48,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inventoryItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  inventoryItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  inventoryItemStock: {
    fontSize: 12,
    color: '#6B7280',
  },
  outOfStock: {
    color: '#EF4444',
  },
  paymentSection: {
    marginBottom: 16,
    padding: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethod: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedPaymentMethodText: {
    color: '#FFFFFF',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
});