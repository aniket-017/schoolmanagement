import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile, changePassword, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile editing state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    qualification: user?.qualification || "",
    experience: user?.experience?.toString() || "",
  });

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refresh profile data on component mount and when needed
  useEffect(() => {
    handleRefreshProfile();
  }, []);

  const handleRefreshProfile = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper to get full name
  const getTeacherFullName = (user) => {
    if (!user) return "Teacher";
    const nameParts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return nameParts.length > 0 ? nameParts.join(" ") : user.fullName || user.name || user.email || "Teacher";
  };

  const getSubjectsTaught = (user) => {
    // Helper function to get subject name from various formats
    const getSubjectName = (subject) => {
      if (typeof subject === "string") {
        // If it's just an ObjectId string, we can't show the name
        // This indicates the data wasn't properly populated
        return subject.length === 24 ? "Subject ID: " + subject.slice(-6) : subject;
      }
      return subject?.name || "Unknown Subject";
    };

    // Only use the subjects field
    const subjects = user?.subjects || [];

    if (subjects.length === 0) {
      return [];
    }

    // Return the subjects array with processed names
    return subjects.map((subject) => ({
      _id: subject._id || subject,
      name: getSubjectName(subject),
    }));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!profileData.firstName.trim() && !profileData.lastName.trim()) {
      Alert.alert("Error", "First or Last Name is required");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(profileData);
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || "",
      middleName: user?.middleName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      qualification: user?.qualification || "",
      experience: user?.experience?.toString() || "",
    });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      // Assuming changePassword is available in AuthContext
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      Alert.alert("Success", "Password changed successfully");
      setIsChangePasswordModalVisible(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const renderProfileInfo = () => (
    <View style={styles.profileDetails}>
      {/* Contact Information */}
      <View style={[styles.sectionHeader, { marginTop: 0, paddingTop: 0, borderTopWidth: 0 }]}>
        <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.sectionTitle}>Contact Information</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.email}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.phone || "Not provided"}</Text>
      </View>
      {user?.alternatePhone && (
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user.alternatePhone} (Alternate)</Text>
        </View>
      )}

      {/* Personal Information */}
      <View style={styles.sectionHeader}>
        <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.sectionTitle}>Personal Information</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Date of birth not provided"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="people-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.gender || "Gender not provided"}</Text>
      </View>
      {user?.bloodGroup && (
        <View style={styles.detailRow}>
          <Ionicons name="medical-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Blood Group: {user.bloodGroup}</Text>
        </View>
      )}
      {user?.nationality && (
        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Nationality: {user.nationality}</Text>
        </View>
      )}
      {user?.religion && (
        <View style={styles.detailRow}>
          <Ionicons name="leaf-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Religion: {user.religion}</Text>
        </View>
      )}

      {/* Professional Information */}
      <View style={styles.sectionHeader}>
        <Ionicons name="briefcase-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.sectionTitle}>Professional Information</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="id-card-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.employeeId || "Employee ID not provided"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          {user?.experience ? `${user.experience} years experience` : "Experience not provided"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          {user?.dateOfJoiningService
            ? `Joined service: ${new Date(user.dateOfJoiningService).toLocaleDateString()}`
            : "Service joining date not provided"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="school-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          {user?.dateOfJoiningPresentSchool
            ? `Joined current school: ${new Date(user.dateOfJoiningPresentSchool).toLocaleDateString()}`
            : "Current school joining date not provided"}
        </Text>
      </View>
      {user?.teacherType && (
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Teacher Type: {user.teacherType}</Text>
        </View>
      )}
      {user?.workingStatus && (
        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Status: {user.workingStatus}</Text>
        </View>
      )}

      {/* Educational Qualifications */}
      <View style={styles.sectionHeader}>
        <Ionicons name="school-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.sectionTitle}>Educational Qualifications</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="school-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          Academic: {user?.highestAcademicQualification || user?.qualification || "Not provided"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="ribbon-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>Professional: {user?.highestProfessionalQualification || "Not provided"}</Text>
      </View>
      {user?.mediumOfInstruction && (
        <View style={styles.detailRow}>
          <Ionicons name="language-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Medium of Instruction: {user.mediumOfInstruction}</Text>
        </View>
      )}

      {/* Work Details */}
      <View style={styles.sectionHeader}>
        <Ionicons name="clipboard-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.sectionTitle}>Work Details</Text>
      </View>
      {user?.classesTaught && (
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Classes Taught: {user.classesTaught}</Text>
        </View>
      )}
      {user?.periodsPerWeek && (
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Periods per Week: {user.periodsPerWeek}</Text>
        </View>
      )}
      {user?.nonTeachingDuties && (
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Non-Teaching Duties: {user.nonTeachingDutiesDetails || "Yes"}</Text>
        </View>
      )}

      {/* Training Information */}
      {(user?.inServiceTraining || user?.ictTraining || user?.flnTraining || user?.inclusiveEducationTraining) && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="library-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Training Completed</Text>
          </View>
          {user?.inServiceTraining && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.detailText}>In-Service Training</Text>
            </View>
          )}
          {user?.ictTraining && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.detailText}>ICT Training</Text>
            </View>
          )}
          {user?.flnTraining && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.detailText}>FLN Training</Text>
            </View>
          )}
          {user?.inclusiveEducationTraining && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.detailText}>Inclusive Education Training</Text>
            </View>
          )}
        </>
      )}

      {/* Subjects Section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="book-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.sectionTitle}>Subjects Taught</Text>
      </View>
      {getSubjectsTaught(user).length > 0 ? (
        <View style={styles.subjectsList}>
          {getSubjectsTaught(user).map((subject, index) => (
            <View key={subject._id || index} style={styles.subjectItem}>
              <Text style={styles.subjectName}>{subject.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: theme.colors.textSecondary, fontStyle: "italic", marginLeft: 16 }}>
          No subjects assigned
        </Text>
      )}

      {/* Address Information */}
      {(user?.address?.street || user?.address?.city || user?.address?.state) && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="home-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {[
                user.address?.street,
                user.address?.city,
                user.address?.state,
                user.address?.zipCode,
                user.address?.country,
              ]
                .filter(Boolean)
                .join(", ") || "Address not provided"}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>First Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.firstName}
          onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
          placeholder="Enter your first name"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Middle Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.middleName}
          onChangeText={(text) => setProfileData({ ...profileData, middleName: text })}
          placeholder="Enter your middle name"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.lastName}
          onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
          placeholder="Enter your last name"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profileData.phone}
          onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
          placeholder="Enter your phone number"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Qualification</Text>
        <TextInput
          style={styles.input}
          value={profileData.qualification}
          onChangeText={(text) => setProfileData({ ...profileData, qualification: text })}
          placeholder="Enter your qualification"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Years of Experience</Text>
        <TextInput
          style={styles.input}
          value={profileData.experience}
          onChangeText={(text) => setProfileData({ ...profileData, experience: text })}
          placeholder="Enter years of experience"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.editButtons}>
        <Button
          title="Cancel"
          onPress={handleCancelEdit}
          style={[styles.editButton, styles.cancelButton]}
          textStyle={styles.cancelButtonText}
        />
        <Button
          title="Save"
          onPress={handleSaveProfile}
          loading={loading}
          style={[styles.editButton, styles.saveButton]}
        />
      </View>
    </View>
  );

  const renderChangePasswordModal = () => (
    <Modal
      visible={isChangePasswordModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsChangePasswordModalVisible(false)}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setIsChangePasswordModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showCurrentPassword}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.colors.placeholder}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showNewPassword}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.colors.placeholder}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.colors.placeholder}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirement}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={passwordData.newPassword.length >= 6 ? theme.colors.success : theme.colors.textSecondary}
                />
                <Text style={styles.requirementText}>At least 6 characters long</Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={
                    passwordData.newPassword === passwordData.confirmPassword
                      ? theme.colors.success
                      : theme.colors.textSecondary
                  }
                />
                <Text style={styles.requirementText}>Passwords match</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setIsChangePasswordModalVisible(false)}
              style={[styles.modalButton, styles.cancelButton]}
              textStyle={styles.cancelButtonText}
            />
            <Button
              title="Change Password"
              onPress={handleChangePassword}
              loading={loading}
              style={[styles.modalButton, styles.saveButton]}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.lg, // Normal bottom padding
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefreshProfile}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileIcon}>
              <Ionicons name="person-outline" size={32} color={theme.colors.textLight} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{getTeacherFullName(user)}</Text>
              <Text style={styles.profileRole}>{user?.role}</Text>
            </View>
            {!isEditing && (
              <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
                <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {isEditing ? renderEditForm() : renderProfileInfo()}

          {/* Change Password Button */}
          {!isEditing && (
            <TouchableOpacity style={styles.changePasswordButton} onPress={() => setIsChangePasswordModalVisible(true)}>
              <Ionicons name="key-outline" size={20} color={theme.colors.textLight} />
              <Text style={styles.changePasswordButtonText}>Change Password</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Card>
        {renderChangePasswordModal()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  profileCard: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.h6,
    color: theme.colors.text,
  },
  profileRole: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
  },
  editIcon: {
    padding: theme.spacing.sm,
  },
  profileDetails: {
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  detailText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  editForm: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  editButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  changePasswordButtonText: {
    ...theme.typography.button,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.sm,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  logoutText: {
    ...theme.typography.button,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    height: 48,
  },
  eyeIcon: {
    padding: theme.spacing.md,
  },
  requirementsContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  requirementsTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  requirementText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  // Section Styles
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  sectionTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontWeight: "600",
  },
  subjectsList: {
    marginLeft: theme.spacing.xl,
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  subjectName: {
    ...theme.typography.body2,
    color: theme.colors.text,
    fontWeight: "500",
  },
  subjectCode: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
});
