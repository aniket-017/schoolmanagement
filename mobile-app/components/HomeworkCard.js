import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';
import Card from './ui/Card';

const HomeworkCard = ({ homework, onPress, onEdit, onDelete, onMarkCompleted, showActions = true }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return theme.colors.error;
      case 'due_today':
        return theme.colors.warning;
      case 'due_tomorrow':
        return theme.colors.secondary;
      default:
        return theme.colors.success;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due_today':
        return 'Due Today';
      case 'due_tomorrow':
        return 'Due Tomorrow';
      default:
        return 'Active';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(homework.dueDate);
  const status = daysUntilDue < 0 ? 'overdue' : daysUntilDue === 0 ? 'due_today' : daysUntilDue === 1 ? 'due_tomorrow' : 'assigned';

  // Check if homework is completed (archived)
  const isCompleted = homework.isActive === false;

  return (
    <Card style={[styles.card, isCompleted && styles.completedCard]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]} numberOfLines={2}>
            {homework.title}
          </Text>
          <View style={styles.statusContainer}>
            {isCompleted && (
              <View style={[styles.statusBadge, styles.completedBadge]}>
                <Ionicons name="checkmark-circle" size={14} color="white" />
                <Text style={styles.completedStatusText}>Completed</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
              <Text style={styles.statusText}>{getStatusText(status)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.dueDateRow}>
        <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.dueDateText, isCompleted && styles.completedText]}>
          Due: {formatDate(homework.dueDate)}
        </Text>
      </View>

      {showActions && (
        <View style={styles.actions}>
          {!isCompleted && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]} 
              onPress={() => onMarkCompleted && onMarkCompleted(homework._id)}
            >
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={[styles.actionText, { color: theme.colors.success }]}>Complete</Text>
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(homework)}>
              <Ionicons name="pencil" size={16} color={theme.colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(homework._id)}>
              <Ionicons name="trash" size={16} color={theme.colors.error} />
              <Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  completedCard: {
    opacity: 0.8,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  completedTitle: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  completedBadge: {
    backgroundColor: theme.colors.success,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: '600',
    fontSize: 10,
  },
  completedStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dueDateText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  completedText: {
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  completeButton: {
    backgroundColor: theme.colors.success + '20', // Light green background
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
});

export default HomeworkCard;

