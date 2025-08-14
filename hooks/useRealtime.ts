import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

export function useRealtime(table: string, storeId?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    // Initial data fetch
    const fetchData = async () => {
      const { data: initialData, error } = await supabase
        .from(table)
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && initialData) {
        setData(initialData);
      }
      setLoading(false);
    };

    fetchData();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new as any, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, storeId]);

  return { data, loading, setData };
}