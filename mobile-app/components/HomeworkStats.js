import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';
import Card from './ui/Card';

const HomeworkStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total',
      value: stats.total || 0,
      icon: 'book-outline',
      color: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    {
      label: 'Overdue',
      value: stats.overdue || 0,
      icon: 'alert-circle-outline',
      color: theme.colors.error,
      backgroundColor: '#FFEBEE',
    },
    {
      label: 'Due Today',
      value: stats.dueToday || 0,
      icon: 'today-outline',
      color: theme.colors.warning,
      backgroundColor: '#FFF3E0',
    },
    {
      label: 'Due Tomorrow',
      value: stats.dueTomorrow || 0,
      icon: 'time-outline',
      color: theme.colors.secondary,
      backgroundColor: '#FFF8E1',
    },
    {
      label: 'Due This Week',
      value: stats.dueThisWeek || 0,
      icon: 'calendar-outline',
      color: theme.colors.info,
      backgroundColor: '#E3F2FD',
    },
  ];

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Homework Overview</Text>
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.backgroundColor }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeworkStats;

