import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { ProgressChart, LineChart } from "react-native-chart-kit";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import theme from "../../utils/theme";

const { width } = Dimensions.get("window");

export default function StudentDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch various data in parallel
      const [attendanceData, assignmentsData, gradesData, announcementsData, timetableData] = await Promise.all([
        apiService.attendance.getStudentAttendance(user.id, { limit: 30 }),
        apiService.assignments.getAssignments({ student_id: user.id, limit: 5 }),
        apiService.grades.getStudentGrades(user.id, { limit: 10 }),
        apiService.announcements.getAnnouncementsForUser(user.id, { active_only: true, limit: 3 }),
        user.class_id ? apiService.timetable.getClassTimetable(user.class_id) : { data: {} },
      ]);

      // Process data for dashboard
      const processedData = {
        attendance: processAttendanceData(attendanceData.data),
        assignments: assignmentsData.data,
        grades: processGradesData(gradesData.data),
        announcements: announcementsData.data,
        timetable: timetableData.data,
        stats: calculateStats(attendanceData.data, assignmentsData.data, gradesData.data),
      };

      setDashboardData(processedData);
    } catch (error) {
      console.error("Dashboard error:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processAttendanceData = (attendance) => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter((day) => day.status === "present").length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      percentage: attendancePercentage,
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
    };
  };

  const processGradesData = (grades) => {
    if (!grades.grades || grades.grades.length === 0) {
      return { average: 0, trend: [], distribution: [] };
    }

    const gradeValues = grades.grades.map((g) => g.percentage);
    const average = gradeValues.reduce((sum, grade) => sum + grade, 0) / gradeValues.length;

    return {
      average,
      trend: gradeValues.slice(-6), // Last 6 grades for trend
      distribution: grades.grades,
    };
  };

  const calculateStats = (attendance, assignments, grades) => {
    return {
      attendancePercentage:
        attendance.length > 0
          ? ((attendance.filter((a) => a.status === "present").length / attendance.length) * 100).toFixed(1)
          : "0",
      pendingAssignments: assignments.filter ? assignments.filter((a) => a.status === "pending").length : 0,
      averageGrade: grades.summary?.average_percentage || 0,
      totalSubjects: grades.summary?.total_exams || 0,
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderHeader = () => (
    <LinearGradient colors={theme.colors.gradients.primary} style={styles.header}>
      <Animatable.View animation="fadeInDown" delay={200}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{user?.name || "Student"}</Text>
        <Text style={styles.userClass}>
          {user?.class_id ? `Class: ${user.class_id.name} - ${user.class_id.section}` : "No Class Assigned"}
        </Text>
      </Animatable.View>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Animatable.View animation="fadeInUp" delay={300}>
        <Card gradient="primary" style={styles.statsCard} onPress={() => navigation.navigate("Attendance")}>
          <View style={styles.statsContent}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.textLight} />
            <Text style={styles.statsValue}>{dashboardData?.stats.attendancePercentage || "0"}%</Text>
            <Text style={styles.statsLabel}>Attendance</Text>
          </View>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400}>
        <Card gradient="secondary" style={styles.statsCard} onPress={() => navigation.navigate("Assignments")}>
          <View style={styles.statsContent}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.textLight} />
            <Text style={styles.statsValue}>{dashboardData?.stats.pendingAssignments || 0}</Text>
            <Text style={styles.statsLabel}>Pending</Text>
          </View>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500}>
        <Card gradient="success" style={styles.statsCard} onPress={() => navigation.navigate("Grades")}>
          <View style={styles.statsContent}>
            <Ionicons name="trophy-outline" size={24} color={theme.colors.textLight} />
            <Text style={styles.statsValue}>{dashboardData?.stats.averageGrade.toFixed(1) || "0"}%</Text>
            <Text style={styles.statsLabel}>Average</Text>
          </View>
        </Card>
      </Animatable.View>
    </View>
  );

  const renderAttendanceChart = () => {
    if (!dashboardData?.attendance) return null;

    const data = {
      data: [dashboardData.attendance.percentage / 100],
    };

    return (
      <Animatable.View animation="fadeInUp" delay={600}>
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance Overview</Text>
          <View style={styles.chartContainer}>
            <ProgressChart
              data={data}
              width={width - 80}
              height={180}
              strokeWidth={12}
              radius={60}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              }}
              hideLegend={true}
            />
            <View style={styles.chartOverlay}>
              <Text style={styles.chartPercentage}>{dashboardData.attendance.percentage.toFixed(1)}%</Text>
              <Text style={styles.chartLabel}>Present</Text>
            </View>
          </View>
          <View style={styles.attendanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.attendance.presentDays}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.attendance.absentDays}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.attendance.totalDays}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Card>
      </Animatable.View>
    );
  };

  const renderQuickActions = () => (
    <Animatable.View animation="fadeInUp" delay={700}>
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Button
            title="Timetable"
            icon="time-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Timetable")}
            style={styles.actionButton}
          />
          <Button
            title="Assignments"
            icon="document-text-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Assignments")}
            style={styles.actionButton}
          />
          <Button
            title="Grades"
            icon="trophy-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Grades")}
            style={styles.actionButton}
          />
          <Button
            title="Messages"
            icon="chatbubble-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Messages")}
            style={styles.actionButton}
          />
        </View>
      </Card>
    </Animatable.View>
  );

  const renderRecentAnnouncements = () => {
    if (!dashboardData?.announcements || dashboardData.announcements.length === 0) {
      return null;
    }

    return (
      <Animatable.View animation="fadeInUp" delay={800}>
        <Card style={styles.announcementsCard}>
          <Text style={styles.cardTitle}>Recent Announcements</Text>
          {dashboardData.announcements.slice(0, 2).map((announcement, index) => (
            <View key={announcement._id} style={styles.announcementItem}>
              <View style={styles.announcementHeader}>
                <Ionicons name="megaphone-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.announcementTitle} numberOfLines={1}>
                  {announcement.title}
                </Text>
              </View>
              <Text style={styles.announcementContent} numberOfLines={2}>
                {announcement.content}
              </Text>
              <Text style={styles.announcementDate}>{new Date(announcement.created_at).toLocaleDateString()}</Text>
            </View>
          ))}
          <Button
            title="View All"
            variant="ghost"
            size="small"
            onPress={() => navigation.navigate("Announcements")}
            style={styles.viewAllButton}
          />
        </Card>
      </Animatable.View>
    );
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.colors.gradients.primary} style={styles.loadingGradient}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <Ionicons name="school-outline" size={60} color={theme.colors.textLight} />
          </Animatable.View>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderStatsCards()}
        {renderAttendanceChart()}
        {renderQuickActions()}
        {renderRecentAnnouncements()}

        <View style={styles.footer}>
          <Button title="Logout" variant="danger" icon="log-out-outline" onPress={logout} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.h6,
    color: theme.colors.textLight,
    marginTop: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  greeting: {
    ...theme.typography.body1,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  userClass: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  statsContent: {
    alignItems: "center",
  },
  statsValue: {
    ...theme.typography.h4,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  statsLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    alignItems: "center",
    position: "relative",
  },
  chartOverlay: {
    position: "absolute",
    top: 70,
    alignItems: "center",
  },
  chartPercentage: {
    ...theme.typography.h4,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  chartLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...theme.typography.h6,
    color: theme.colors.text,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    marginBottom: theme.spacing.sm,
  },
  announcementsCard: {
    marginBottom: theme.spacing.lg,
  },
  announcementItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  announcementTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  announcementContent: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  announcementDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  viewAllButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
});
