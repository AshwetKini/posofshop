import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function DashboardCard({ title, value, subtitle, color = '#3B82F6' }: DashboardCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});