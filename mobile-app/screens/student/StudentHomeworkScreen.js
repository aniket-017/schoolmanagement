import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import theme from '../../utils/theme';
import apiService from '../../services/apiService';
import HomeworkCard from '../../components/HomeworkCard';
import HomeworkDetailModal from '../../components/HomeworkDetailModal';
import Card from '../../components/ui/Card';

const StudentHomeworkScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [homework, setHomework] = useState([]);
  const [filteredHomework, setFilteredHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadHomework();
  }, []);

  useEffect(() => {
    filterAndSortHomework();
  }, [homework, filter, searchTerm]);

  const loadHomework = async () => {
    try {
      setLoading(true);
      const response = await apiService.homework.getAll({ limit: 100 });
      
      if (response.success) {
        setHomework(response.data || []);
      } else {
        console.error('Failed to load homework:', response.message);
      }
    } catch (error) {
      console.error('Error loading homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomework();
    setRefreshing(false);
  };

  const filterAndSortHomework = () => {
    let filtered = [...homework];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (hw) =>
          hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'due_today':
        filtered = filtered.filter((hw) => {
          const today = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
        break;
      case 'due_tomorrow':
        filtered = filtered.filter((hw) => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === tomorrow.toDateString();
        });
        break;
      case 'overdue':
        filtered = filtered.filter((hw) => {
          const now = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate < now;
        });
        break;
      case 'completed':
        filtered = filtered.filter((hw) => hw.isActive === false);
        break;
      default:
        break;
    }

    // Sort by due date (earliest first)
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setFilteredHomework(filtered);
  };

  const getFilterButtonStyle = (filterValue) => ({
    ...styles.filterButton,
    backgroundColor: filter === filterValue ? theme.colors.primary : theme.colors.surface,
  });

  const getFilterTextStyle = (filterValue) => ({
    ...styles.filterButtonText,
    color: filter === filterValue ? theme.colors.textLight : theme.colors.text,
  });

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
      <Animatable.View animation="fadeInDown" duration={500} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Homework</Text>
          <Text style={styles.headerSubtitle}>
            {filteredHomework.length} assignment{filteredHomework.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Animatable.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search homework..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animatable.View>

        {/* Filter Buttons */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={getFilterButtonStyle('all')}
              onPress={() => setFilter('all')}
            >
              <Text style={getFilterTextStyle('all')}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getFilterButtonStyle('due_today')}
              onPress={() => setFilter('due_today')}
            >
              <Text style={getFilterTextStyle('due_today')}>Due Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getFilterButtonStyle('due_tomorrow')}
              onPress={() => setFilter('due_tomorrow')}
            >
              <Text style={getFilterTextStyle('due_tomorrow')}>Due Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getFilterButtonStyle('overdue')}
              onPress={() => setFilter('overdue')}
            >
              <Text style={getFilterTextStyle('overdue')}>Overdue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getFilterButtonStyle('completed')}
              onPress={() => setFilter('completed')}
            >
              <Text style={getFilterTextStyle('completed')}>Completed</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animatable.View>

        {/* Homework List */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.homeworkContainer}>
          {filteredHomework.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Homework Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm || filter !== 'all'
                  ? 'No homework matches your current filters. Try adjusting your search or filters.'
                  : 'You have no homework assignments at the moment.'}
              </Text>
            </View>
          ) : (
            <View style={styles.homeworkList}>
              {filteredHomework.map((hw, index) => (
                <Animatable.View
                  key={hw._id}
                  animation="fadeInUp"
                  delay={500 + index * 100}
                  style={styles.homeworkItem}
                >
                  <HomeworkCard
                    homework={hw}
                    showActions={false} // No buttons for students
                    onPress={() => {
                      setSelectedHomework(hw);
                      setModalVisible(true);
                    }}
                  />
                </Animatable.View>
              ))}
            </View>
          )}
        </Animatable.View>
      </ScrollView>

      {/* Homework Detail Modal */}
      <HomeworkDetailModal
        visible={modalVisible}
        homework={selectedHomework}
        showActions={false}
        onClose={() => {
          setModalVisible(false);
          setSelectedHomework(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textLight,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    opacity: 0.8,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  filterScroll: {
    paddingRight: theme.spacing.md,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  filterButtonText: {
    ...theme.typography.body2,
    fontWeight: '500',
  },
  homeworkContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  homeworkList: {
    gap: theme.spacing.md,
  },
  homeworkItem: {
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
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
});

export default StudentHomeworkScreen;
