import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Card, Title } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";

export default function StudentDashboard({ navigation }) {
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  // Add state for recent announcements
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  useEffect(() => {
    initializeDashboard();
    fetchRecentAnnouncements();
  }, []);

  const initializeDashboard = async () => {
    try {
      // First refresh user data to ensure we have the latest class information
      await refreshUser();
      // Then load the timetable and attendance
      await Promise.all([loadTimetable(), loadTodayAttendance()]);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      setLoading(false);
    }
  };

  // Fetch recent announcements for the student
  const fetchRecentAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const userId = user?._id || user?.id;
      if (!userId) {
        setRecentAnnouncements([]);
        return;
      }
      let response;
      // Use the correct endpoint for students collection
      if (user?.role === 'student' || user?.studentId || user?.admissionNumber) {
        response = await apiService.announcements.getAnnouncementsForStudent(userId, { activeOnly: true, limit: 3 });
      } else {
        response = await apiService.announcements.getAnnouncementsForUser(userId, { activeOnly: true, limit: 3 });
      }
      if (response.success && Array.isArray(response.data)) {
        setRecentAnnouncements(response.data);
      } else {
        setRecentAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching recent announcements:", error);
      setRecentAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      if (!userId) {
        setTimetable(null);
        return;
      }
      // Defensive check for class
      const classId = user?.class?._id || user?.class;
      if (!classId) {
        setTimetable(null);
        return;
      }
      const response = await apiService.timetable.getClassTimetable(classId);
      if (response.success) {
        setTimetable(response.data);
      } else {
        setTimetable(null);
      }
    } catch (error) {
      console.error("Error loading student timetable:", error);
      setTimetable(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    initializeDashboard();
    fetchRecentAnnouncements();
  };

  const loadTodayAttendance = async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) return;

      const today = new Date();
      const response = await apiService.attendance.getStudentAttendance(userId, {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      });

      if (response.success && response.data?.attendance?.length > 0) {
        setTodayAttendance(response.data.attendance[0]);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      // If 404, treat as no attendance, not an error
      if (error.response && error.response.status === 404) {
        setTodayAttendance(null);
      } else {
        console.error("Error loading today's attendance:", error);
        setTodayAttendance(null);
      }
    }
  };

  const getTodaySchedule = () => {
    if (!timetable?.weeklyTimetable) {
      return [];
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

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

  const getAttendanceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return theme.colors.success;
      case "absent":
        return theme.colors.error;
      case "late":
        return theme.colors.warning;
      case "leave":
        return theme.colors.info;
      default:
        return theme.colors.grey;
    }
  };

  const getAttendanceStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "checkmark-circle";
      case "absent":
        return "close-circle";
      case "late":
        return "time";
      case "leave":
        return "calendar";
      default:
        return "help-circle";
    }
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
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate("StudentProfile")}>
          <Ionicons name="person-outline" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Today's Schedule */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("StudentTimetable")}>
                <Text style={styles.viewAllText}>View Full</Text>
              </TouchableOpacity>
            </View>
            <Card style={styles.infoCard}>
              <Card.Content>
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
                        : "No timetable data available. Please contact your administrator."}
                    </Text>
                    {!timetable && (
                      <TouchableOpacity style={styles.retryButton} onPress={loadTimetable}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    )}
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
                              Class {period.classId?.grade || user?.class?.grade || 'Class'}
                              {period.classId?.division || user?.class?.section || 'Section'}
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
              </Card.Content>
            </Card>
          </View>
        </Animatable.View>

        {/* Today's Attendance Summary */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Attendance</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("StudentAttendance")}>
                <Text style={styles.viewAllText}>View Details</Text>
              </TouchableOpacity>
            </View>
            <Card style={styles.infoCard}>
              <Card.Content>
                {todayAttendance ? (
                  <View style={styles.attendanceSummaryContainer}>
                    <View style={styles.attendanceStatusContainer}>
                      <Ionicons
                        name={getAttendanceStatusIcon(todayAttendance.status)}
                        size={32}
                        color={getAttendanceStatusColor(todayAttendance.status)}
                      />
                      <View style={styles.attendanceStatusText}>
                        <Text style={[styles.attendanceStatus, { color: getAttendanceStatusColor(todayAttendance.status) }]}>
                          {todayAttendance.status?.toUpperCase()}
                        </Text>
                        <Text style={styles.attendanceTime}>
                          {todayAttendance.timeIn ? `Time In: ${todayAttendance.timeIn}` : "No time recorded"}
                        </Text>
                      </View>
                    </View>
                    {todayAttendance.remarks && (
                      <Text style={styles.attendanceRemarks}>Remarks: {todayAttendance.remarks}</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={32} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>No attendance marked for today</Text>
                    <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8 }]}>
                      Your attendance will appear here once marked by your teacher
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
        </Animatable.View>

        {/* Recent Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("StudentAnnouncements")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {announcementsLoading ? (
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.loadingContainer}>
                  <Ionicons name="megaphone-outline" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.loadingText}>Loading announcements...</Text>
                </View>
              </Card.Content>
            </Card>
          ) : recentAnnouncements.length === 0 ? (
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.emptyContainer}>
                  <Ionicons name="megaphone-outline" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyText}>No recent announcements</Text>
                </View>
              </Card.Content>
            </Card>
          ) : (
            recentAnnouncements.map((announcement, index) => (
              <TouchableOpacity
                key={announcement._id}
                onPress={() => {
                  setSelectedAnnouncement(announcement);
                  setShowAnnouncementModal(true);
                }}
                activeOpacity={0.8}
                style={{ marginBottom: 16 }}
              >
                <View style={styles.announcementCard}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementSnippet} numberOfLines={2}>{announcement.content}</Text>
                  <View style={styles.announcementMetaRow}>
                    <Text style={styles.announcementMeta}>{announcement.createdBy?.name ? `By ${announcement.createdBy.name}` : 'By Class Teacher'}</Text>
                    <Text style={styles.announcementMeta}>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : ''}</Text>
                  </View>
                  <View style={styles.announcementSourceRow}>
                    <Text style={styles.announcementSource}>
                      {announcement.targetAudience === 'all' ? 'For All Students' :
                       announcement.targetAudience === 'class' ? `For Class ${announcement.targetClasses?.[0]?.name || announcement.targetClasses?.[0]?.grade + announcement.targetClasses?.[0]?.division || 'Unknown'}` :
                       announcement.targetAudience === 'individual' ? `For Specific Students` :
                       `For ${announcement.targetAudience || 'Students'}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        {/* Announcement Details Modal */}
        <Modal
          visible={showAnnouncementModal && !!selectedAnnouncement}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAnnouncementModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{selectedAnnouncement?.title}</Text>
              <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>{selectedAnnouncement?.content}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 16 }}>{selectedAnnouncement?.createdAt ? new Date(selectedAnnouncement.createdAt).toLocaleDateString() : ''}</Text>
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 20 }}
                onPress={() => setShowAnnouncementModal(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("StudentAttendance")}>
              <View style={styles.actionInner}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Attendance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("StudentClasses")}>
              <View style={styles.actionInner}>
                <Ionicons name="people" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Classes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("StudentAnnualCalendar")}>
              <View style={styles.actionInner}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Annual Calendar</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("StudentTimetable")}>
              <View style={styles.actionInner}>
                <Ionicons name="time" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Timetable</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("StudentProfile")}>
              <View style={styles.actionInner}>
                <Ionicons name="person" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Profile</Text>
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
    backgroundColor: "#f5f5f5",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
    lineHeight: 24,
  },
  infoCard: {
    padding: 0,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2196F3",
  },
  viewAllText: {
    fontSize: 12,
    color: "#ffffff",
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
  attendanceSummaryContainer: {
    padding: theme.spacing.md,
  },
  attendanceStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  attendanceStatusText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  attendanceStatus: {
    ...theme.typography.h6,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  attendanceTime: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  attendanceRemarks: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
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
  retryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignSelf: "center",
  },
  retryButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 6,
    lineHeight: 22,
  },
  content: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: "#9e9e9e",
    textAlign: "right",
    marginTop: 4,
  },
  // New announcement card styles matching teacher design
  announcementCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
    color: '#212121',
  },
  announcementSnippet: {
    fontSize: 12,
    color: '#555',
    marginBottom: 6,
    lineHeight: 16,
  },
  announcementMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  announcementMeta: {
    fontSize: 10,
    color: '#888',
  },
  announcementSourceRow: {
    marginTop: 3,
  },
  announcementSource: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
});
