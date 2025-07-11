import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";
import apiService from "../../services/apiService";

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

export default function ClassesScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAssignedClasses();
  }, []);

  const loadAssignedClasses = async () => {
    try {
      setLoading(true);
      const response = await apiService.classes.getTeacherAssignedClasses();
      
      if (response.success) {
        setClasses(response.data);
        setSummary(response.summary);
      } else {
        Alert.alert("Error", response.message || "Failed to load classes");
      }
    } catch (error) {
      console.error("Error loading assigned classes:", error);
      Alert.alert("Error", "Failed to load your assigned classes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignedClasses();
  };

  const handleClassPress = (classItem) => {
    navigation.navigate("ClassDetails", {
      classId: classItem._id,
      className: `${classItem.grade}${getOrdinalSuffix(classItem.grade)} Class - ${classItem.division}`,
    });
  };

  const renderHeader = () => (
    <LinearGradient colors={theme.colors.gradients.primary} style={styles.header}>
      <Animatable.View animation="fadeInDown" delay={200}>
        <Text style={styles.headerTitle}>My Assigned Classes</Text>
        <Text style={styles.headerSubtitle}>
          You are assigned as Class Teacher for {summary.totalClasses || 0} class(es)
        </Text>
      </Animatable.View>
    </LinearGradient>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Animatable.View animation="fadeInUp" delay={300} style={styles.summaryCard}>
        <Ionicons name="school" size={24} color={theme.colors.primary} />
        <Text style={styles.summaryNumber}>{summary.totalClasses || 0}</Text>
        <Text style={styles.summaryLabel}>Classes</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400} style={styles.summaryCard}>
        <Ionicons name="people" size={24} color={theme.colors.primary} />
        <Text style={styles.summaryNumber}>{summary.totalStudents || 0}</Text>
        <Text style={styles.summaryLabel}>Students</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500} style={styles.summaryCard}>
        <Ionicons name="book" size={24} color={theme.colors.primary} />
        <Text style={styles.summaryNumber}>{summary.totalSubjects || 0}</Text>
        <Text style={styles.summaryLabel}>Subjects</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={600} style={styles.summaryCard}>
        <Ionicons name="document-text" size={24} color={theme.colors.primary} />
        <Text style={styles.summaryNumber}>{summary.totalRecentAssignments || 0}</Text>
        <Text style={styles.summaryLabel}>Recent Assignments</Text>
      </Animatable.View>
    </View>
  );

  const renderClassCard = (classItem, index) => (
    <Animatable.View
      key={classItem._id}
      animation="fadeInUp"
      delay={700 + index * 100}
      style={styles.classCardContainer}
    >
      <Card style={styles.classCard} onPress={() => handleClassPress(classItem)}>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.className}>
              {classItem.grade}
              {getOrdinalSuffix(classItem.grade)} Class - {classItem.division}
            </Text>
            <Text style={styles.classDetails}>
              Academic Year: {classItem.academicYear}
            </Text>
            <Text style={styles.classDetails}>
              Classroom: {classItem.classroom || "Not assigned"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </View>

        <View style={styles.classStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{classItem.studentCount || 0} Students</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="book" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{classItem.subjectsCount || 0} Subjects</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{classItem.recentAssignments || 0} Recent Assignments</Text>
          </View>
        </View>

        {classItem.subjects && classItem.subjects.length > 0 && (
          <View style={styles.subjectsContainer}>
            <Text style={styles.subjectsTitle}>Subjects:</Text>
            <View style={styles.subjectsList}>
              {classItem.subjects.slice(0, 3).map((subject, idx) => (
                <View key={idx} style={styles.subjectChip}>
                  <Text style={styles.subjectText}>
                    {subject.subject?.name || "Unknown Subject"}
                  </Text>
                </View>
              ))}
              {classItem.subjects.length > 3 && (
                <Text style={styles.moreSubjects}>+{classItem.subjects.length - 3} more</Text>
              )}
            </View>
          </View>
        )}
      </Card>
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Classes Assigned</Text>
      <Text style={styles.emptySubtitle}>
        You haven't been assigned as a Class Teacher to any classes yet. Please contact the administration.
      </Text>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your classes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {classes.length > 0 ? (
          <>
            {renderSummaryCards()}
            <View style={styles.classesContainer}>
              <Text style={styles.sectionTitle}>Your Assigned Classes</Text>
              {classes.map((classItem, index) => renderClassCard(classItem, index))}
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    marginHorizontal: "1%",
    ...theme.shadows.sm,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  classesContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  classCardContainer: {
    marginBottom: theme.spacing.md,
  },
  classCard: {
    padding: 0,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  classDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  classStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  statItem: {
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  subjectsContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subjectsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  subjectChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  subjectText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  moreSubjects: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
