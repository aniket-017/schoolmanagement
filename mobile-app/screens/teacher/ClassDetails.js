import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";
import apiService from "../../services/apiService";

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

export default function ClassDetails({ navigation, route }) {
  const { classId, className } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    loadClassDetails();
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse] = await Promise.all([
        apiService.classes.getClassById(classId),
        apiService.classes.getClassStudents(classId),
      ]);

      if (classResponse.success) {
        setClassData(classResponse.data);
      }
      
      if (studentsResponse.success) {
        setStudents(studentsResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading class details:", error);
      Alert.alert("Error", "Failed to load class details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClassDetails();
  };

  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const renderHeader = () => (
    <LinearGradient colors={theme.colors.gradients.primary} style={styles.header}>
      <Animatable.View animation="fadeInDown" delay={200}>
        <Text style={styles.headerTitle}>{className}</Text>
        <Text style={styles.headerSubtitle}>
          {students.length} Students • Class Teacher
        </Text>
      </Animatable.View>
    </LinearGradient>
  );

  const renderStudentCard = (student, index) => (
    <Animatable.View
      key={student._id}
      animation="fadeInUp"
      delay={300 + index * 50}
      style={styles.studentCardContainer}
    >
      <Card style={styles.studentCard} onPress={() => handleStudentPress(student)}>
        <View style={styles.studentContent}>
          <View style={styles.rollNumberContainer}>
            <Text style={styles.rollNumber}>{student.rollNumber || "N/A"}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </Card>
    </Animatable.View>
  );

  const renderStudentModal = () =>
    <Modal
      visible={showStudentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowStudentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Student Details</Text>
            <TouchableOpacity
              onPress={() => setShowStudentModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {selectedStudent && (
            <ScrollView style={styles.modalBody}>
              {/* Basic Information */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Student ID:</Text><Text style={styles.detailValue}>{selectedStudent.studentId || "N/A"}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Admission No:</Text><Text style={styles.detailValue}>{selectedStudent.admissionNumber || "N/A"}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Roll Number:</Text><Text style={styles.detailValue}>{selectedStudent.rollNumber || "N/A"}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Full Name:</Text><Text style={styles.detailValue}>{selectedStudent.name || `${selectedStudent.firstName || ""} ${selectedStudent.middleName || ""} ${selectedStudent.lastName || ""}`.trim()}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue}>{selectedStudent.email}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone:</Text><Text style={styles.detailValue}>{selectedStudent.phone || selectedStudent.mobileNumber || "N/A"}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Gender:</Text><Text style={styles.detailValue}>{selectedStudent.gender ? selectedStudent.gender.charAt(0).toUpperCase() + selectedStudent.gender.slice(1) : "N/A"}</Text></View>
                {selectedStudent.dateOfBirth && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Date of Birth:</Text><Text style={styles.detailValue}>{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</Text></View>)}
                {selectedStudent.nationality && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Nationality:</Text><Text style={styles.detailValue}>{selectedStudent.nationality}</Text></View>)}
                {selectedStudent.religion && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Religion:</Text><Text style={styles.detailValue}>{selectedStudent.religion}</Text></View>)}
                {selectedStudent.bloodGroup && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Blood Group:</Text><Text style={styles.detailValue}>{selectedStudent.bloodGroup}</Text></View>)}
              </View>

              {/* Parent Information */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Parent Information</Text>
                {selectedStudent.father && selectedStudent.father.name && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Father's Name:</Text><Text style={styles.detailValue}>{selectedStudent.father.name}</Text></View>)}
                {selectedStudent.father && selectedStudent.father.occupation && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Father's Occupation:</Text><Text style={styles.detailValue}>{selectedStudent.father.occupation}</Text></View>)}
                {selectedStudent.father && selectedStudent.father.phone && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Father's Phone:</Text><Text style={styles.detailValue}>{selectedStudent.father.phone}</Text></View>)}
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Mother's Name:</Text><Text style={styles.detailValue}>{selectedStudent.mother?.name || selectedStudent.mothersName || "N/A"}</Text></View>
                {selectedStudent.mother && selectedStudent.mother.occupation && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Mother's Occupation:</Text><Text style={styles.detailValue}>{selectedStudent.mother.occupation}</Text></View>)}
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Parent Phone:</Text><Text style={styles.detailValue}>{selectedStudent.mother?.phone || selectedStudent.parentsMobileNumber || "N/A"}</Text></View>
                {selectedStudent.guardian && selectedStudent.guardian.name && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Guardian Name:</Text><Text style={styles.detailValue}>{selectedStudent.guardian.name}</Text></View>)}
                {selectedStudent.guardian && selectedStudent.guardian.relation && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Guardian Relation:</Text><Text style={styles.detailValue}>{selectedStudent.guardian.relation}</Text></View>)}
                {selectedStudent.guardian && selectedStudent.guardian.phone && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Guardian Phone:</Text><Text style={styles.detailValue}>{selectedStudent.guardian.phone}</Text></View>)}
              </View>

              {/* Address Information */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Address Information</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Current Address:</Text><Text style={styles.detailValue}>{selectedStudent.currentAddress || selectedStudent.address?.street || "N/A"}</Text></View>
                {selectedStudent.permanentAddress && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Permanent Address:</Text><Text style={styles.detailValue}>{selectedStudent.permanentAddress}</Text></View>)}
                {selectedStudent.city && (<View style={styles.detailRow}><Text style={styles.detailLabel}>City:</Text><Text style={styles.detailValue}>{selectedStudent.city}</Text></View>)}
                {selectedStudent.state && (<View style={styles.detailRow}><Text style={styles.detailLabel}>State:</Text><Text style={styles.detailValue}>{selectedStudent.state}</Text></View>)}
                {selectedStudent.pinCode && (<View style={styles.detailRow}><Text style={styles.detailLabel}>PIN Code:</Text><Text style={styles.detailValue}>{selectedStudent.pinCode}</Text></View>)}
              </View>

              {/* Academic Information */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Academic Information</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Grade:</Text><Text style={styles.detailValue}>{selectedStudent.grade || selectedStudent.currentGrade || "N/A"}</Text></View>
                {selectedStudent.section && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Section:</Text><Text style={styles.detailValue}>{selectedStudent.section}</Text></View>)}
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Academic Year:</Text><Text style={styles.detailValue}>{selectedStudent.academicYear || "N/A"}</Text></View>
                {selectedStudent.previousSchool && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Previous School:</Text><Text style={styles.detailValue}>{selectedStudent.previousSchool}</Text></View>)}
                {selectedStudent.transferCertificateNumber && (<View style={styles.detailRow}><Text style={styles.detailLabel}>TC Number:</Text><Text style={styles.detailValue}>{selectedStudent.transferCertificateNumber}</Text></View>)}
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Status:</Text><Text style={[styles.detailValue, selectedStudent.isActive ? styles.activeText : styles.inactiveText]}>{selectedStudent.isActive ? "Active" : "Inactive"}</Text></View>
                {selectedStudent.enrollmentStatus && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Enrollment Status:</Text><Text style={styles.detailValue}>{selectedStudent.enrollmentStatus}</Text></View>)}
              </View>

              {/* Fee Information */}
              {selectedStudent.feeStructure && (<View style={styles.detailSection}><Text style={styles.sectionTitle}>Fee Information</Text><View style={styles.detailRow}><Text style={styles.detailLabel}>Fee Structure:</Text><Text style={styles.detailValue}>{selectedStudent.feeStructure}</Text></View>{selectedStudent.feeDiscount > 0 && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Fee Discount:</Text><Text style={styles.detailValue}>{selectedStudent.feeDiscount}%</Text></View>)}{selectedStudent.paymentStatus && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Payment Status:</Text><Text style={[styles.detailValue, selectedStudent.paymentStatus === 'paid' ? styles.activeText : selectedStudent.paymentStatus === 'overdue' ? styles.errorText : styles.warningText]}>{selectedStudent.paymentStatus.charAt(0).toUpperCase() + selectedStudent.paymentStatus.slice(1)}</Text></View>)}</View>)}

              {/* Transport Information */}
              {selectedStudent.transportDetails && selectedStudent.transportDetails.required && (<View style={styles.detailSection}><Text style={styles.sectionTitle}>Transport Information</Text>{selectedStudent.transportDetails.pickupPoint && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Pickup Point:</Text><Text style={styles.detailValue}>{selectedStudent.transportDetails.pickupPoint}</Text></View>)}{selectedStudent.transportDetails.dropPoint && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Drop Point:</Text><Text style={styles.detailValue}>{selectedStudent.transportDetails.dropPoint}</Text></View>)}{selectedStudent.transportDetails.busNumber && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Bus Number:</Text><Text style={styles.detailValue}>{selectedStudent.transportDetails.busNumber}</Text></View>)}{selectedStudent.transportDetails.driverName && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Driver Name:</Text><Text style={styles.detailValue}>{selectedStudent.transportDetails.driverName}</Text></View>)}{selectedStudent.transportDetails.driverPhone && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Driver Phone:</Text><Text style={styles.detailValue}>{selectedStudent.transportDetails.driverPhone}</Text></View>)}</View>)}

              {/* Medical Information */}
              {selectedStudent.medicalHistory && (<View style={styles.detailSection}><Text style={styles.sectionTitle}>Medical Information</Text>{selectedStudent.medicalHistory.allergies && selectedStudent.medicalHistory.allergies.length > 0 && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Allergies:</Text><Text style={styles.detailValue}>{selectedStudent.medicalHistory.allergies.join(", ")}</Text></View>)}{selectedStudent.medicalHistory.medicalConditions && selectedStudent.medicalHistory.medicalConditions.length > 0 && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Medical Conditions:</Text><Text style={styles.detailValue}>{selectedStudent.medicalHistory.medicalConditions.join(", ")}</Text></View>)}{selectedStudent.medicalHistory.emergencyInstructions && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Emergency Instructions:</Text><Text style={styles.detailValue}>{selectedStudent.medicalHistory.emergencyInstructions}</Text></View>)}{selectedStudent.medicalHistory.vaccinationStatus && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Vaccination Status:</Text><Text style={styles.detailValue}>{selectedStudent.medicalHistory.vaccinationStatus}</Text></View>)}</View>)}

              {/* Emergency Contact */}
              {selectedStudent.emergencyContact && (<View style={styles.detailSection}><Text style={styles.sectionTitle}>Emergency Contact</Text>{selectedStudent.emergencyContact.name && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Name:</Text><Text style={styles.detailValue}>{selectedStudent.emergencyContact.name}</Text></View>)}{selectedStudent.emergencyContact.relation && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Relation:</Text><Text style={styles.detailValue}>{selectedStudent.emergencyContact.relation}</Text></View>)}{selectedStudent.emergencyContact.phone && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Phone:</Text><Text style={styles.detailValue}>{selectedStudent.emergencyContact.phone}</Text></View>)}{selectedStudent.emergencyContact.email && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue}>{selectedStudent.emergencyContact.email}</Text></View>)}</View>)}

              {/* Additional Information */}
              {(selectedStudent.remarks || selectedStudent.notes) && (<View style={styles.detailSection}><Text style={styles.sectionTitle}>Additional Information</Text>{selectedStudent.remarks && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Remarks:</Text><Text style={styles.detailValue}>{selectedStudent.remarks}</Text></View>)}{selectedStudent.notes && selectedStudent.notes.length > 0 && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Notes:</Text><Text style={styles.detailValue}>{selectedStudent.notes.join(", ")}</Text></View>)}</View>)}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>;

  const renderEmptyState = () => (
    <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Students Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no students enrolled in this class yet.
      </Text>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading class details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        <View style={styles.studentsContainer}>
          <Text style={styles.sectionTitle}>Students List</Text>
          {students.length > 0 ? (
            students.map((student, index) => renderStudentCard(student, index))
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {renderStudentModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  studentsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  studentCardContainer: {
    marginBottom: theme.spacing.md,
  },
  studentCard: {
    padding: 0,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  studentContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  rollNumberContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.md,
    minWidth: 50,
    alignItems: "center",
  },
  rollNumber: {
    color: theme.colors.textLight,
    fontWeight: "bold",
    fontSize: 14,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  detailSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + "30",
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 2,
    textAlign: "right",
  },
  activeText: {
    color: theme.colors.success,
  },
  inactiveText: {
    color: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
  },
  warningText: {
    color: theme.colors.warning,
  },
}); 