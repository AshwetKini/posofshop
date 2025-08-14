import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/hooks/useStore';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore(user?.id);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/(auth)/signin');
      return;
    }

    if (!storeLoading) {
      if (!store) {
        router.replace('/(onboarding)/store-setup');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, store, authLoading, storeLoading]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="customers" />
        <Stack.Screen name="suppliers" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="sales" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}