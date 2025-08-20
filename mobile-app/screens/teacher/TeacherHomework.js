import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import theme from '../../utils/theme';
import apiService from '../../services/apiService';
import HomeworkCard from '../../components/HomeworkCard';
import HomeworkModal from '../../components/HomeworkModal';
import HomeworkDetailModal from '../../components/HomeworkDetailModal';
import Card from '../../components/ui/Card';

const TeacherHomework = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [homework, setHomework] = useState([]);
  const [filteredHomework, setFilteredHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  useEffect(() => {
    loadHomework();
  }, []);

  useEffect(() => {
    filterAndSortHomework();
  }, [homework, filter, searchTerm, includeCompleted]);

  const loadHomework = async () => {
    try {
      setLoading(true);
      console.log('Loading homework...');
      const homeworkResponse = await apiService.homework.getAll({ 
        limit: 200, 
        includeInactive: true 
      });

      console.log('Homework API response:', homeworkResponse);

      if (homeworkResponse.success) {
        console.log('Setting homework data:', homeworkResponse.data);
        setHomework(homeworkResponse.data || []);
      } else {
        console.warn('Failed to load homework:', homeworkResponse?.message);
        setHomework([]);
      }
    } catch (error) {
      console.error('Error loading homework:', error);
      // Don't show alert on every error, just log it
      setHomework([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortHomework = () => {
    let filtered = [...homework];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(hw => 
          hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `Class ${hw.classId?.grade}${hw.classId?.division}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'due_today':
          const today = new Date();
        filtered = filtered.filter(hw => {
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
        break;
      case 'due_tomorrow':
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(hw => {
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === tomorrow.toDateString();
        });
        break;
      case 'overdue':
          const now = new Date();
        filtered = filtered.filter(hw => {
          const dueDate = new Date(hw.dueDate);
          return dueDate < now;
        });
        break;
      case 'active':
        filtered = filtered.filter(hw => hw.isActive !== false);
        break;
      case 'completed':
        filtered = filtered.filter(hw => hw.isActive === false);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply completed filter
    if (!includeCompleted) {
      filtered = filtered.filter(hw => hw.isActive !== false);
    }

    // Apply sorting - always sort by due date (earliest first)
    filtered.sort((a, b) => {
      const aValue = new Date(a.dueDate);
      const bValue = new Date(b.dueDate);
      return aValue - bValue; // Ascending order (earliest due date first)
    });

    setFilteredHomework(filtered);
  };

  const handleCreateHomework = () => {
    setEditingHomework(null);
    setShowHomeworkModal(true);
  };

  const handleEditHomework = (homework) => {
    setEditingHomework(homework);
    setShowHomeworkModal(true);
  };

  const handleDeleteHomework = async (homeworkId) => {
    Alert.alert(
      'Delete Homework',
      'Are you sure you want to delete this homework? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.homework.delete(homeworkId);
              if (response.success) {
                setHomework(prev => prev.filter(hw => hw._id !== homeworkId));
                Alert.alert('Success', 'Homework deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete homework');
              }
            } catch (error) {
              console.error('Error deleting homework:', error);
              Alert.alert('Error', 'Failed to delete homework. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleMarkCompleted = async (homeworkId) => {
    try {
      const response = await apiService.homework.update(homeworkId, { isActive: false });
      if (response.success) {
        // Update local state to mark as completed
        setHomework(prev => prev.map(hw => 
          hw._id === homeworkId ? { ...hw, isActive: false } : hw
        ));
        Alert.alert('Success', 'Homework marked as completed');
      } else {
        Alert.alert('Error', response.message || 'Failed to mark homework as completed');
      }
    } catch (error) {
      console.error('Error marking homework as completed:', error);
      Alert.alert('Error', 'Failed to mark homework as completed. Please try again.');
    }
  };

  const handleViewDetails = (homework) => {
    setSelectedHomework(homework);
    setShowDetailModal(true);
  };

  const handleHomeworkSuccess = (newHomework) => {
    console.log('handleHomeworkSuccess called with:', newHomework);
    console.log('Current homework state:', homework);
    
    if (editingHomework) {
      console.log('Updating existing homework');
      setHomework(prev => {
        const updated = prev.map(hw => hw._id === newHomework._id ? newHomework : hw);
        console.log('Updated homework state:', updated);
        return updated;
      });
    } else {
      console.log('Adding new homework');
      setHomework(prev => {
        const updated = [newHomework, ...prev];
        console.log('Updated homework state:', updated);
        return updated;
      });
    }
    setShowHomeworkModal(false);
    setEditingHomework(null);
  };

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'due_today': return 'today-outline';
      case 'due_tomorrow': return 'time-outline';
      case 'overdue': return 'alert-circle-outline';
      case 'active': return 'checkmark-circle-outline';
      case 'completed': return 'archive-outline';
      default: return 'list-outline';
    }
  };

  const getFilterColor = (filterType) => {
    switch (filterType) {
      case 'due_today': return theme.colors.warning;
      case 'due_tomorrow': return theme.colors.secondary;
      case 'overdue': return theme.colors.error;
      case 'active': return theme.colors.success;
      case 'completed': return theme.colors.textSecondary;
      default: return theme.colors.primary;
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'due_today', label: 'Due Today', icon: 'today-outline' },
    { key: 'due_tomorrow', label: 'Due Tomorrow', icon: 'time-outline' },
    { key: 'overdue', label: 'Overdue', icon: 'alert-circle-outline' },
    { key: 'active', label: 'Active', icon: 'checkmark-circle-outline' },
    { key: 'completed', label: 'Completed', icon: 'archive-outline' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading homework...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homework Management</Text>
        <TouchableOpacity onPress={handleCreateHomework} style={styles.addButton}>
          <Ionicons name="add" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHomework} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search homework..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
            </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((option) => (
                    <TouchableOpacity
              key={option.key}
                      style={[
                styles.filterTab,
                filter === option.key && styles.filterTabActive
                      ]}
              onPress={() => setFilter(option.key)}
                    >
                      <Ionicons
                name={option.icon} 
                        size={16}
                color={filter === option.key ? theme.colors.textLight : getFilterColor(option.key)} 
              />
              <Text style={[
                styles.filterTabText,
                filter === option.key && styles.filterTabTextActive
              ]}>
                {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

        {/* Include Completed Toggle */}
        <View style={styles.completedToggleContainer}>
          <TouchableOpacity
            style={[
              styles.completedToggle,
              includeCompleted && styles.completedToggleActive
            ]}
            onPress={() => setIncludeCompleted(!includeCompleted)}
          >
            <Ionicons 
              name={includeCompleted ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={includeCompleted ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.completedToggleText,
              includeCompleted && styles.completedToggleTextActive
            ]}>
              Include Completed Homework
            </Text>
          </TouchableOpacity>
        </View>

        {/* Homework List */}
        <View style={styles.homeworkContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'All Homework' : filterOptions.find(f => f.key === filter)?.label}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredHomework.length} {filteredHomework.length === 1 ? 'assignment' : 'assignments'}
              </Text>
            </View>

            {filteredHomework.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No homework found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first homework assignment'}
                  </Text>
              {!searchTerm && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateHomework}>
                  <Text style={styles.emptyStateButtonText}>Create Homework</Text>
                    </TouchableOpacity>
                  )}
                </View>
          ) : (
            filteredHomework.map((hw) => (
              <Animatable.View key={hw._id} animation="fadeInUp" delay={100}>
                  <HomeworkCard
                    homework={hw}
                    onPress={() => handleViewDetails(hw)}
                    onEdit={handleEditHomework}
                    onDelete={handleDeleteHomework}
                    onMarkCompleted={handleMarkCompleted}
                    showActions={true}
                  />
                </Animatable.View>
              ))
            )}
            
            {/* Bottom spacing to ensure last card is fully visible */}
            <View style={styles.bottomSpacing} />
          </View>
      </ScrollView>

      {/* Homework Modal */}
      <HomeworkModal
        visible={showHomeworkModal}
        onClose={() => {
          setShowHomeworkModal(false);
          setEditingHomework(null);
        }}
        homework={editingHomework}
        onSuccess={handleHomeworkSuccess}
      />

      {/* Homework Detail Modal */}
      <HomeworkDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        homework={selectedHomework}
        onEdit={handleEditHomework}
        onDelete={handleDeleteHomework}
        onMarkCompleted={handleMarkCompleted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: '600',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  addButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl * 2, // Add padding at the bottom for the last card
  },
  searchContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterContent: {
    paddingRight: theme.spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: theme.colors.textLight,
  },
  completedToggleContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  completedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  completedToggleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  completedToggleText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
  completedToggleTextActive: {
    color: theme.colors.primary,
  },


  homeworkContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyStateTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyStateButtonText: {
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  bottomSpacing: {
    height: theme.spacing.xl * 2, // Adjust as needed for spacing
  },
});

export default TeacherHomework;
