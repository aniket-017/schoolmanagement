import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import Card from "../../components/ui/Card";
import theme from "../../utils/theme";

const { width } = Dimensions.get("window");

export default function TeacherTimetableScreen() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }));

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);

      const userId = user?.id || user?._id;
      if (!userId) {
        setTimetable(null);
        return;
      }

      const response = await apiService.timetable.getTeacherTimetable(userId);

      if (response.success) {
        setTimetable(response.data);
      } else {
        // For testing purposes, set some mock data if API fails
        if (__DEV__) {
          setTimetable({
            teacherId: userId,
            weeklyTimetable: {
              Monday: [
                {
                  periodNumber: 1,
                  subject: { name: "Mathematics" },
                  teacher: { name: "John Smith" },
                  classId: { _id: "class1", grade: "10", division: "A", classroom: "Room 101" },
                  startTime: "08:00",
                  endTime: "08:45",
                  room: "Room 101",
                  type: "theory",
                },
                {
                  periodNumber: 2,
                  subject: { name: "English" },
                  teacher: { name: "John Smith" },
                  classId: { _id: "class2", grade: "9", division: "B", classroom: "Room 102" },
                  startTime: "08:45",
                  endTime: "09:30",
                  room: "Room 102",
                  type: "theory",
                },
              ],
              Tuesday: [
                {
                  periodNumber: 1,
                  subject: { name: "Science" },
                  teacher: { name: "John Smith" },
                  classId: { _id: "class3", grade: "11", division: "A", classroom: "Room 103" },
                  startTime: "08:00",
                  endTime: "08:45",
                  room: "Room 103",
                  type: "lab",
                },
              ],
              Wednesday: [],
              Thursday: [],
              Friday: [],
              Saturday: [],
            },
          });
        }
      }
    } catch (error) {
      // For testing purposes, set some mock data if API fails
      if (__DEV__) {
        setTimetable({
          teacherId: userId,
          weeklyTimetable: {
            Monday: [
              {
                periodNumber: 1,
                subject: { name: "Mathematics" },
                teacher: { name: "John Smith" },
                classId: { _id: "class1", grade: "10", division: "A", classroom: "Room 101" },
                startTime: "08:00",
                endTime: "08:45",
                room: "Room 101",
                type: "theory",
              },
              {
                periodNumber: 2,
                subject: { name: "English" },
                teacher: { name: "John Smith" },
                classId: { _id: "class2", grade: "9", division: "B", classroom: "Room 102" },
                startTime: "08:45",
                endTime: "09:30",
                room: "Room 102",
                type: "theory",
              },
            ],
            Tuesday: [
              {
                periodNumber: 1,
                subject: { name: "Science" },
                teacher: { name: "John Smith" },
                classId: { _id: "class3", grade: "11", division: "A", classroom: "Room 103" },
                startTime: "08:00",
                endTime: "08:45",
                room: "Room 103",
                type: "lab",
              },
            ],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
          },
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTimetable();
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

  const renderDaySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.daySelector}
      contentContainerStyle={styles.daySelectorContent}
    >
      {days.map((day) => (
        <Animatable.View key={day} animation="fadeInUp" delay={days.indexOf(day) * 100}>
          <Card
            style={[styles.dayCard, selectedDay === day && styles.selectedDayCard]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>{day.slice(0, 3)}</Text>
            <Text style={[styles.dayFullText, selectedDay === day && styles.selectedDayFullText]}>{day}</Text>
          </Card>
        </Animatable.View>
      ))}
    </ScrollView>
  );

  const renderDaySchedule = () => {
    if (!timetable?.weeklyTimetable) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Timetable Available</Text>
          <Text style={styles.emptySubtitle}>
            Your teaching schedule hasn't been set up yet. Please contact your administrator.
          </Text>
        </View>
      );
    }

    const dayPeriods = timetable.weeklyTimetable[selectedDay] || [];

    if (dayPeriods.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Classes Today</Text>
          <Text style={styles.emptySubtitle}>Enjoy your free time! No classes scheduled for {selectedDay}.</Text>
        </View>
      );
    }

    return (
      <View style={styles.scheduleContainer}>
        {dayPeriods.map((period, index) => (
          <Animatable.View key={index} animation="fadeInUp" delay={index * 100} style={styles.periodCard}>
            <Card style={styles.periodItem}>
              <View style={styles.periodHeader}>
                <View style={styles.periodInfo}>
                  <Text style={styles.periodNumber}>Period {period.periodNumber}</Text>
                  <Text style={styles.periodTime}>
                    {period.startTime} - {period.endTime}
                  </Text>
                </View>
                <View style={styles.periodBadges}>
                  <Text style={[styles.classBadge, { backgroundColor: theme.colors.secondary }]}>
                    Class {period.classId?.grade}
                    {period.classId?.division}
                  </Text>
                  <Text style={[styles.typeBadge, { backgroundColor: getPeriodTypeColor(period.type) }]}>
                    {period.type}
                  </Text>
                </View>
              </View>

              <View style={styles.periodDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="book-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{period.subject?.name || "Unknown Subject"}</Text>
                </View>

                {period.room && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.warning} />
                    <Text style={styles.detailText}>Room {period.room}</Text>
                  </View>
                )}
              </View>
            </Card>
          </Animatable.View>
        ))}
      </View>
    );
  };

  if (loading && !timetable) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <Ionicons name="school-outline" size={60} color={theme.colors.primary} />
        </Animatable.View>
        <Text style={styles.loadingText}>Loading Timetable...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teaching Schedule</Text>
        <Text style={styles.subtitle}>
          {user?.name} • {user?.subject || "All Subjects"}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderDaySelector()}
        {renderDaySchedule()}
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.h6,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  daySelector: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  daySelectorContent: {
    gap: theme.spacing.sm,
  },
  dayCard: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 80,
    alignItems: "center",
  },
  selectedDayCard: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  selectedDayText: {
    color: theme.colors.textLight,
  },
  dayFullText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  selectedDayFullText: {
    color: theme.colors.textLight,
    opacity: 0.8,
  },
  scheduleContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  periodCard: {
    marginBottom: theme.spacing.sm,
  },
  periodItem: {
    padding: theme.spacing.md,
  },
  periodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  periodInfo: {
    flex: 1,
  },
  periodNumber: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  periodTime: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  periodBadges: {
    marginLeft: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  classBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textLight,
    fontSize: 10,
    fontWeight: "bold",
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textLight,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  periodDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    textAlign: "center",
  },
  emptySubtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: "center",
    lineHeight: 20,
  },
  debugSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  debugTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
  },
  debugContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  debugText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: "monospace",
  },
  testButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    alignItems: "center",
  },
  testButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    fontWeight: "600",
  },
});
