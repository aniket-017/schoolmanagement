import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  SegmentedButtons,
  Chip,
  IconButton,
  Dialog,
  Portal,
  List,
  Divider,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  { period: 1, startTime: "08:00", endTime: "08:45" },
  { period: 2, startTime: "08:45", endTime: "09:30" },
  { period: 3, startTime: "09:30", endTime: "10:15" },
  { period: 4, startTime: "10:15", endTime: "11:00" },
  { period: 5, startTime: "11:15", endTime: "12:00" },
  { period: 6, startTime: "12:00", endTime: "12:45" },
  { period: 7, startTime: "12:45", endTime: "01:30" },
  { period: 8, startTime: "01:30", endTime: "02:15" },
];

export default function TimetableManagement({ navigation, route }) {
  const { classId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [timetable, setTimetable] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showAddPeriodDialog, setShowAddPeriodDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periodForm, setPeriodForm] = useState({
    subjectId: "",
    teacherId: "",
    room: "",
    type: "theory",
  });

  useEffect(() => {
    fetchTimetableData();
  }, [classId]);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const [timetableRes, subjectsRes, teachersRes] = await Promise.all([
        axios.get(`/api/timetables/class/${classId}`),
        axios.get("/api/subjects"),
        axios.get("/api/users?role=teacher&status=approved"),
      ]);

      if (timetableRes.data.success) {
        setTimetable(timetableRes.data.data.weeklyTimetable || {});
      }
      if (subjectsRes.data.success) {
        setSubjects(subjectsRes.data.data || []);
      }
      if (teachersRes.data.success) {
        setTeachers(teachersRes.data.data || []);
      }
    } catch (error) {
      showMessage({
        message: "Error loading timetable data",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = async () => {
    if (!periodForm.subjectId || !periodForm.teacherId) {
      showMessage({
        message: "Error",
        description: "Please select both subject and teacher",
        type: "danger",
      });
      return;
    }

    try {
      const newPeriod = {
        periodNumber: selectedPeriod,
        subject: periodForm.subjectId,
        teacher: periodForm.teacherId,
        startTime: TIME_SLOTS[selectedPeriod - 1].startTime,
        endTime: TIME_SLOTS[selectedPeriod - 1].endTime,
        room: periodForm.room || "",
        type: periodForm.type,
      };

      setTimetable((prev) => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), newPeriod].sort((a, b) => a.periodNumber - b.periodNumber),
      }));

      setShowAddPeriodDialog(false);
      setSelectedPeriod(null);
      setPeriodForm({
        subjectId: "",
        teacherId: "",
        room: "",
        type: "theory",
      });

      showMessage({
        message: "Success",
        description: "Period added successfully",
        type: "success",
      });
    } catch (error) {
      showMessage({
        message: "Error",
        description: "Failed to add period",
        type: "danger",
      });
    }
  };

  const handleRemovePeriod = (periodNumber) => {
    Alert.alert("Remove Period", "Are you sure you want to remove this period?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setTimetable((prev) => ({
            ...prev,
            [selectedDay]: prev[selectedDay].filter((p) => p.periodNumber !== periodNumber),
          }));
          showMessage({
            message: "Success",
            description: "Period removed successfully",
            type: "success",
          });
        },
      },
    ]);
  };

  const handleSaveTimetable = async () => {
    try {
      setSaving(true);
      const response = await axios.post(`/api/timetables/class/${classId}`, {
        weeklyTimetable: timetable,
        academicYear: new Date().getFullYear().toString(),
        semester: "1",
      });

      if (response.data.success) {
        showMessage({
          message: "Success",
          description: "Timetable saved successfully",
          type: "success",
        });
      } else {
        showMessage({
          message: "Error",
          description: response.data.message || "Failed to save timetable",
          type: "danger",
        });
      }
    } catch (error) {
      showMessage({
        message: "Error",
        description: error.response?.data?.message || "Failed to save timetable",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s._id === subjectId);
    return subject ? subject.name : "Unknown";
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher ? teacher.name : "Unknown";
  };

  const getPeriodData = (periodNumber) => {
    return timetable[selectedDay]?.find((p) => p.periodNumber === periodNumber);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Loading timetable data...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title>Timetable Management</Title>
            <Paragraph>Create and manage the weekly schedule for this class</Paragraph>
            <Button
              mode="contained"
              onPress={handleSaveTimetable}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? "Saving..." : "Save Timetable"}
            </Button>
          </Card.Content>
        </Card>

        {/* Day Selection */}
        <Card style={styles.dayCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Select Day</Title>
            <SegmentedButtons
              value={selectedDay}
              onValueChange={setSelectedDay}
              buttons={DAYS.map((day) => ({ value: day, label: day.slice(0, 3) }))}
              style={styles.dayButtons}
            />
          </Card.Content>
        </Card>

        {/* Timetable Grid */}
        <Card style={styles.timetableCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>{selectedDay} Schedule</Title>
            <View style={styles.timetableGrid}>
              {TIME_SLOTS.map((slot) => {
                const periodData = getPeriodData(slot.period);
                return (
                  <Animatable.View key={slot.period} animation="fadeIn" duration={300}>
                    <Card style={[styles.periodCard, periodData && styles.filledPeriodCard]}>
                      <Card.Content style={styles.periodContent}>
                        <View style={styles.periodHeader}>
                          <Title style={styles.periodNumber}>Period {slot.period}</Title>
                          <Paragraph style={styles.periodTime}>
                            {slot.startTime} - {slot.endTime}
                          </Paragraph>
                        </View>

                        {periodData ? (
                          <View style={styles.periodDetails}>
                            <List.Item
                              title={getSubjectName(periodData.subject)}
                              description={`Teacher: ${getTeacherName(periodData.teacher)}`}
                              left={(props) => <List.Icon {...props} icon="book" />}
                              right={(props) => (
                                <IconButton
                                  {...props}
                                  icon="delete"
                                  size={20}
                                  onPress={() => handleRemovePeriod(slot.period)}
                                />
                              )}
                            />
                            {periodData.room && (
                              <Chip style={styles.roomChip} icon="map-marker">
                                {periodData.room}
                              </Chip>
                            )}
                            <Chip style={styles.typeChip} icon="school">
                              {periodData.type}
                            </Chip>
                          </View>
                        ) : (
                          <Button
                            mode="outlined"
                            onPress={() => {
                              setSelectedPeriod(slot.period);
                              setShowAddPeriodDialog(true);
                            }}
                            style={styles.addPeriodButton}
                          >
                            Add Period
                          </Button>
                        )}
                      </Card.Content>
                    </Card>
                  </Animatable.View>
                );
              })}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Period Dialog */}
      <Portal>
        <Dialog visible={showAddPeriodDialog} onDismiss={() => setShowAddPeriodDialog(false)}>
          <Dialog.Title>Add Period {selectedPeriod}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Subject"
              value={periodForm.subjectId}
              onChangeText={(text) => setPeriodForm({ ...periodForm, subjectId: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Teacher"
              value={periodForm.teacherId}
              onChangeText={(text) => setPeriodForm({ ...periodForm, teacherId: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Room (Optional)"
              value={periodForm.room}
              onChangeText={(text) => setPeriodForm({ ...periodForm, room: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Type"
              value={periodForm.type}
              onChangeText={(text) => setPeriodForm({ ...periodForm, type: text })}
              style={styles.input}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddPeriodDialog(false)}>Cancel</Button>
            <Button onPress={handleAddPeriod}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
  },
  dayCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  dayButtons: {
    marginTop: 8,
  },
  timetableCard: {
    marginBottom: 16,
  },
  timetableGrid: {
    gap: 12,
  },
  periodCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  filledPeriodCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  periodContent: {
    padding: 8,
  },
  periodHeader: {
    marginBottom: 8,
  },
  periodNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  periodTime: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  periodDetails: {
    gap: 8,
  },
  roomChip: {
    alignSelf: "flex-start",
  },
  typeChip: {
    alignSelf: "flex-start",
  },
  addPeriodButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
});
