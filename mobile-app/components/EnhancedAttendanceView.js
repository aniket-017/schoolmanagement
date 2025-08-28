import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Animatable from "react-native-animatable";

import Card from "./ui/Card";
import { apiService } from "../services/apiService";
import theme from "../utils/theme";

export default function EnhancedAttendanceView({ classId, className }) {
  const [viewType, setViewType] = useState("month"); // month, year
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId);

  useEffect(() => {
    // Set default current period based on view type
    const now = new Date();
    if (viewType === "month") {
      setCurrentPeriod(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`);
    } else if (viewType === "year") {
      setCurrentPeriod(now.getFullYear().toString());
    }
  }, [viewType]);

  useEffect(() => {
    if (currentPeriod && selectedClass) {
      fetchAttendanceSummary();
    }
  }, [currentPeriod, viewType, selectedClass]);

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  const loadTeacherClasses = async () => {
    try {
      const response = await apiService.attendance.getTeacherClasses();
      if (response.success) {
        setClasses(response.data);
        if (!selectedClass && response.data.length > 0) {
          setSelectedClass(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      Alert.alert("Error", "Failed to load classes. Please try again.");
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!selectedClass) {
      console.log("No class selected, skipping fetch");
      return;
    }

    setLoading(true);
    try {
      let queryParams = new URLSearchParams({ period: viewType });

      if (viewType === "month") {
        const [year, month] = currentPeriod.split("-");
        queryParams.append("year", year);
        queryParams.append("month", month);
      } else if (viewType === "year") {
        queryParams.append("year", currentPeriod);
      }

      const response = await apiService.attendance.getClassAttendanceSummary(selectedClass, queryParams.toString());
      
      if (response.success) {
        setAttendanceSummary(response.data);
      } else {
        setAttendanceSummary(null);
      }
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 500) {
        setAttendanceSummary(null);
      } else if (error.response?.status === 404) {
        setAttendanceSummary(null);
      } else {
        setAttendanceSummary(null);
      }
    }
    setLoading(false);
  };

  const navigatePeriod = (direction) => {
    if (viewType === "month") {
      const [year, month] = currentPeriod.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      date.setMonth(date.getMonth() + (direction === "prev" ? -1 : 1));
      setCurrentPeriod(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`);
    } else if (viewType === "year") {
      const year = parseInt(currentPeriod);
      setCurrentPeriod((year + (direction === "prev" ? -1 : 1)).toString());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return theme.colors.success;
      case "absent":
        return theme.colors.error;
      case "late":
        return theme.colors.warning;
      case "leave":
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return theme.colors.success;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.error;
  };

  const formatPeriod = () => {
    if (viewType === "month") {
      const [year, month] = currentPeriod.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (viewType === "year") {
      return `Year ${currentPeriod}`;
    }
    return currentPeriod;
  };

  const getSummaryStats = () => {
    if (!attendanceSummary || !attendanceSummary.students) return null;

    const totalStudents = attendanceSummary.students.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;

    attendanceSummary.students.forEach((student) => {
      totalPresent += student.present || 0;
      totalAbsent += student.absent || 0;
      totalLate += student.late || 0;
      totalLeave += student.leave || 0;
    });

    const totalDays = totalPresent + totalAbsent + totalLate + totalLeave;
    const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

    return {
      totalStudents,
      totalPresent,
      totalAbsent,
      totalLate,
      totalLeave,
      totalDays,
      overallPercentage,
    };
  };

  const summaryStats = getSummaryStats();

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Header Controls */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.title}>Enhanced Attendance View</Text>
          </View>
        </View>
      </Card>

      {/* View Type Selector */}
      <Card style={styles.controlCard}>
        <Text style={styles.sectionTitle}>View Type</Text>
        <View style={styles.viewTypeContainer}>
          {["month", "year"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.viewTypeButton,
                viewType === type && styles.viewTypeButtonActive,
              ]}
              onPress={() => setViewType(type)}
            >
              <Text
                style={[
                  styles.viewTypeButtonText,
                  viewType === type && styles.viewTypeButtonTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Class Selection */}
      <Card style={styles.controlCard}>
        <Text style={styles.sectionTitle}>Select Class</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClass}
            onValueChange={setSelectedClass}
            style={styles.picker}
          >
            {classes.map((classItem) => (
              <Picker.Item key={classItem._id} label={classItem.fullName} value={classItem._id} />
            ))}
          </Picker>
        </View>
      </Card>

      {/* Period Navigator */}
      <Card style={styles.controlCard}>
        <Text style={styles.sectionTitle}>Period</Text>
        <View style={styles.periodNavigator}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigatePeriod("prev")}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.periodText}>{formatPeriod()}</Text>
          <TouchableOpacity style={styles.navButton} onPress={() => navigatePeriod("next")}>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
                {summaryStats.overallPercentage}%
              </Text>
              <Text style={styles.summaryLabel}>Overall Attendance</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.primary }]}>
                {summaryStats.totalStudents}
              </Text>
              <Text style={styles.summaryLabel}>Total Students</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.textSecondary }]}>
                {summaryStats.totalDays}
              </Text>
              <Text style={styles.summaryLabel}>Total Days</Text>
            </View>
          </View>
          <View style={styles.detailedSummary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
                <Text style={styles.summaryText}>Present: {summaryStats.totalPresent}</Text>
              </View>
              <View style={styles.summaryDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
                <Text style={styles.summaryText}>Absent: {summaryStats.totalAbsent}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
                <Text style={styles.summaryText}>Late: {summaryStats.totalLate}</Text>
              </View>
              <View style={styles.summaryDot}>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <Text style={styles.summaryText}>Leave: {summaryStats.totalLeave}</Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Students Attendance Table */}
      {loading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading attendance data...</Text>
        </Card>
      ) : attendanceSummary && attendanceSummary.students ? (
        <Card style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Student Attendance Details</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.rollCell]}>Roll No</Text>
                <Text style={[styles.headerCell, styles.nameCell]}>Name</Text>
                <Text style={[styles.headerCell, styles.statsCell]}>Present</Text>
                <Text style={[styles.headerCell, styles.statsCell]}>Absent</Text>
                <Text style={[styles.headerCell, styles.statsCell]}>Late</Text>
                <Text style={[styles.headerCell, styles.statsCell]}>Leave</Text>
                <Text style={[styles.headerCell, styles.percentageCell]}>%</Text>
              </View>

              {/* Table Rows */}
              {attendanceSummary.students.map((studentData, index) => (
                <Animatable.View
                  key={studentData.student._id}
                  animation="fadeInUp"
                  delay={index * 50}
                  style={styles.tableRow}
                >
                  <Text style={[styles.cell, styles.rollCell]}>
                    {studentData.student.rollNumber || "N/A"}
                  </Text>
                  <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>
                    {studentData.student.name}
                  </Text>
                  <Text style={[styles.cell, styles.statsCell, { color: theme.colors.success }]}>
                    {studentData.present || 0}
                  </Text>
                  <Text style={[styles.cell, styles.statsCell, { color: theme.colors.error }]}>
                    {studentData.absent || 0}
                  </Text>
                  <Text style={[styles.cell, styles.statsCell, { color: theme.colors.warning }]}>
                    {studentData.late || 0}
                  </Text>
                  <Text style={[styles.cell, styles.statsCell, { color: theme.colors.primary }]}>
                    {studentData.leave || 0}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.percentageCell,
                      { color: getAttendanceColor(studentData.attendancePercentage || 0) },
                    ]}
                  >
                    {studentData.attendancePercentage || 0}%
                  </Text>
                </Animatable.View>
              ))}
            </View>
          </ScrollView>
        </Card>
      ) : (
        <Card style={styles.noDataCard}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.noDataText}>No attendance data available for this period.</Text>
          <Text style={styles.noDataSubtext}>
            This could mean:
          </Text>
          <Text style={styles.noDataSubtext}>
            • No attendance has been marked yet for this class
          </Text>
          <Text style={styles.noDataSubtext}>
            • No students are enrolled in this class
          </Text>
          <Text style={styles.noDataSubtext}>
            • The selected period has no working days
          </Text>
          <Text style={styles.noDataSubtext}>
            • Try selecting a different period or class
          </Text>
          <Text style={styles.noDataSubtext}>
            • Monthly view often works better than yearly view
          </Text>
          {viewType === "year" && (
            <Text style={[styles.noDataSubtext, { color: theme.colors.warning, fontWeight: "600" }]}>
              💡 Tip: Try switching to monthly view for better results
            </Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={fetchAttendanceSummary}>
            <Ionicons name="refresh" size={16} color={theme.colors.textLight} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          {viewType === "year" && (
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.warning, marginTop: theme.spacing.sm }]} 
              onPress={() => setViewType("month")}
            >
              <Ionicons name="calendar" size={16} color={theme.colors.textLight} />
              <Text style={styles.retryButtonText}>Switch to Monthly View</Text>
            </TouchableOpacity>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  controlCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  viewTypeContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  viewTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  viewTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  viewTypeButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  viewTypeButtonTextActive: {
    color: theme.colors.textLight,
  },
  pickerContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  picker: {
    height: 50,
  },
  periodNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  periodText: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "600",
  },
  summaryCard: {
    marginBottom: theme.spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    ...theme.typography.h4,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  detailedSummary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  summaryDot: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  summaryText: {
    ...theme.typography.body2,
    color: theme.colors.text,
  },
  tableCard: {
    marginBottom: theme.spacing.md,
  },
  tableContainer: {
    minWidth: 600, // Ensure table is wide enough for all columns
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  headerCell: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    fontWeight: "600",
    textAlign: "center",
  },
  rollCell: {
    width: 80,
  },
  nameCell: {
    width: 120,
    textAlign: "left",
  },
  statsCell: {
    width: 70,
  },
  percentageCell: {
    width: 60,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  cell: {
    ...theme.typography.body2,
    color: theme.colors.text,
    textAlign: "center",
  },
  loadingCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  noDataCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  noDataText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  noDataSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: "center",
    fontSize: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
    fontWeight: "500",
  },
});
