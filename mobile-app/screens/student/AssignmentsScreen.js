import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import theme from "../../utils/theme";

export default function AssignmentsScreen({ navigation }) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [submissionModal, setSubmissionModal] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, [selectedFilter]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        student_id: user.id,
        ...(selectedFilter !== "all" && { status: selectedFilter }),
      };

      const response = await apiService.assignments.getAssignments(params);
      setAssignments(response.data || []);
    } catch (error) {
      console.error("Assignments error:", error);
      Alert.alert("Error", "Failed to load assignments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleSubmitAssignment = async () => {
    if (!submissionText.trim()) {
      Alert.alert("Error", "Please enter your submission");
      return;
    }

    try {
      setSubmittingAssignment(true);
      const submissionData = {
        student_id: user.id,
        submission_text: submissionText,
        submitted_at: new Date().toISOString(),
      };

      await apiService.assignments.submitAssignment(submissionModal.id, submissionData);

      Alert.alert("Success", "Assignment submitted successfully!");
      setSubmissionModal(null);
      setSubmissionText("");
      loadAssignments(); // Refresh the list
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to submit assignment");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return theme.colors.warning;
      case "submitted":
        return theme.colors.info;
      case "graded":
        return theme.colors.success;
      case "overdue":
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "submitted":
        return "checkmark-circle-outline";
      case "graded":
        return "trophy-outline";
      case "overdue":
        return "alert-circle-outline";
      default:
        return "document-text-outline";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    return `${diffDays} days left`;
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {["all", "pending", "submitted", "graded"].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
          onPress={() => setSelectedFilter(filter)}
        >
          <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAssignmentCard = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} style={styles.assignmentCard}>
      <Card style={styles.card} onPress={() => navigation.navigate("AssignmentDetail", { assignment: item })}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectText}>{item.subject_id?.name || "Unknown Subject"}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={theme.colors.textLight} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.assignmentTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.assignmentDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.dueDateText}>Due: {formatDate(item.due_date)}</Text>
          </View>

          <Text style={[styles.daysLeftText, item.status === "overdue" && styles.overdueText]}>
            {getDaysUntilDue(item.due_date)}
          </Text>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionContainer}>
            <Button
              title="Submit Assignment"
              icon="cloud-upload-outline"
              size="small"
              onPress={() => setSubmissionModal(item)}
              fullWidth
            />
          </View>
        )}

        {item.status === "graded" && item.grade && (
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeLabel}>Grade:</Text>
            <Text style={styles.gradeValue}>{item.grade.percentage}%</Text>
          </View>
        )}
      </Card>
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Assignments Found</Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === "all"
          ? "No assignments have been assigned yet."
          : `No ${selectedFilter} assignments found.`}
      </Text>
      <Button
        title="Refresh"
        icon="refresh-outline"
        variant="outline"
        onPress={loadAssignments}
        style={styles.refreshButton}
      />
    </View>
  );

  const renderSubmissionModal = () => (
    <Modal
      visible={!!submissionModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSubmissionModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Assignment</Text>
            <TouchableOpacity onPress={() => setSubmissionModal(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.assignmentTitleModal}>{submissionModal?.title}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Submission:</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder="Enter your assignment submission here..."
              placeholderTextColor={theme.colors.placeholder}
              value={submissionText}
              onChangeText={setSubmissionText}
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setSubmissionModal(null)}
              style={styles.cancelButton}
            />
            <Button
              title="Submit"
              icon="cloud-upload-outline"
              loading={submittingAssignment}
              onPress={handleSubmitAssignment}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")} style={styles.calendarButton}>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {renderFilterTabs()}

      <FlatList
        data={assignments}
        renderItem={renderAssignmentCard}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading && renderEmptyState()}
      />

      {renderSubmissionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  calendarButton: {
    padding: theme.spacing.sm,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.textLight,
    fontWeight: "600",
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  assignmentCard: {
    marginBottom: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  subjectContainer: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  subjectText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
    fontWeight: "600",
  },
  assignmentTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  assignmentDescription: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  daysLeftText: {
    ...theme.typography.body2,
    color: theme.colors.warning,
    fontWeight: "600",
  },
  overdueText: {
    color: theme.colors.error,
  },
  actionContainer: {
    marginTop: theme.spacing.sm,
  },
  gradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
  },
  gradeLabel: {
    ...theme.typography.body2,
    color: theme.colors.primary,
  },
  gradeValue: {
    ...theme.typography.h6,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptyDescription: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  refreshButton: {
    minWidth: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  assignmentTitleModal: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.typography.body1,
    color: theme.colors.text,
    textAlignVertical: "top",
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  submitButton: {
    flex: 1,
  },
});
