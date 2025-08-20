import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../utils/theme';
import apiService from '../services/apiService';

const HomeworkModal = ({ visible, onClose, homework = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    dueDate: new Date(),
  });

  useEffect(() => {
    if (visible) {
      console.log('Modal became visible, loading data...');
      const loadData = async () => {
        await loadSubjectsAndClasses();
        loadFormData();
      };
      loadData();
    }
  }, [visible, homework]);

  const loadFormData = () => {
    if (homework) {
      const formDataToSet = {
        title: homework.title || '',
        description: homework.description || '',
        subjectId: homework.subjectId?._id || homework.subjectId || '',
        classId: homework.classId?._id || homework.classId || '',
        dueDate: homework.dueDate ? new Date(homework.dueDate) : new Date(),
      };
      setFormData(formDataToSet);
    } else {
      const defaultFormData = {
        title: '',
        description: '',
        subjectId: '',
        classId: '',
        dueDate: new Date(),
      };
      setFormData(defaultFormData);
    }
  };

  const loadSubjectsAndClasses = async () => {
    try {
      console.log('Loading subjects and classes...');
      
      // Try to get teacher's assigned subjects and classes first
      let subjectsResponse, classesResponse;
      
      try {
        // Get both timetable and assigned subjects and classes
        const [assignedSubjectsResponse, timetableSubjectsResponse, timetableClassesResponse, assignedClassesResponse] = await Promise.all([
          apiService.subjects.getTeacherAssignedSubjects(),
          apiService.subjects.getTeacherTimetableSubjects(),
          apiService.classes.getTeacherTimetableClasses(),
          apiService.classes.getTeacherAssignedClasses()
        ]);

        // Combine and deduplicate subjects
        const assignedSubjectsData = assignedSubjectsResponse?.success ? assignedSubjectsResponse.data : [];
        const timetableSubjectsData = timetableSubjectsResponse?.success ? timetableSubjectsResponse.data : [];
        
        // Combine subjects and remove duplicates based on _id
        const allSubjects = [...assignedSubjectsData, ...timetableSubjectsData];
        const uniqueSubjects = allSubjects.filter((subject, index, self) => 
          index === self.findIndex(s => s._id === subject._id)
        );

        subjectsResponse = { success: true, data: uniqueSubjects };

        // Combine and deduplicate classes
        const timetableClassesData = timetableClassesResponse?.success ? timetableClassesResponse.data : [];
        const assignedClassesData = assignedClassesResponse?.success ? assignedClassesResponse.data : [];
        
        // Combine classes and remove duplicates based on _id
        const allClasses = [...timetableClassesData, ...assignedClassesData];
        const uniqueClasses = allClasses.filter((cls, index, self) => 
          index === self.findIndex(c => c._id === cls._id)
        );

        classesResponse = { success: true, data: uniqueClasses };
        
      } catch (error) {
        // Fallback to getting all subjects and classes if teacher-specific endpoints don't exist
        console.log('Teacher-specific endpoints failed, falling back to getAll methods...');
        
        try {
          const [subjectsResult, classesResult] = await Promise.all([
            apiService.subjects.getAll(),
            apiService.classes.getAllClasses()
          ]);
          
          subjectsResponse = subjectsResult;
          classesResponse = classesResult;
          
        } catch (fallbackError) {
          console.error('Fallback methods also failed:', fallbackError);
          throw fallbackError;
        }
      }

      if (subjectsResponse?.success) {
        console.log('Setting subjects:', subjectsResponse.data?.length || 0);
        setSubjects(subjectsResponse.data || []);
      } else {
        console.log('No subjects found');
        setSubjects([]);
      }

      if (classesResponse?.success) {
        console.log('Setting classes:', classesResponse.data?.length || 0);
        setClasses(classesResponse.data || []);
      } else {
        console.log('No classes found');
        setClasses([]);
      }
    } catch (error) {
      console.error('Error loading subjects and classes:', error);
      setSubjects([]);
      setClasses([]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!formData.subjectId) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }
    if (!formData.classId) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        dueDate: formData.dueDate.toISOString(),
      };

      let response;
      if (homework) {
        response = await apiService.homework.update(homework._id, submitData);
      } else {
        response = await apiService.homework.create(submitData);
      }

      if (response.success) {
        onSuccess(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to save homework');
      }
    } catch (error) {
      console.error('Error saving homework:', error);
      Alert.alert('Error', 'Failed to save homework. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dueDate: selectedDate }));
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject.name : 'Select Subject';
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c._id === classId);
    return cls ? `Class ${cls.grade}${cls.division}` : 'Select Class';
  };

  return (
    <>
      {/* Main Homework Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {homework ? 'Edit Homework' : 'Create Homework'}
            </Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={styles.saveButton} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter homework title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter homework description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Subject *</Text>
                <TouchableOpacity 
                  style={styles.pickerButton} 
                  onPress={() => setShowSubjectPicker(true)}
                >
                  <Text style={styles.pickerButtonText}>{getSubjectName(formData.subjectId)}</Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Class *</Text>
                <TouchableOpacity 
                  style={styles.pickerButton} 
                  onPress={() => setShowClassPicker(true)}
                >
                  <Text style={styles.pickerButtonText}>{getClassName(formData.classId)}</Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date *</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.dueDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Subject Picker Modal */}
      <Modal
        visible={showSubjectPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerModalContent}>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject._id}
                    style={styles.pickerOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, subjectId: subject._id }));
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{subject.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No subjects available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerModalContent}>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <TouchableOpacity
                    key={cls._id}
                    style={styles.pickerOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, classId: cls._id }));
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>
                      Class {cls.grade}{cls.division}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No classes available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...theme.typography.body1,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    ...theme.typography.body1,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  textArea: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  pickerButtonText: {
    ...theme.typography.body1,
    color: theme.colors.text,
    flex: 1,
  },
  pickerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  pickerModal: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10000,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  pickerModalTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: '600',
  },
  pickerModalContent: {
    padding: theme.spacing.md,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  pickerOptionText: {
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  pickerEmptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  pickerEmptyText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.md,
  },
});

export default HomeworkModal;
