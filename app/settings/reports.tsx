import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { supabase } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ReportsScreen() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { store } = useStore(user?.id);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(formatDateForInput(firstDay));
    setEndDate(formatDateForInput(now));
  }, []);

  const generateSalesReport = async () => {
    if (!store?.id) return;

    setLoading(true);
    try {
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers(name),
          sale_items(*)
        `)
        .eq('store_id', store.id)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create CSV content
      let csvContent = 'Invoice Number,Date,Customer,Items,Subtotal,Tax,Total,Status,Payment Method\n';
      
      sales?.forEach(sale => {
        const customerName = sale.customers?.name || 'Walk-in Customer';
        const itemCount = sale.sale_items?.length || 0;
        
        csvContent += `${sale.invoice_number},${new Date(sale.created_at).toLocaleDateString()},${customerName},${itemCount},${sale.subtotal},${sale.tax_amount},${sale.total},${sale.status},${sale.payment_method || 'N/A'}\n`;
      });

      // For web, trigger download
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${startDate}-to-${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use sharing
        const { isAvailable } = await Sharing.isAvailableAsync();
        if (isAvailable) {
          const fileName = `sales-report-${Date.now()}.csv`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, csvContent);
          await Sharing.shareAsync(fileUri);
        }
      }

      Alert.alert('Success', 'Sales report generated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async () => {
    if (!store?.id) return;

    setLoading(true);
    try {
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          suppliers(name)
        `)
        .eq('store_id', store.id)
        .order('name');

      if (error) throw error;

      // Create CSV content
      let csvContent = 'Name,SKU,Category,Stock,Reorder Level,Price,Cost,Supplier\n';
      
      items?.forEach(item => {
        const supplierName = item.suppliers?.name || 'N/A';
        csvContent += `${item.name},${item.sku || ''},${item.category || ''},${item.stock_quantity},${item.reorder_level},${item.price},${item.cost},${supplierName}\n`;
      });

      // For web, trigger download
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-report-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      Alert.alert('Success', 'Inventory report generated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const reportOptions = [
    {
      title: 'Sales Report',
      subtitle: 'Sales data for selected date range',
      icon: FileText,
      onPress: generateSalesReport,
      color: '#3B82F6',
    },
    {
      title: 'Inventory Report',
      subtitle: 'Current inventory status',
      icon: Download,
      onPress: generateInventoryReport,
      color: '#10B981',
    },
  ];

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
        <Text style={styles.title}>Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.dateRangeCard}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.dateRow}>
            <Input
              label="Start Date"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              style={styles.dateInput}
            />
            <Input
              label="End Date"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              style={styles.dateInput}
            />
          </View>
        </Card>

        <View style={styles.reportsSection}>
          {reportOptions.map((option) => (
            <TouchableOpacity
              key={option.title}
              onPress={option.onPress}
              disabled={loading}
            >
              <Card style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                    <option.icon size={24} color={option.color} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{option.title}</Text>
                    <Text style={styles.reportSubtitle}>{option.subtitle}</Text>
                  </View>
                  <Download size={20} color="#6B7280" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
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
  dateRangeCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  reportsSection: {
    gap: 12,
  },
  reportCard: {
    padding: 20,
  },
  reportHeader: {
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
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});