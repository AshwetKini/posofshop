import { Stack } from 'expo-router';

export default function SalesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new" />
      <Stack.Screen name="view/[id]" />
      <Stack.Screen name="payment/[id]" />
    </Stack>
  );
}