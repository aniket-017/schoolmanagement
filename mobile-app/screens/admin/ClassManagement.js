import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  List,
  FAB,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Dialog,
  Portal,
  TextInput,
  Chip,
  IconButton,
  SegmentedButtons,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function ClassManagement({ navigation }) {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filterGrade, setFilterGrade] = useState("all");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("/api/classes");
      setClasses(response.data.data);
      filterClasses(response.data.data, searchQuery, filterGrade);
    } catch (error) {
      showMessage({
        message: "Error fetching classes",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterClasses = (classList, query, gradeFilter) => {
    let filtered = classList;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (cls) =>
          cls.name.toLowerCase().includes(query.toLowerCase()) ||
          cls.grade.toString().includes(query) ||
          cls.division.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by grade
    if (gradeFilter !== "all") {
      filtered = filtered.filter((cls) => cls.grade.toString() === gradeFilter);
    }

    setFilteredClasses(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterClasses(classes, query, filterGrade);
  };

  const handleGradeFilter = (value) => {
    setFilterGrade(value);
    filterClasses(classes, searchQuery, value);
  };

  const handleClassPress = (cls) => {
    setSelectedClass(cls);
    setIsDialogVisible(true);
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const ClassCard = ({ cls }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card style={styles.card} onPress={() => handleClassPress(cls)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.classInfo}>
            <View style={styles.classDetails}>
              <Title style={styles.className}>
                {cls.grade}
                {getOrdinalSuffix(cls.grade)} Class - {cls.division}
              </Title>
              <Paragraph style={styles.classGrade}>
                {cls.classTeacher ? `Teacher: ${cls.classTeacher.name}` : "No teacher assigned"}
              </Paragraph>
              <View style={styles.chips}>
                <Chip style={styles.chip}>
                  {cls.currentStrength || 0}/{cls.maxStudents} Students
                </Chip>
                <Chip style={[styles.chip, cls.classTeacher ? styles.teacherAssigned : styles.noTeacher]}>
                  {cls.classTeacher ? "Teacher Assigned" : "No Teacher"}
                </Chip>
              </View>
              <Paragraph style={styles.classroom}>Classroom: {cls.classroom || "Not assigned"}</Paragraph>
            </View>
          </View>
          <IconButton icon="chevron-right" size={24} iconColor={theme.colors.primary} />
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const gradeOptions = [
    { value: "all", label: "All Grades" },
    ...Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1).toString(),
      label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
    })),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search classes..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={filterGrade}
          onValueChange={handleGradeFilter}
          buttons={gradeOptions}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Paragraph style={styles.emptyText}>
              {searchQuery || filterGrade !== "all"
                ? "No classes found matching your criteria"
                : "No classes created yet"}
            </Paragraph>
            {!searchQuery && filterGrade === "all" && (
              <Button mode="contained" onPress={() => navigation.navigate("AddClass")} style={styles.addFirstButton}>
                Add First Class
              </Button>
            )}
          </View>
        ) : (
          filteredClasses.map((cls) => <ClassCard key={cls._id} cls={cls} />)
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Class Details</Dialog.Title>
          <Dialog.Content>
            {selectedClass && (
              <>
                <Paragraph style={styles.dialogTitle}>
                  {selectedClass.grade}
                  {getOrdinalSuffix(selectedClass.grade)} Class - {selectedClass.division}
                </Paragraph>
                <Paragraph>Grade: {selectedClass.grade}</Paragraph>
                <Paragraph>Division: {selectedClass.division}</Paragraph>
                <Paragraph>Academic Year: {selectedClass.academicYear}</Paragraph>
                <Paragraph>
                  Teacher: {selectedClass.classTeacher ? selectedClass.classTeacher.name : "Not assigned"}
                </Paragraph>
                <Paragraph>
                  Students: {selectedClass.currentStrength || 0}/{selectedClass.maxStudents}
                </Paragraph>
                <Paragraph>Classroom: {selectedClass.classroom || "Not assigned"}</Paragraph>
                <Paragraph>Status: {selectedClass.isActive ? "Active" : "Inactive"}</Paragraph>

                <View style={styles.dialogActions}>
                  {!selectedClass.classTeacher && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        setIsDialogVisible(false);
                        navigation.navigate("AssignTeacher", {
                          classId: selectedClass._id,
                          className: `${selectedClass.grade}${getOrdinalSuffix(selectedClass.grade)} Class - ${
                            selectedClass.division
                          }`,
                        });
                      }}
                      style={styles.assignButton}
                    >
                      Assign Teacher
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setIsDialogVisible(false);
                      navigation.navigate("EditClass", {
                        classId: selectedClass._id,
                      });
                    }}
                    style={styles.editButton}
                  >
                    Edit Class
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setIsDialogVisible(false);
                      navigation.navigate("ClassDetails", {
                        classId: selectedClass._id,
                      });
                    }}
                  >
                    View Details
                  </Button>
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("AddClass")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  filterButtons: {
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classInfo: {
    flex: 1,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  classGrade: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  classroom: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  chips: {
    flexDirection: "row",
    marginTop: theme.spacing.xs,
  },
  chip: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  teacherAssigned: {
    backgroundColor: theme.colors.successLight,
  },
  noTeacher: {
    backgroundColor: theme.colors.warningLight,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.lg,
    flexWrap: "wrap",
  },
  assignButton: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.success,
  },
  editButton: {
    marginRight: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  addFirstButton: {
    marginTop: theme.spacing.md,
  },
  dialogTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
  },
});
