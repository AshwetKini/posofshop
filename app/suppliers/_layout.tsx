import { Stack } from 'expo-router';

export default function SuppliersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
    </Stack>
  );
}