import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Card } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";

export default function TeacherExamsScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [exams, setExams] = useState([]);
  const [groupedExams, setGroupedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled
  const [expandedExams, setExpandedExams] = useState(new Set());
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadTeacherClasses();
  }, [user]);

  useEffect(() => {
    if (teacherClasses.length > 0) {
      loadExams();
    }
  }, [teacherClasses, selectedClass]);

  const loadTeacherClasses = async () => {
    try {
      const response = await apiService.classes.getTeacherAssignedClasses();
      if (response && response.success && Array.isArray(response.data)) {
        setTeacherClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading teacher classes:", error);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      
      if (!selectedClass) {
        console.log("No class selected");
        setExams([]);
        setGroupedExams([]);
        return;
      }

      console.log("Loading exams for teacher class ID:", selectedClass);
      
      // Load exams for the selected class
      const response = await apiService.examinations.getExaminationsByClass(selectedClass, {
        upcoming: "true",
        limit: 50,
      });
      
      console.log("Teacher exams response:", response);
      
      if (response && response.success && Array.isArray(response.data)) {
        // Store individual exams
        setExams(response.data);
        
        // Group exams by name automatically
        const grouped = groupExamsByName(response.data);
        console.log("Grouped teacher exams:", grouped);
        setGroupedExams(grouped);
      } else {
        console.log("No exams found or invalid response:", response);
        setExams([]);
        setGroupedExams([]);
      }
    } catch (error) {
      console.error("Error loading teacher exams:", error);
      setExams([]);
      setGroupedExams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExams();
  };

  // Toggle expanded state for exam groups
  const toggleExpanded = (examName) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examName)) {
      newExpanded.delete(examName);
    } else {
      newExpanded.add(examName);
    }
    setExpandedExams(newExpanded);
  };

  // Group exams by name manually (fallback function)
  const groupExamsByName = (exams) => {
    const grouped = {};
    
    exams.forEach(exam => {
      const examName = exam.name;
      if (!grouped[examName]) {
        grouped[examName] = {
          _id: examName, // Use name as ID for grouping
          examName: examName,
          examType: exam.type,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          instructions: exam.instructions,
          syllabus: exam.syllabus,
          allowedMaterials: exam.allowedMaterials,
          academicYear: exam.academicYear,
          semester: exam.semester,
          instances: [],
          instanceCount: 0,
          earliestDate: exam.examDate,
          latestDate: exam.examDate,
          statuses: [exam.status]
        };
      }
      
      // Add instance
      grouped[examName].instances.push({
        _id: exam._id,
        classId: exam.classId,
        subjectId: exam.subjectId,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        venue: exam.venue,
        status: exam.status,
        invigilators: exam.invigilators,
        classInfo: exam.classId, // Now populated with name and division
        subjectInfo: exam.subjectId, // Now populated with name and code
        invigilatorInfo: exam.invigilators,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt
      });
      
      // Update counts and dates
      grouped[examName].instanceCount++;
      if (new Date(exam.examDate) < new Date(grouped[examName].earliestDate)) {
        grouped[examName].earliestDate = exam.examDate;
      }
      if (new Date(exam.examDate) > new Date(grouped[examName].latestDate)) {
        grouped[examName].latestDate = exam.examDate;
      }
      if (!grouped[examName].statuses.includes(exam.status)) {
        grouped[examName].statuses.push(exam.status);
      }
    });
    
    return Object.values(grouped);
  };

  const getFilteredGroupedExams = () => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return groupedExams.filter(examGroup => 
          examGroup.instances.some(instance => 
            new Date(instance.examDate) >= now && instance.status === "scheduled"
          )
        );
      case "completed":
        return groupedExams.filter(examGroup => 
          examGroup.statuses.includes("completed")
        );
      case "cancelled":
        return groupedExams.filter(examGroup => 
          examGroup.statuses.includes("cancelled")
        );
      default:
        return groupedExams;
    }
  };

  const getExamStatusColor = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.examDate);
    
    switch (exam.status) {
      case "completed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      case "ongoing":
        return theme.colors.warning;
      case "scheduled":
        if (examDate < now) {
          return theme.colors.error;
        } else if (examDate.toDateString() === now.toDateString()) {
          return theme.colors.warning;
        } else {
          return theme.colors.info;
        }
      default:
        return theme.colors.grey;
    }
  };

  const getExamStatusText = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.examDate);
    
    switch (exam.status) {
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "ongoing":
        return "Ongoing";
      case "scheduled":
        if (examDate < now) {
          return "Overdue";
        } else if (examDate.toDateString() === now.toDateString()) {
          return "Today";
        } else {
          return "Upcoming";
        }
      default:
        return "Unknown";
    }
  };

  const getExamTypeColor = (type) => {
    const colors = {
      unit_test: theme.colors.primary,
      midterm: theme.colors.warning,
      final: theme.colors.error,
      practical: theme.colors.success,
      project: theme.colors.info,
      assignment: theme.colors.secondary,
    };
    return colors[type] || theme.colors.primary;
  };

  const formatExamType = (type) => {
    if (!type || typeof type !== 'string') {
      return 'Unknown';
    }
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };


  const renderGroupedExamCard = ({ item: examGroup }) => {
    if (!examGroup) {
      return null;
    }

    const isExpanded = expandedExams.has(examGroup.examName);

    return (
      <View style={styles.examCardContainer}>
        {/* Main exam group card */}
        <TouchableOpacity
          onPress={() => toggleExpanded(examGroup.examName)}
          activeOpacity={0.8}
        >
          <Card style={styles.examCard}>
            <Card.Content>
              <View style={styles.examHeader}>
                <View style={styles.examTitleContainer}>
                  <View style={styles.groupHeaderRow}>
                    <Ionicons 
                      name={isExpanded ? "chevron-down" : "chevron-forward"} 
                      size={20} 
                      color={theme.colors.textSecondary} 
                    />
                    <Text style={styles.examName}>{examGroup.examName}</Text>
                  </View>
                  <Text style={styles.examSubject}>
                    {examGroup.instanceCount} instance{examGroup.instanceCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[
                  styles.examTypeBadge,
                  { backgroundColor: getExamTypeColor(examGroup.examType) }
                ]}>
                  <Text style={styles.examTypeText}>
                    {formatExamType(examGroup.examType)}
                  </Text>
                </View>
              </View>

              <View style={styles.examDetails}>
                <View style={styles.examDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.examDetailText}>
                    {new Date(examGroup.earliestDate).toLocaleDateString()}
                    {examGroup.earliestDate !== examGroup.latestDate && (
                      <Text style={styles.dateRangeText}>
                        {" - " + new Date(examGroup.latestDate).toLocaleDateString()}
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={styles.examDetailRow}>
                  <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.examDetailText}>
                    {new Set(examGroup.instances.map(i => i.classInfo?.name)).size} class{new Set(examGroup.instances.map(i => i.classInfo?.name)).size !== 1 ? 'es' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.examMarksContainer}>
                <View style={styles.marksRow}>
                  <Text style={styles.marksLabel}>Total Marks:</Text>
                  <Text style={styles.marksValue}>{examGroup.totalMarks}</Text>
                </View>
                <View style={styles.marksRow}>
                  <Text style={styles.marksLabel}>Passing Marks:</Text>
                  <Text style={styles.marksValue}>{examGroup.passingMarks}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        {/* Expanded instances */}
        {isExpanded && (
          <View style={styles.instancesContainer}>
            {examGroup.instances.map((instance, index) => (
              <TouchableOpacity
                key={instance._id}
                onPress={() => {
                  setSelectedExam(instance);
                  setShowExamModal(true);
                }}
                activeOpacity={0.8}
                style={styles.instanceCard}
              >
                <Card style={styles.instanceCardStyle}>
                  <Card.Content>
                    <View style={styles.instanceHeader}>
                      <Text style={styles.instanceTitle}>Instance {index + 1}</Text>
                      <View style={[
                        styles.examStatus,
                        { backgroundColor: getExamStatusColor(instance) }
                      ]}>
                        <Text style={styles.examStatusText}>
                          {getExamStatusText(instance)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.examDetails}>
                      <View style={styles.examDetailRow}>
                        <Ionicons name="school-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.examDetailText}>
                          {instance.classInfo?.name || "Unknown Class"}
                          {instance.classInfo?.division && ` (${instance.classInfo.division})`}
                        </Text>
                      </View>
                      <View style={styles.examDetailRow}>
                        <Ionicons name="book-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.examDetailText}>
                          {instance.subjectInfo?.name || "Unknown Subject"}
                        </Text>
                      </View>
                      <View style={styles.examDetailRow}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.examDetailText}>
                          {new Date(instance.examDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.examDetailRow}>
                        <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.examDetailText}>
                          {instance.startTime} - {instance.endTime}
                        </Text>
                      </View>
                      {instance.venue && (
                        <View style={styles.examDetailRow}>
                          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.examDetailText}>
                            {instance.venue}
                          </Text>
                        </View>
                      )}
                    </View>

                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderClassSelector = () => (
    <View style={styles.classSelectorContainer}>
      <Text style={styles.classSelectorLabel}>Select Class:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.classSelectorButtons}>
          {teacherClasses.map((classItem) => (
            <TouchableOpacity
              key={classItem._id}
              style={[
                styles.classSelectorButton,
                selectedClass === classItem._id && styles.classSelectorButtonActive
              ]}
              onPress={() => setSelectedClass(classItem._id)}
            >
              <Text style={[
                styles.classSelectorButtonText,
                selectedClass === classItem._id && styles.classSelectorButtonTextActive
              ]}>
                {classItem.name} {classItem.division && `(${classItem.division})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const filteredGroupedExams = getFilteredGroupedExams();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, "#3b5998"]}
        style={[styles.header, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Examinations</Text>
            <Text style={styles.headerSubtitle}>
              {`${filteredGroupedExams.length} exam group${filteredGroupedExams.length !== 1 ? 's' : ''} found`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Class Selector */}
      {renderClassSelector()}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {renderFilterButton("all", "All")}
            {renderFilterButton("upcoming", "Upcoming")}
            {renderFilterButton("completed", "Completed")}
            {renderFilterButton("cancelled", "Cancelled")}
          </View>
        </ScrollView>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="school-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.loadingText}>Loading examinations...</Text>
          </View>
        ) : filteredGroupedExams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>
              {filter === "all" 
                ? "No exam groups found" 
                : `No ${filter} exam groups`
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === "all" 
                ? "No examinations scheduled for your classes yet"
                : `No exam groups with status "${filter}" found`
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredGroupedExams}
            renderItem={renderGroupedExamCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.examsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Exam Details Modal */}
      <Modal
        visible={showExamModal && !!selectedExam}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedExam?.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowExamModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Exam Details</Text>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Subject:</Text>
                  <Text style={styles.modalDetailValue}>{selectedExam?.subjectId?.name}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Type:</Text>
                  <Text style={styles.modalDetailValue}>{formatExamType(selectedExam?.type)}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Date:</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedExam?.examDate ? new Date(selectedExam.examDate).toLocaleDateString() : "N/A"}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Time:</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedExam?.startTime} - {selectedExam?.endTime}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Duration:</Text>
                  <Text style={styles.modalDetailValue}>{selectedExam?.duration} minutes</Text>
                </View>
                {selectedExam?.venue && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Venue:</Text>
                    <Text style={styles.modalDetailValue}>{selectedExam.venue}</Text>
                  </View>
                )}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Marks</Text>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Total Marks:</Text>
                  <Text style={styles.modalDetailValue}>{selectedExam?.totalMarks}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Passing Marks:</Text>
                  <Text style={styles.modalDetailValue}>{selectedExam?.passingMarks}</Text>
                </View>
              </View>

              {selectedExam?.instructions && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Instructions</Text>
                  <Text style={styles.modalInstructions}>{selectedExam.instructions}</Text>
                </View>
              )}

              {selectedExam?.syllabus && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Syllabus</Text>
                  <Text style={styles.modalSyllabus}>{selectedExam.syllabus}</Text>
                </View>
              )}

              {selectedExam?.allowedMaterials && selectedExam.allowedMaterials.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Allowed Materials</Text>
                  {selectedExam.allowedMaterials.map((material, index) => (
                    <Text key={index} style={styles.modalMaterial}>• {material}</Text>
                  ))}
                </View>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textLight,
    fontWeight: "bold",
  },
  headerSubtitle: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    opacity: 0.9,
    marginTop: 4,
  },
  classSelectorContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  classSelectorLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    fontWeight: "600",
  },
  classSelectorButtons: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  classSelectorButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  classSelectorButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  classSelectorButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  classSelectorButtonTextActive: {
    color: theme.colors.textLight,
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  filterButtons: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: theme.colors.textLight,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 60, // Extra padding for bottom navigation
  },
  loadingText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 60, // Extra padding for bottom navigation
  },
  emptyText: {
    ...theme.typography.h6,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  examsList: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 60, // Extra padding for bottom navigation
  },
  examCardContainer: {
    marginBottom: theme.spacing.md,
  },
  examCard: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  examTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  examName: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: 4,
  },
  examSubject: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  examStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  examStatusText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  examTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  examTypeText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  examDetails: {
    marginBottom: theme.spacing.md,
  },
  examDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  examDetailText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  examMarksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  marksRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  marksLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  marksValue: {
    ...theme.typography.body2,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  // Grouped exam styles
  groupHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  dateRangeText: {
    color: theme.colors.textSecondary,
  },
  instancesContainer: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.lg,
  },
  instanceCard: {
    marginBottom: theme.spacing.sm,
  },
  instanceCardStyle: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  instanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  instanceTitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalSection: {
    marginBottom: theme.spacing.lg,
  },
  modalSectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  modalDetailLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  modalDetailValue: {
    ...theme.typography.body2,
    color: theme.colors.text,
    flex: 1,
    textAlign: "right",
  },
  modalInstructions: {
    ...theme.typography.body2,
    color: theme.colors.text,
    lineHeight: 20,
  },
  modalSyllabus: {
    ...theme.typography.body2,
    color: theme.colors.text,
    lineHeight: 20,
  },
  modalMaterial: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
});
