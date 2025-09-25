import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "react-native-paper";
import theme from "../utils/theme";

export default function ExamCard({ exam, onPress, showStatus = true }) {
  // Add safety check for exam data
  if (!exam) {
    return null;
  }

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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.examName}>{exam.name}</Text>
              <Text style={styles.examSubject}>{exam.subjectId?.name || "Subject"}</Text>
            </View>
            {showStatus && (
              <View style={[
                styles.status,
                { backgroundColor: getExamStatusColor(exam) }
              ]}>
                <Text style={styles.statusText}>
                  {getExamStatusText(exam)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.typeContainer}>
            <View style={[
              styles.typeBadge,
              { backgroundColor: getExamTypeColor(exam.type) }
            ]}>
              <Text style={styles.typeText}>
                {formatExamType(exam.type)}
              </Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>
                {new Date(exam.examDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>
                {exam.startTime} - {exam.endTime}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>
                {exam.duration} minutes
              </Text>
            </View>
            {exam.venue && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>
                  {exam.venue}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.marksContainer}>
            <View style={styles.marksRow}>
              <Text style={styles.marksLabel}>Total Marks:</Text>
              <Text style={styles.marksValue}>{exam.totalMarks}</Text>
            </View>
            <View style={styles.marksRow}>
              <Text style={styles.marksLabel}>Passing Marks:</Text>
              <Text style={styles.marksValue}>{exam.passingMarks}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
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
  status: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  typeContainer: {
    marginBottom: theme.spacing.md,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  typeText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  details: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  marksContainer: {
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
});
