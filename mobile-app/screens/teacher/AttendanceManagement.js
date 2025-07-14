import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { apiService } from "../../services/apiService";
import theme from "../../utils/theme";

export default function AttendanceManagement({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    unmarked: 0,
  });

  // Load teacher's classes on component mount
  useEffect(() => {
    loadTeacherClasses();
  }, []);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadClassStudents();
    }
  }, [selectedClass]);

  const loadTeacherClasses = async () => {
    try {
      setLoading(true);
      const response = await apiService.attendance.getTeacherClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      Alert.alert("Error", "Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.attendance.getClassStudents(selectedClass);
      if (response.success) {
        setStudents(response.data.students);
        // Initialize attendance data
        const initialAttendance = {};
        response.data.students.forEach((student) => {
          initialAttendance[student._id] = "unmarked";
        });
        setAttendanceData(initialAttendance);
        setSummary({
          total: response.data.students.length,
          present: 0,
          absent: 0,
          leave: 0,
          unmarked: response.data.students.length,
        });
      }
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("Error", "Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split("T")[0];
      const response = await apiService.attendance.getClassAttendanceByDate(
        selectedClass,
        dateString
      );
      if (response.success) {
        const existingData = {};
        response.data.attendance.forEach((item) => {
          existingData[item.student._id] = item.status;
        });
        setAttendanceData(existingData);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error loading existing attendance:", error);
      // Don't show error alert as this is expected for new dates
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      if (selectedClass) {
        loadExistingAttendance();
      }
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setStudents([]);
    setAttendanceData({});
    setSummary({
      total: 0,
      present: 0,
      absent: 0,
      leave: 0,
      unmarked: 0,
    });
  };

  const markAttendance = (studentId, status) => {
    const newAttendanceData = { ...attendanceData, [studentId]: status };
    setAttendanceData(newAttendanceData);

    // Update summary
    const newSummary = { ...summary };
    const oldStatus = attendanceData[studentId] || "unmarked";
    
    // Decrease old status count
    if (oldStatus !== "unmarked") {
      newSummary[oldStatus]--;
    } else {
      newSummary.unmarked--;
    }
    
    // Increase new status count
    if (status !== "unmarked") {
      newSummary[status]++;
    } else {
      newSummary.unmarked++;
    }
    
    setSummary(newSummary);
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      Alert.alert("Error", "Please select a class first.");
      return;
    }

    const markedStudents = Object.entries(attendanceData).filter(
      ([_, status]) => status !== "unmarked"
    );

    if (markedStudents.length === 0) {
      Alert.alert("Error", "Please mark attendance for at least one student.");
      return;
    }

    try {
      setSaving(true);
      const dateString = selectedDate.toISOString().split("T")[0];
      const attendancePayload = markedStudents.map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const response = await apiService.attendance.bulkMarkClassAttendance(
        selectedClass,
        dateString,
        attendancePayload
      );

      if (response.success) {
        Alert.alert(
          "Success",
          `Attendance saved successfully!\n\nSummary:\nPresent: ${response.data.summary.present}\nAbsent: ${response.data.summary.absent}\nLeave: ${response.data.summary.leave}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      Alert.alert("Error", "Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return theme.colors.success;
      case "absent":
        return theme.colors.error;
      case "leave":
        return theme.colors.warning;
      default:
        return theme.colors.border;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "checkmark-circle";
      case "absent":
        return "close-circle";
      case "leave":
        return "time";
      default:
        return "ellipse-outline";
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Add a refresh handler
  const handleRefresh = () => {
    if (selectedClass) {
      loadClassStudents();
      loadExistingAttendance();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Attendance</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshIcon}>
              <Ionicons name="refresh" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Mark daily attendance for your classes</Text>
        </Card>

        {/* Date Picker */}
        <Card style={styles.dateCard}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Class Selection */}
        <Card style={styles.classCard}>
          <Text style={styles.sectionTitle}>Select Class</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedClass}
              onValueChange={handleClassChange}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Select a class..." value={null} />
              {classes.map((classItem) => (
                <Picker.Item
                  key={classItem._id}
                  label={classItem.fullName}
                  value={classItem._id}
                />
              ))}
            </Picker>
          </View>
        </Card>

        {/* Students List */}
        {students.length > 0 && (
          <Card style={styles.studentsCard}>
            <Text style={styles.sectionTitle}>Mark Attendance</Text>
            <Text style={styles.studentCount}>
              {students.length} student{students.length !== 1 ? "s" : ""} in class
            </Text>

            {students.map((student, index) => (
              <Animatable.View
                key={student._id}
                animation="fadeInUp"
                delay={index * 50}
                style={styles.studentRow}
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.rollNumber}>{student.rollNumber}</Text>
                  <Text style={styles.studentName}>{student.name}</Text>
                </View>
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.presentButton,
                      attendanceData[student._id] === "present" && styles.selectedButton,
                    ]}
                    onPress={() => markAttendance(student._id, "present")}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={
                        attendanceData[student._id] === "present"
                          ? theme.colors.textLight
                          : theme.colors.success
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.absentButton,
                      attendanceData[student._id] === "absent" && styles.selectedButton,
                    ]}
                    onPress={() => markAttendance(student._id, "absent")}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={
                        attendanceData[student._id] === "absent"
                          ? theme.colors.textLight
                          : theme.colors.error
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.leaveButton,
                      attendanceData[student._id] === "leave" && styles.selectedButton,
                    ]}
                    onPress={() => markAttendance(student._id, "leave")}
                  >
                    <Ionicons
                      name="time"
                      size={20}
                      color={
                        attendanceData[student._id] === "leave"
                          ? theme.colors.textLight
                          : theme.colors.warning
                      }
                    />
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            ))}
          </Card>
        )}

        {/* Summary */}
        {students.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
                  {summary.present}
                </Text>
                <Text style={styles.summaryLabel}>Present</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>
                  {summary.absent}
                </Text>
                <Text style={styles.summaryLabel}>Absent</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>
                  {summary.leave}
                </Text>
                <Text style={styles.summaryLabel}>Leave</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.colors.textSecondary }]}>
                  {summary.unmarked}
                </Text>
                <Text style={styles.summaryLabel}>Unmarked</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Save Button */}
        {students.length > 0 && (
          <Card style={styles.saveCard}>
            <Button
              title="Save Attendance"
              onPress={saveAttendance}
              loading={saving}
              fullWidth
              icon="save"
              variant="primary"
            />
          </Card>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Date Picker Modal */}
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
  headerCard: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  refreshIcon: {
    marginLeft: theme.spacing.md,
    padding: 4,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  dateCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateText: {
    ...theme.typography.body1,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  classCard: {
    marginBottom: theme.spacing.md,
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
  loadCard: {
    marginBottom: theme.spacing.md,
  },
  studentsCard: {
    marginBottom: theme.spacing.md,
  },
  studentCount: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  studentInfo: {
    flex: 1,
  },
  rollNumber: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  studentName: {
    ...theme.typography.body1,
    color: theme.colors.text,
    fontWeight: "500",
  },
  attendanceButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  attendanceButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  presentButton: {
    borderColor: theme.colors.success,
    backgroundColor: "transparent",
  },
  absentButton: {
    borderColor: theme.colors.error,
    backgroundColor: "transparent",
  },
  leaveButton: {
    borderColor: theme.colors.warning,
    backgroundColor: "transparent",
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  summaryCard: {
    marginBottom: theme.spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  saveCard: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  spacer: {
    height: 80,
  },
});
