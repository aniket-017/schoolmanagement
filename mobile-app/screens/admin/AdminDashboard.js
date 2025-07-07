import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import theme from "../../utils/theme";

const { width } = Dimensions.get("window");

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // This would typically fetch from multiple endpoints
      // For now, we'll simulate the data structure
      const mockData = {
        overview: {
          totalStudents: 1250,
          totalTeachers: 85,
          totalClasses: 45,
          totalStaff: 120,
          activeUsers: 1150,
          pendingApprovals: 15,
          totalRevenue: 125000,
          pendingFees: 25000,
        },
        attendance: {
          studentAttendance: 92.5,
          teacherAttendance: 96.8,
          staffAttendance: 89.2,
        },
        academics: {
          averageGrade: 78.5,
          totalExams: 45,
          completedAssignments: 890,
          pendingAssignments: 124,
        },
        financials: {
          monthlyRevenue: [45000, 52000, 48000, 58000, 62000, 55000],
          feeCollection: 85,
          pendingPayments: 15,
        },
        recentActivities: [
          { id: 1, type: "user_registration", message: "New student registered: John Doe", time: "2 hours ago" },
          { id: 2, type: "fee_payment", message: "Fee payment received: $500", time: "4 hours ago" },
          { id: 3, type: "exam_created", message: "Math exam scheduled for Class 10", time: "6 hours ago" },
          { id: 4, type: "announcement", message: "New announcement published", time: "1 day ago" },
        ],
        quickStats: {
          todayAttendance: 94.2,
          newRegistrations: 5,
          systemAlerts: 3,
          activeClasses: 28,
        },
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Dashboard error:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const renderHeader = () => (
    <LinearGradient colors={theme.colors.gradients.primary} style={styles.header}>
      <Animatable.View animation="fadeInDown" delay={200}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.role === "principal" ? "Principal" : "Administrator"}</Text>
        <Text style={styles.schoolName}>{user?.school_name || "School Management System"}</Text>
      </Animatable.View>
    </LinearGradient>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <Animatable.View animation="fadeInUp" delay={300}>
        <Card gradient="primary" style={styles.overviewCard} onPress={() => navigation.navigate("UserManagement")}>
          <View style={styles.cardContent}>
            <Ionicons name="people" size={28} color={theme.colors.textLight} />
            <Text style={styles.cardValue}>{dashboardData?.overview.totalStudents || 0}</Text>
            <Text style={styles.cardLabel}>Total Students</Text>
          </View>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400}>
        <Card gradient="secondary" style={styles.overviewCard} onPress={() => navigation.navigate("UserManagement")}>
          <View style={styles.cardContent}>
            <Ionicons name="school" size={28} color={theme.colors.textLight} />
            <Text style={styles.cardValue}>{dashboardData?.overview.totalTeachers || 0}</Text>
            <Text style={styles.cardLabel}>Teachers</Text>
          </View>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500}>
        <Card gradient="success" style={styles.overviewCard} onPress={() => navigation.navigate("ClassManagement")}>
          <View style={styles.cardContent}>
            <Ionicons name="library" size={28} color={theme.colors.textLight} />
            <Text style={styles.cardValue}>{dashboardData?.overview.totalClasses || 0}</Text>
            <Text style={styles.cardLabel}>Classes</Text>
          </View>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={600}>
        <Card gradient="warning" style={styles.overviewCard} onPress={() => navigation.navigate("UserManagement")}>
          <View style={styles.cardContent}>
            <Ionicons name="person-add" size={28} color={theme.colors.textLight} />
            <Text style={styles.cardValue}>{dashboardData?.overview.pendingApprovals || 0}</Text>
            <Text style={styles.cardLabel}>Pending</Text>
          </View>
        </Card>
      </Animatable.View>
    </View>
  );

  const renderAttendanceChart = () => {
    if (!dashboardData?.attendance) return null;

    const data = [
      {
        name: "Students",
        population: dashboardData.attendance.studentAttendance,
        color: theme.colors.primary,
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
      {
        name: "Teachers",
        population: dashboardData.attendance.teacherAttendance,
        color: theme.colors.secondary,
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
      {
        name: "Staff",
        population: dashboardData.attendance.staffAttendance,
        color: theme.colors.success,
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
    ];

    return (
      <Animatable.View animation="fadeInUp" delay={700}>
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Attendance Overview</Text>
          <PieChart
            data={data}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>
      </Animatable.View>
    );
  };

  const renderRevenueChart = () => {
    if (!dashboardData?.financials) return null;

    const data = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          data: dashboardData.financials.monthlyRevenue,
        },
      ],
    };

    return (
      <Animatable.View animation="fadeInUp" delay={800}>
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Monthly Revenue</Text>
          <LineChart
            data={data}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card>
      </Animatable.View>
    );
  };

  const renderQuickActions = () => (
    <Animatable.View animation="fadeInUp" delay={900}>
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Button
            title="Manage Users"
            icon="people-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("UserManagement")}
            style={styles.actionButton}
          />
          <Button
            title="Classes"
            icon="library-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("ClassManagement")}
            style={styles.actionButton}
          />
          <Button
            title="Announcements"
            icon="megaphone-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Announcements")}
            style={styles.actionButton}
          />
          <Button
            title="Reports"
            icon="bar-chart-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Reports")}
            style={styles.actionButton}
          />
          <Button
            title="Fee Management"
            icon="card-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("FeeManagement")}
            style={styles.actionButton}
          />
          <Button
            title="Settings"
            icon="settings-outline"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate("Settings")}
            style={styles.actionButton}
          />
        </View>
      </Card>
    </Animatable.View>
  );

  const renderRecentActivities = () => {
    if (!dashboardData?.recentActivities) return null;

    const getActivityIcon = (type) => {
      switch (type) {
        case "user_registration":
          return "person-add";
        case "fee_payment":
          return "card";
        case "exam_created":
          return "document-text";
        case "announcement":
          return "megaphone";
        default:
          return "information-circle";
      }
    };

    return (
      <Animatable.View animation="fadeInUp" delay={1000}>
        <Card style={styles.activitiesCard}>
          <Text style={styles.cardTitle}>Recent Activities</Text>
          {dashboardData.recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name={getActivityIcon(activity.type)} size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage} numberOfLines={2}>
                  {activity.message}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
          <Button
            title="View All Activities"
            variant="ghost"
            size="small"
            onPress={() => navigation.navigate("Reports")}
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
            <Ionicons name="analytics" size={60} color={theme.colors.textLight} />
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
        {renderOverviewCards()}
        {renderAttendanceChart()}
        {renderRevenueChart()}
        {renderQuickActions()}
        {renderRecentActivities()}
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
  schoolName: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  overviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  overviewCard: {
    width: "48%",
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardContent: {
    alignItems: "center",
  },
  cardValue: {
    ...theme.typography.h4,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  cardLabel: {
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
  activitiesCard: {
    marginBottom: theme.spacing.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  viewAllButton: {
    marginTop: theme.spacing.sm,
  },
});
