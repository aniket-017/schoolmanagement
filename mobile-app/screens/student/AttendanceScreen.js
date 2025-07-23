import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";

const { width } = Dimensions.get("window");

export default function AttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      
      if (!userId) {
        Alert.alert("Error", "User information not available");
        return;
      }

      // Load today's attendance
      const today = new Date();
      let todayResponse = null;
      try {
        todayResponse = await apiService.attendance.getStudentAttendance(userId, {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          todayResponse = { data: { attendance: [] } };
        } else {
          throw error;
        }
      }

      // Load monthly statistics
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      let monthlyResponse = null;
      try {
        monthlyResponse = await apiService.attendance.getStudentAttendance(userId, {
          month: currentMonth,
          year: currentYear,
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          monthlyResponse = { data: { statistics: {}, attendance: [] } };
        } else {
          throw error;
        }
      }

      setAttendanceData(todayResponse.data);
      setMonthlyStats(monthlyResponse.data);
    } catch (error) {
      console.error("Error loading attendance:", error);
      Alert.alert("Error", "Failed to load attendance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendanceData();
  };

  const checkAttendanceForDate = async (date) => {
    try {
      const userId = user?.id || user?._id;
      const dateString = date.toISOString().split('T')[0];
      let response = null;
      try {
        response = await apiService.attendance.getStudentAttendance(userId, {
          startDate: dateString,
          endDate: dateString,
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          response = { data: { attendance: [] } };
        } else {
          throw error;
        }
      }
      return response.data;
    } catch (error) {
      console.error("Error checking attendance for date:", error);
      return null;
    }
  };

  const handleDateChange = async (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const attendance = await checkAttendanceForDate(selectedDate);
      if (attendance) {
        setAttendanceData(attendance);
      }
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTodayAttendance = () => {
    if (!attendanceData?.attendance || attendanceData.attendance.length === 0) {
      return null;
    }
    return attendanceData.attendance[0];
  };

  const renderTodayAttendance = () => {
    const todayAttendance = getTodayAttendance();
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
      <Animatable.View animation="fadeInUp" delay={200}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isToday ? "Today's Attendance" : `Attendance for ${formatDate(selectedDate)}`}
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.datePickerText}>Change Date</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.infoCard}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="time-outline" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.loadingText}>Loading attendance...</Text>
              </View>
            ) : todayAttendance ? (
              <View style={styles.attendanceStatusContainer}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name={getStatusIcon(todayAttendance.status)}
                    size={48}
                    color={getStatusColor(todayAttendance.status)}
                  />
                </View>
                <View style={styles.statusDetails}>
                  <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                    {todayAttendance.status?.toUpperCase()}
                  </Text>
                  <Text style={styles.statusDate}>{formatDate(todayAttendance.date)}</Text>
                  {todayAttendance.timeIn && (
                    <Text style={styles.timeText}>Time In: {todayAttendance.timeIn}</Text>
                  )}
                  {todayAttendance.remarks && (
                    <Text style={styles.remarksText}>Remarks: {todayAttendance.remarks}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No attendance record found</Text>
                <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8 }]}>
                  Attendance may not have been marked for this date
                </Text>
              </View>
            )}
          </Card>
        </View>
      </Animatable.View>
    );
  };

  const renderMonthlyStats = () => {
    if (!monthlyStats) return null;

    const { statistics } = monthlyStats;
    const attendancePercentage = parseFloat(statistics.attendancePercentage);

    return (
      <Animatable.View animation="fadeInUp" delay={400}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month's Attendance</Text>
          <Card style={styles.infoCard}>
            <View style={styles.statsContainer}>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageText}>{attendancePercentage}%</Text>
                <Text style={styles.percentageLabel}>Attendance Rate</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                    {statistics.presentDays}
                  </Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.error }]}>
                    {statistics.absentDays}
                  </Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                    {statistics.lateDays}
                  </Text>
                  <Text style={styles.statLabel}>Late</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {statistics.totalDays}
                  </Text>
                  <Text style={styles.statLabel}>Total Days</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </Animatable.View>
    );
  };

  const renderRecentAttendance = () => {
    if (!monthlyStats?.attendance || monthlyStats.attendance.length === 0) return null;

    const recentAttendance = monthlyStats.attendance.slice(0, 7); // Last 7 days

    return (
      <Animatable.View animation="fadeInUp" delay={600}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          <Card style={styles.infoCard}>
            {recentAttendance.map((record, index) => (
              <View
                key={index}
                style={[
                  styles.attendanceRecord,
                  index === recentAttendance.length - 1 && styles.lastItem,
                ]}
              >
                <View style={styles.recordDate}>
                  <Text style={styles.recordDay}>
                    {new Date(record.date).toLocaleDateString("en-US", { day: "numeric" })}
                  </Text>
                  <Text style={styles.recordMonth}>
                    {new Date(record.date).toLocaleDateString("en-US", { month: "short" })}
                  </Text>
                </View>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordDayName}>
                    {new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}
                  </Text>
                  <Text style={styles.recordTime}>
                    {record.timeIn ? `Time In: ${record.timeIn}` : "No time recorded"}
                  </Text>
                </View>
                <View style={styles.recordStatus}>
                  <Ionicons
                    name={getStatusIcon(record.status)}
                    size={24}
                    color={getStatusColor(record.status)}
                  />
                  <Text style={[styles.recordStatusText, { color: getStatusColor(record.status) }]}>
                    {record.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, "#3b5998"]}
        style={[styles.header, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderTodayAttendance()}
        {renderMonthlyStats()}
        {renderRecentAttendance()}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textLight,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    fontWeight: "600",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  datePickerText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  attendanceStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  statusIconContainer: {
    marginRight: theme.spacing.lg,
  },
  statusDetails: {
    flex: 1,
  },
  statusText: {
    ...theme.typography.h4,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  statusDate: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  timeText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  remarksText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  statsContainer: {
    alignItems: "center",
  },
  percentageContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  percentageText: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  percentageLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    width: (width - theme.spacing.lg * 4) / 2,
    marginBottom: theme.spacing.md,
  },
  statNumber: {
    ...theme.typography.h3,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  attendanceRecord: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  recordDate: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    minWidth: 50,
  },
  recordDay: {
    ...theme.typography.h5,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  recordMonth: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
  },
  recordDetails: {
    flex: 1,
  },
  recordDayName: {
    ...theme.typography.body1,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recordTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  recordStatus: {
    alignItems: "center",
    minWidth: 80,
  },
  recordStatusText: {
    ...theme.typography.caption,
    fontWeight: "500",
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
});
