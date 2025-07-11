import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from "react-native";
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
  Avatar,
  Divider,
  Menu,
  Checkbox,
  DataTable,
  Badge,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function ClassDetails({ navigation, route }) {
  const { classId } = route.params;
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  // Dialog states
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
    address: "",
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    description: "",
    teacherId: "",
  });

  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  useEffect(() => {
    if (activeTab === "students") {
      filterStudents();
    } else if (activeTab === "subjects") {
      filterSubjects();
    }
  }, [students, subjects, searchQuery, activeTab]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, subjectsResponse, teachersResponse] = await Promise.all([
        axios.get(`/api/classes/${classId}`),
        axios.get(`/api/classes/${classId}/students`),
        axios.get(`/api/classes/${classId}/subjects`),
        axios.get("/api/users?role=teacher&status=approved"),
      ]);

      setClassData(classResponse.data.data);
      setStudents(studentsResponse.data.data || []);
      setSubjects(subjectsResponse.data.data || []);
      setAvailableTeachers(teachersResponse.data.data || []);
      
      // Set filtered data
      setFilteredStudents(studentsResponse.data.data || []);
      setFilteredSubjects(subjectsResponse.data.data || []);
    } catch (error) {
      showMessage({
        message: "Error fetching class details",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClassDetails();
    setRefreshing(false);
  };

  const filterStudents = () => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const filterSubjects = () => {
    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddStudent = async () => {
    try {
      const response = await axios.post(`/api/classes/${classId}/students`, studentForm);
      showMessage({
        message: "Success",
        description: "Student added successfully",
        type: "success",
      });
      setShowAddStudentDialog(false);
      setStudentForm({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        parentName: "",
        parentPhone: "",
        address: "",
      });
      fetchClassDetails();
    } catch (error) {
      showMessage({
        message: "Error adding student",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleBulkUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        const formData = new FormData();
        formData.append("file", {
          uri: result.uri,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          name: result.name,
        });

        const response = await axios.post(`/api/classes/${classId}/students/bulk`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        showMessage({
          message: "Success",
          description: `Successfully uploaded ${response.data.uploadedCount} students`,
          type: "success",
        });
        setShowBulkUploadDialog(false);
        fetchClassDetails();
      }
    } catch (error) {
      showMessage({
        message: "Error uploading file",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleAddSubject = async () => {
    try {
      const response = await axios.post(`/api/classes/${classId}/subjects`, subjectForm);
      showMessage({
        message: "Success",
        description: "Subject added successfully",
        type: "success",
      });
      setShowAddSubjectDialog(false);
      setSubjectForm({
        name: "",
        code: "",
        description: "",
        teacherId: "",
      });
      fetchClassDetails();
    } catch (error) {
      showMessage({
        message: "Error adding subject",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    Alert.alert(
      "Remove Student",
      "Are you sure you want to remove this student from the class?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/api/classes/${classId}/students/${studentId}`);
              showMessage({
                message: "Success",
                description: "Student removed successfully",
                type: "success",
              });
              fetchClassDetails();
            } catch (error) {
              showMessage({
                message: "Error removing student",
                description: error.response?.data?.message || "Please try again later",
                type: "danger",
              });
            }
          },
        },
      ]
    );
  };

  const handleRemoveSubject = async (subjectId) => {
    Alert.alert(
      "Remove Subject",
      "Are you sure you want to remove this subject from the class?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/api/classes/${classId}/subjects/${subjectId}`);
              showMessage({
                message: "Success",
                description: "Subject removed successfully",
                type: "success",
              });
              fetchClassDetails();
            } catch (error) {
              showMessage({
                message: "Error removing subject",
                description: error.response?.data?.message || "Please try again later",
                type: "danger",
              });
            }
          },
        },
      ]
    );
  };

  const StudentCard = ({ student }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.studentInfo}>
            <Avatar.Text size={40} label={student.name.charAt(0)} style={styles.avatar} />
            <View style={styles.studentDetails}>
              <Title style={styles.studentName}>{student.name}</Title>
              <Paragraph style={styles.studentEmail}>{student.email}</Paragraph>
              <Paragraph style={styles.studentPhone}>{student.phone}</Paragraph>
              <View style={styles.chips}>
                <Chip style={styles.chip}>
                  {student.rollNumber || "No Roll No"}
                </Chip>
                <Chip style={[styles.chip, student.isActive ? styles.activeChip : styles.inactiveChip]}>
                  {student.isActive ? "Active" : "Inactive"}
                </Chip>
              </View>
            </View>
          </View>
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleRemoveStudent(student._id)}
          />
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const SubjectCard = ({ subject }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.subjectInfo}>
            <View style={styles.subjectIcon}>
              <IconButton icon="book" size={24} iconColor={theme.colors.primary} />
            </View>
            <View style={styles.subjectDetails}>
              <Title style={styles.subjectName}>{subject.name}</Title>
              <Paragraph style={styles.subjectCode}>Code: {subject.code}</Paragraph>
              <Paragraph style={styles.subjectDescription}>{subject.description}</Paragraph>
              <View style={styles.chips}>
                <Chip style={styles.chip}>
                  {subject.teacher ? subject.teacher.name : "No Teacher"}
                </Chip>
              </View>
            </View>
          </View>
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleRemoveSubject(subject._id)}
          />
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const tabOptions = [
    { value: "students", label: "Students" },
    { value: "subjects", label: "Subjects" },
    { value: "attendance", label: "Attendance" },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Loading class details...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.classInfo}>
          <Title style={styles.classTitle}>
            {classData?.grade}{getOrdinalSuffix(classData?.grade)} Class - {classData?.division}
          </Title>
          <Paragraph style={styles.classSubtitle}>
            {classData?.classTeacher ? `Teacher: ${classData.classTeacher.name}` : "No teacher assigned"}
          </Paragraph>
          <View style={styles.stats}>
            <Chip style={styles.statChip}>
              {students.length} Students
            </Chip>
            <Chip style={styles.statChip}>
              {subjects.length} Subjects
            </Chip>
            <Chip style={styles.statChip}>
              {classData?.classroom || "No Classroom"}
            </Chip>
          </View>
        </View>
      </View>

      {/* Search and Tabs */}
      <View style={styles.controls}>
        <Searchbar
          placeholder={`Search ${activeTab}...`}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={tabOptions}
          style={styles.tabButtons}
        />
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "students" && (
          <View>
            {filteredStudents.length === 0 ? (
              <View style={styles.emptyState}>
                <Paragraph style={styles.emptyText}>
                  {searchQuery ? "No students found matching your search" : "No students in this class"}
                </Paragraph>
                <Button mode="contained" onPress={() => setShowAddStudentDialog(true)}>
                  Add First Student
                </Button>
              </View>
            ) : (
              filteredStudents.map((student) => <StudentCard key={student._id} student={student} />)
            )}
          </View>
        )}

        {activeTab === "subjects" && (
          <View>
            {filteredSubjects.length === 0 ? (
              <View style={styles.emptyState}>
                <Paragraph style={styles.emptyText}>
                  {searchQuery ? "No subjects found matching your search" : "No subjects in this class"}
                </Paragraph>
                <Button mode="contained" onPress={() => setShowAddSubjectDialog(true)}>
                  Add First Subject
                </Button>
              </View>
            ) : (
              filteredSubjects.map((subject) => <SubjectCard key={subject._id} subject={subject} />)
            )}
          </View>
        )}

        {activeTab === "attendance" && (
          <View>
            <Card style={styles.attendanceCard}>
              <Card.Content>
                <Title>Attendance Overview</Title>
                <Paragraph>Manage attendance for this class</Paragraph>
                <Button mode="contained" onPress={() => setShowAttendanceDialog(true)} style={styles.attendanceButton}>
                  Take Attendance
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Add Student Dialog */}
      <Portal>
        <Dialog visible={showAddStudentDialog} onDismiss={() => setShowAddStudentDialog(false)}>
          <Dialog.Title>Add Student</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Full Name"
              value={studentForm.name}
              onChangeText={(text) => setStudentForm({ ...studentForm, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={studentForm.email}
              onChangeText={(text) => setStudentForm({ ...studentForm, email: text })}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={studentForm.phone}
              onChangeText={(text) => setStudentForm({ ...studentForm, phone: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Date of Birth"
              value={studentForm.dateOfBirth}
              onChangeText={(text) => setStudentForm({ ...studentForm, dateOfBirth: text })}
              style={styles.input}
            />
            <TextInput
              label="Parent Name"
              value={studentForm.parentName}
              onChangeText={(text) => setStudentForm({ ...studentForm, parentName: text })}
              style={styles.input}
            />
            <TextInput
              label="Parent Phone"
              value={studentForm.parentPhone}
              onChangeText={(text) => setStudentForm({ ...studentForm, parentPhone: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Address"
              value={studentForm.address}
              onChangeText={(text) => setStudentForm({ ...studentForm, address: text })}
              multiline
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddStudentDialog(false)}>Cancel</Button>
            <Button onPress={handleAddStudent}>Add Student</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Add Subject Dialog */}
        <Dialog visible={showAddSubjectDialog} onDismiss={() => setShowAddSubjectDialog(false)}>
          <Dialog.Title>Add Subject</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Subject Name"
              value={subjectForm.name}
              onChangeText={(text) => setSubjectForm({ ...subjectForm, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Subject Code"
              value={subjectForm.code}
              onChangeText={(text) => setSubjectForm({ ...subjectForm, code: text })}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={subjectForm.description}
              onChangeText={(text) => setSubjectForm({ ...subjectForm, description: text })}
              multiline
              style={styles.input}
            />
            <TextInput
              label="Teacher ID (Optional)"
              value={subjectForm.teacherId}
              onChangeText={(text) => setSubjectForm({ ...subjectForm, teacherId: text })}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddSubjectDialog(false)}>Cancel</Button>
            <Button onPress={handleAddSubject}>Add Subject</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog visible={showBulkUploadDialog} onDismiss={() => setShowBulkUploadDialog(false)}>
          <Dialog.Title>Bulk Upload Students</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Upload an Excel file with student information.</Paragraph>
            <Paragraph style={styles.uploadNote}>
              File should contain columns: Name, Email, Phone, DateOfBirth, ParentName, ParentPhone, Address
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBulkUploadDialog(false)}>Cancel</Button>
            <Button onPress={handleBulkUpload}>Upload File</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB with menu */}
      <FAB.Group
        open={false}
        visible
        icon="plus"
        actions={[
          {
            icon: "account-plus",
            label: "Add Student",
            onPress: () => setShowAddStudentDialog(true),
          },
          {
            icon: "upload",
            label: "Bulk Upload",
            onPress: () => setShowBulkUploadDialog(true),
          },
          {
            icon: "book-plus",
            label: "Add Subject",
            onPress: () => setShowAddSubjectDialog(true),
          },
        ]}
        style={styles.fab}
      />
    </View>
  );
}

// Helper function
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  classInfo: {
    alignItems: "center",
  },
  classTitle: {
    ...theme.typography.h5,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  classSubtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statChip: {
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
  },
  controls: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  tabButtons: {
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
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  subjectIcon: {
    marginRight: theme.spacing.md,
  },
  studentDetails: {
    flex: 1,
  },
  subjectDetails: {
    flex: 1,
  },
  studentName: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  subjectName: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  studentEmail: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  subjectCode: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  studentPhone: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  subjectDescription: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
  },
  activeChip: {
    backgroundColor: theme.colors.successLight,
  },
  inactiveChip: {
    backgroundColor: theme.colors.warningLight,
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
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  uploadNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    marginTop: theme.spacing.sm,
  },
  attendanceCard: {
    marginBottom: theme.spacing.md,
  },
  attendanceButton: {
    marginTop: theme.spacing.md,
  },
}); 