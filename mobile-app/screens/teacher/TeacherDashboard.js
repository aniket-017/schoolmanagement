import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";

const notificationData = [
  { id: 1, text: "New announcement from Administration." },
  { id: 2, text: "You have 3 assignments to grade for English." },
  { id: 3, text: "Parent-teacher meeting scheduled for tomorrow." },
];

export default function TeacherDashboard({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      console.log("Loading timetable for user:", user);

      const userId = user?.id || user?._id;
      if (!userId) {
        console.log("No user ID found, setting timetable to null");
        setTimetable(null);
        return;
      }

      console.log("Making API call to get teacher timetable for ID:", userId);
      const response = await apiService.timetable.getTeacherTimetable(userId);
      console.log("Teacher timetable API response:", response);

      if (response.success) {
        console.log("Setting timetable data:", response.data);
        setTimetable(response.data);
      } else {
        console.error("Failed to load teacher timetable:", response.message);
      }
    } catch (error) {
      console.error("Error loading teacher timetable:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTimetable();
  };

  const getTodaySchedule = () => {
    console.log("getTodaySchedule called with timetable:", timetable);

    if (!timetable?.weeklyTimetable) {
      console.log("No weeklyTimetable found, returning empty array");
      return [];
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    console.log("Today is:", today);
    console.log("Available days in timetable:", Object.keys(timetable.weeklyTimetable));
    console.log("Today's schedule:", timetable.weeklyTimetable[today]);

    return timetable.weeklyTimetable[today] || [];
  };

  const getPeriodTypeColor = (type) => {
    const colors = {
      theory: theme.colors.primary,
      practical: theme.colors.success,
      lab: theme.colors.warning,
      sports: theme.colors.info,
      library: theme.colors.secondary,
    };
    return colors[type] || theme.colors.primary;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, "#3b5998"]}
        style={[styles.header, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate("TeacherProfile")}>
          <Ionicons name="person-outline" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Today's Schedule */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("TeacherTimetable")}>
                <Text style={styles.viewAllText}>View Full</Text>
              </TouchableOpacity>
            </View>
            <Card style={styles.infoCard}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="time-outline" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.loadingText}>Loading schedule...</Text>
                </View>
              ) : getTodaySchedule().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyText}>No classes scheduled for today</Text>
                  <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8 }]}>
                    {timetable
                      ? "Your timetable is loaded but no classes are scheduled for today."
                      : "No timetable data available."}
                  </Text>
                </View>
              ) : (
                getTodaySchedule()
                  .slice(0, 4)
                  .map((period, index) => (
                    <View
                      key={index}
                      style={[
                        styles.scheduleItem,
                        index === Math.min(getTodaySchedule().length - 1, 3) && styles.lastItem,
                      ]}
                    >
                      <View style={styles.scheduleTimeContainer}>
                        <Text style={styles.scheduleTime}>
                          {period.startTime} - {period.endTime}
                        </Text>
                        <Text style={styles.periodNumber}>Period {period.periodNumber}</Text>
                      </View>
                      <View style={styles.scheduleDetails}>
                        <Text style={styles.scheduleSubject}>{period.subject?.name || "Unknown Subject"}</Text>
                        <View style={styles.scheduleBadges}>
                          <Text style={[styles.classBadge, { backgroundColor: theme.colors.secondary }]}>
                            Class {period.classId?.grade}
                            {period.classId?.division}
                          </Text>
                          <Text style={[styles.periodTypeBadge, { backgroundColor: getPeriodTypeColor(period.type) }]}>
                            {period.type}
                          </Text>
                        </View>
                        <Text style={styles.scheduleLocation}>Room {period.room || "TBD"}</Text>
                      </View>
                    </View>
                  ))
              )}
              {getTodaySchedule().length > 4 && (
                <View style={styles.morePeriods}>
                  <Text style={styles.morePeriodsText}>+{getTodaySchedule().length - 4} more periods</Text>
                </View>
              )}
            </Card>
          </View>
        </Animatable.View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <Card style={styles.infoCard}>
            {notificationData.map((item, index) => (
              <View
                key={item.id}
                style={[styles.notificationItem, index === notificationData.length - 1 && styles.lastItem]}
              >
                <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.notificationText}>{item.text}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Debug Info (Development Only) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug Info</Text>
            <Card style={styles.infoCard}>
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>User ID: {user?.id || user?._id || "Not found"}</Text>
                <Text style={styles.debugText}>User Role: {user?.role || "Not found"}</Text>
                <Text style={styles.debugText}>Timetable Loaded: {timetable ? "Yes" : "No"}</Text>
                {timetable && (
                  <Text style={styles.debugText}>
                    Days with data:{" "}
                    {Object.keys(timetable.weeklyTimetable || {})
                      .filter((day) => timetable.weeklyTimetable[day] && timetable.weeklyTimetable[day].length > 0)
                      .join(", ") || "None"}
                  </Text>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherClasses")}>
              <View style={styles.actionInner}>
                <Ionicons name="people" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Classes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherAttendance")}>
              <View style={styles.actionInner}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Attendance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherGrades")}>
              <View style={styles.actionInner}>
                <Ionicons name="school" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Grades</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherTimetable")}>
              <View style={styles.actionInner}>
                <Ionicons name="time" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Timetable</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  welcomeText: {
    ...theme.typography.h5,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  nameText: {
    ...theme.typography.h3,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    fontWeight: "bold",
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: "bold",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.spacing.sm,
  },
  actionCard: {
    width: "50%",
    padding: theme.spacing.sm,
  },
  actionInner: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
    height: 120,
  },
  actionText: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  infoCard: {
    padding: 0,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  viewAllButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
  },
  viewAllText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  scheduleTimeContainer: {
    width: 100,
    marginRight: theme.spacing.md,
  },
  scheduleTime: {
    ...theme.typography.subtitle2,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  periodNumber: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleSubject: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  scheduleLocation: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  scheduleBadges: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  classBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textLight,
    fontSize: 10,
    fontWeight: "bold",
  },
  periodTypeContainer: {
    marginTop: theme.spacing.xs,
  },
  periodTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textLight,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  morePeriods: {
    padding: theme.spacing.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  morePeriodsText: {
    ...theme.typography.body2,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  notificationText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  debugContainer: {
    padding: theme.spacing.md,
  },
  debugText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: "monospace",
  },
});
