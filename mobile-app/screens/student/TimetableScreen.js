import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import Card from "../../components/ui/Card";
import theme from "../../utils/theme";

const { width } = Dimensions.get("window");

export default function TimetableScreen() {
  const { user, refreshUser } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  const [error, setError] = useState(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    initializeTimetable();
  }, []);

  const initializeTimetable = async () => {
    try {
      // First refresh user data to ensure we have the latest class information
      await refreshUser();
      // Then load the timetable
      await loadTimetable();
    } catch (error) {
      console.error("Error initializing timetable:", error);
      setError("Failed to initialize timetable");
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.class) {
        setError("No class assigned. Please contact your administrator.");
        setTimetable(null);
        return;
      }

      const classId = user.class._id || user.class;
      const response = await apiService.timetable.getClassTimetable(classId);
      
      if (response.success) {
        setTimetable(response.data);
      } else {
        setError(response.message || "Failed to load timetable");
      }
    } catch (error) {
      console.error("Error loading timetable:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    initializeTimetable();
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
          <TouchableOpacity
            style={[styles.dayCard, selectedDay === day && styles.selectedDayCard]}
            onPress={() => setSelectedDay(day)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>{day.slice(0, 3)}</Text>
            <Text style={[styles.dayFullText, selectedDay === day && styles.selectedDayFullText]}>{day}</Text>
          </TouchableOpacity>
        </Animatable.View>
      ))}
    </ScrollView>
  );

  const renderDaySchedule = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.emptyTitle}>Error Loading Timetable</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeTimetable}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!timetable?.weeklyTimetable) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Timetable Available</Text>
          <Text style={styles.emptySubtitle}>
            Your class timetable hasn't been set up yet. Please contact your administrator.
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
                <View style={styles.periodType}>
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

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.secondary} />
                  <Text style={styles.detailText}>{period.teacher?.name || "Unknown Teacher"}</Text>
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
        <Text style={styles.title}>Class Timetable</Text>
        <Text style={styles.subtitle}>
          {user?.class ? `${user.class.grade || user.class.name || 'Class'} - ${user.class.section || user.class.division || 'Section'}` : "No Class Assigned"}
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
  periodType: {
    marginLeft: theme.spacing.sm,
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
  retryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    fontWeight: "bold",
  },
});
