import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';

const HomeworkDetailModal = ({ visible, onClose, homework, onEdit, onDelete, onMarkCompleted, showActions = true }) => {
  if (!homework) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return '#EF4444'; // Red
      case 'due_today':
        return '#F59E0B'; // Orange
      case 'due_tomorrow':
        return '#8B5CF6'; // Purple
      default:
        return '#10B981'; // Green
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

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(homework.dueDate);
  const status = daysUntilDue < 0 ? 'overdue' : daysUntilDue === 0 ? 'due_today' : daysUntilDue === 1 ? 'due_tomorrow' : 'assigned';

  const handleResourcePress = (resource) => {
    if (resource.startsWith('http')) {
      Linking.openURL(resource);
    }
  };

  const handleMarkCompleted = () => {
    if (onMarkCompleted) {
      onMarkCompleted(homework._id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(homework);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(homework._id);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{homework.title}</Text>
            <Text style={styles.headerSubtitle}>
              {homework.subjectId?.name} • {homework.classId?.grade}th Class
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Due Date Section */}
          <View style={styles.dueDateSection}>
            <View style={styles.dueDateHeader}>
              <Ionicons 
                name="warning" 
                size={20} 
                color={getStatusColor(status)} 
              />
              <Text style={[styles.dueDateText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>
            <Text style={styles.dueDateTime}>
              {formatDate(homework.dueDate)} at {formatTime(homework.dueDate)}
            </Text>
          </View>

          {/* Assignment Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Assignment Details</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Assigned by:</Text>
              <Text style={styles.detailValue}>
                {homework.teacherId?.firstName} {homework.teacherId?.lastName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Assigned on:</Text>
              <Text style={styles.detailValue}>
                {formatDate(homework.assignedDate)}
              </Text>
            </View>
          </View>

          {/* Description */}
          {homework.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{homework.description}</Text>
            </View>
          )}

          {/* Instructions */}
          {homework.instructions && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.descriptionText}>{homework.instructions}</Text>
            </View>
          )}

          {/* Resources */}
          {homework.resources && homework.resources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resources ({homework.resources.length})</Text>
              {homework.resources.map((resource, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress(resource)}
                >
                  <Ionicons 
                    name={resource.startsWith('http') ? 'link' : 'document-text'} 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.resourceText} numberOfLines={2}>
                    {resource}
                  </Text>
                  {resource.startsWith('http') && (
                    <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Student Progress */}
          {homework.studentProgress && homework.studentProgress.length > 0 && (
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Student Progress</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(homework.studentProgress.filter(p => p.status === 'completed').length / homework.studentProgress.length) * 100}%` }]} />
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressNumber}>
                    {homework.studentProgress.filter(p => p.status === 'completed').length}
                  </Text>
                  <Text style={styles.progressLabel}>Completed</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressNumber}>
                    {homework.studentProgress.filter(p => p.status === 'reading').length}
                  </Text>
                  <Text style={styles.progressLabel}>In Progress</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressNumber}>
                    {homework.studentProgress.filter(p => p.status === 'assigned').length}
                  </Text>
                  <Text style={styles.progressLabel}>Not Started</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actionButtons}>
            {/* First row: Edit and Delete buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton, styles.halfWidthButton]} 
                onPress={handleEdit}
              >
                <Ionicons name="pencil" size={20} color="white" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton, styles.halfWidthButton]} 
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Second row: Mark as Complete button */}
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton, styles.fullWidthButton]} 
              onPress={handleMarkCompleted}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 10,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dueDateSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  dueDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  dueDateTime: {
    fontSize: 15,
    color: '#92400E',
    marginLeft: 24,
    fontWeight: '500',
  },
  detailsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    paddingVertical: 0,
    minHeight: 0,
    height: 'auto',
    paddingHorizontal: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 0,
    marginRight: 8,
    minWidth: 70,
    fontWeight: '600',
    paddingVertical: 0,
    lineHeight: 14,
    marginTop: 0,
    marginBottom: 0,
  },
  detailValue: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
    fontWeight: '600',
    paddingVertical: 0,
    lineHeight: 14,
    marginTop: 0,
    marginBottom: 0,
  },
  descriptionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    fontWeight: '500',
  },
  progressSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 6,
  },
  resourceText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
  },
  actionButtons: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfWidthButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fullWidthButton: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#059669',
  },
  editButton: {
    backgroundColor: '#2563EB',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default HomeworkDetailModal;

