import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Card, Title, Paragraph, Button, TextInput, SegmentedButtons, List, Divider } from "react-native-paper";
import { showMessage } from "react-native-flash-message";
import * as Animatable from "react-native-animatable";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function EditClass({ navigation, route }) {
  const { classId } = route.params;

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);

  const [formData, setFormData] = useState({
    maxStudents: "",
    classroom: "",
    isActive: true,
    classTeacher: "",
  });

  useEffect(() => {
    fetchClassData();
    fetchAvailableTeachers();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/classes/${classId}`);
      const classInfo = response.data.data;
      setClassData(classInfo);
      setFormData({
        maxStudents: classInfo.maxStudents?.toString() || "70",
        classroom: classInfo.classroom || "",
        isActive: classInfo.isActive !== false,
        classTeacher: classInfo.classTeacher?._id || "",
      });
    } catch (error) {
      console.error("Error fetching class data:", error);
      showMessage({
        message: "Error",
        description: "Failed to load class data",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const response = await axios.get("/api/classes/available-teachers");
      setAvailableTeachers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.maxStudents || parseInt(formData.maxStudents) < 1) {
      showMessage({
        message: "Validation Error",
        description: "Please enter a valid maximum number of students",
        type: "warning",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(`/api/classes/${classId}`, {
        maxStudents: parseInt(formData.maxStudents),
        classroom: formData.classroom,
        isActive: formData.isActive,
        classTeacher: formData.classTeacher || null,
      });

      if (response.data.success) {
        showMessage({
          message: "Success",
          description: "Class updated successfully",
          type: "success",
        });
        navigation.goBack();
      } else {
        showMessage({
          message: "Error",
          description: response.data.message || "Failed to update class",
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating class:", error);
      showMessage({
        message: "Error",
        description: "Failed to update class. Please try again.",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const getTeacherDisplayName = (teacher) => {
    if (teacher.name) return teacher.name;
    if (teacher.firstName || teacher.lastName) {
      return [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ");
    }
    return teacher.email || "Unknown Teacher";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>Loading class data...</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeIn" duration={500}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Edit Class</Title>
              <Paragraph style={styles.subtitle}>
                {classData?.grade}
                {getOrdinalSuffix(classData?.grade)} Class - {classData?.division}
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Class Settings</Title>

              <TextInput
                label="Max Students"
                value={formData.maxStudents}
                onChangeText={(text) => setFormData({ ...formData, maxStudents: text })}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Classroom"
                value={formData.classroom}
                onChangeText={(text) => setFormData({ ...formData, classroom: text })}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., Room 101"
              />

              <SegmentedButtons
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
                buttons={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                style={styles.segmentedButton}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Class Teacher</Title>

              <List.Section>
                <List.Subheader>Select Teacher</List.Subheader>
                {availableTeachers.length === 0 ? (
                  <Paragraph style={styles.noTeachers}>No teachers available. Please create teachers first.</Paragraph>
                ) : (
                  availableTeachers.map((teacher) => (
                    <List.Item
                      key={teacher._id}
                      title={getTeacherDisplayName(teacher)}
                      description={
                        teacher.isClassTeacher
                          ? `Class Teacher of ${teacher.currentClassAssignment?.className || "Unknown"} (${
                              teacher.totalAssignments
                            } class${teacher.totalAssignments > 1 ? "es" : ""})`
                          : "Available"
                      }
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={formData.classTeacher === teacher._id ? "check-circle" : "circle-outline"}
                        />
                      )}
                      onPress={() => setFormData({ ...formData, classTeacher: teacher._id })}
                      style={[styles.teacherItem, formData.classTeacher === teacher._id && styles.selectedTeacher]}
                    />
                  ))
                )}
              </List.Section>

              <Button
                mode="outlined"
                onPress={() => setFormData({ ...formData, classTeacher: "" })}
                style={styles.clearButton}
              >
                Clear Teacher Assignment
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.footerButton}>
          Cancel
        </Button>
        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.footerButton}>
          Save Changes
        </Button>
      </View>
    </View>
  );
}

const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  title: {
    ...theme.typography.h5,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  segmentedButton: {
    marginBottom: theme.spacing.md,
  },
  teacherItem: {
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  selectedTeacher: {
    backgroundColor: theme.colors.primary + "20",
  },
  noTeachers: {
    textAlign: "center",
    fontStyle: "italic",
    color: theme.colors.textSecondary,
  },
  clearButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
