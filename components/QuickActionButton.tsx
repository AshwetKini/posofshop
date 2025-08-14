import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface QuickActionButtonProps {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
  color?: string;
}

export function QuickActionButton({ 
  title, 
  icon: Icon, 
  onPress, 
  color = '#3B82F6' 
}: QuickActionButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, { borderColor: color }]} onPress={onPress}>
      <Icon size={24} color={color} strokeWidth={2} />
      <Text style={[styles.title, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});