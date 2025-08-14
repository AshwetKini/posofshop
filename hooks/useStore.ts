import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Database } from '@/types/database';

type Store = Database['public']['Tables']['stores']['Row'];

export function useStore(userId?: string) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadStore();
  }, [userId]);

  const loadStore = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStore(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (storeData: Database['public']['Tables']['stores']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert(storeData)
        .select()
        .single();

      if (error) throw error;

      setStore(data);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create store';
      setError(error);
      return { data: null, error };
    }
  };

  return {
    store,
    loading,
    error,
    createStore,
    refetch: loadStore,
  };
}