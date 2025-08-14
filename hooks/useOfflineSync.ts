import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';

const OFFLINE_SALES_KEY = 'offline_sales';
const OFFLINE_ADJUSTMENTS_KEY = 'offline_adjustments';

interface OfflineSale {
  id: string;
  storeId: string;
  customerData: any;
  items: any[];
  totals: any;
  timestamp: string;
}

export function useOfflineSync(storeId?: string) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkPendingItems();
  }, []);

  const checkPendingItems = async () => {
    try {
      const offlineSales = await AsyncStorage.getItem(OFFLINE_SALES_KEY);
      const offlineAdjustments = await AsyncStorage.getItem(OFFLINE_ADJUSTMENTS_KEY);
      
      const salesCount = offlineSales ? JSON.parse(offlineSales).length : 0;
      const adjustmentsCount = offlineAdjustments ? JSON.parse(offlineAdjustments).length : 0;
      
      setPendingCount(salesCount + adjustmentsCount);
    } catch (error) {
      console.error('Error checking pending items:', error);
    }
  };

  const storeOfflineSale = async (saleData: OfflineSale) => {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_SALES_KEY);
      const offlineSales = existing ? JSON.parse(existing) : [];
      offlineSales.push(saleData);
      
      await AsyncStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(offlineSales));
      setPendingCount(prev => prev + 1);
    } catch (error) {
      console.error('Error storing offline sale:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!storeId) return;

    setSyncing(true);
    try {
      // Sync offline sales
      const offlineSales = await AsyncStorage.getItem(OFFLINE_SALES_KEY);
      if (offlineSales) {
        const sales = JSON.parse(offlineSales);
        
        for (const sale of sales) {
          try {
            // Create sale in Supabase
            const { data: saleData, error: saleError } = await supabase
              .from('sales')
              .insert({
                store_id: sale.storeId,
                customer_id: sale.customerData?.id || null,
                invoice_number: sale.id,
                subtotal: sale.totals.subtotal,
                tax_amount: sale.totals.tax,
                discount_amount: sale.totals.discount,
                total: sale.totals.total,
                paid_amount: sale.totals.paid,
                status: sale.totals.status,
                payment_method: sale.totals.paymentMethod,
                created_at: sale.timestamp,
              })
              .select()
              .single();

            if (saleError) throw saleError;

            // Create sale items
            for (const item of sale.items) {
              await supabase.from('sale_items').insert({
                sale_id: saleData.id,
                item_id: item.id,
                item_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.quantity * item.price,
              });

              // Update inventory
              await supabase.rpc('update_stock', {
                item_id: item.id,
                quantity_change: -item.quantity,
              });
            }
          } catch (error) {
            console.error('Error syncing sale:', error);
          }
        }

        // Clear synced sales
        await AsyncStorage.removeItem(OFFLINE_SALES_KEY);
      }

      await checkPendingItems();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    isOnline,
    syncing,
    pendingCount,
    storeOfflineSale,
    syncOfflineData,
    checkPendingItems,
  };
}