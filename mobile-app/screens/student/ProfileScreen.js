import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile editing state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
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
    if (!profileData.name.trim()) {
      Alert.alert("Error", "Name is required");
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
      name: user?.name || "",
      phone: user?.phone || "",
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
      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.mobileNumber || user?.phone || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.nationality || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="heart-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.bloodGroup || "Not provided"}</Text>
        </View>
      </View>

      {/* Academic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <View style={styles.detailRow}>
          <Ionicons name="id-card-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.studentId || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="document-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.admissionNumber || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {user?.class ? `${user.class.name} - ${user.class.section}` : "No Class Assigned"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="library-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.grade || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.academicYear || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="trophy-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.attendancePercentage ? `${user.attendancePercentage}%` : "Not available"}</Text>
        </View>
      </View>

      {/* Address Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.address || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.city || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="map-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.state || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.pinCode || "Not provided"}</Text>
        </View>
      </View>

      {/* Parent Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parent Information</Text>
        <View style={styles.detailRow}>
          <Ionicons name="woman-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.mother?.name || "Not provided"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.mother?.phone || "Not provided"}</Text>
        </View>
        {user?.father?.name && (
          <View style={styles.detailRow}>
            <Ionicons name="man-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user.father.name}</Text>
          </View>
        )}
        {user?.father?.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user.father.phone}</Text>
          </View>
        )}
        {user?.guardian?.name && (
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user.guardian.name} ({user.guardian.relation})</Text>
          </View>
        )}
      </View>

      {/* Fee Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fee Information</Text>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.feeStructure ? user.feeStructure.charAt(0).toUpperCase() + user.feeStructure.slice(1) : "Regular"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="percent-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.feeDiscount ? `${user.feeDiscount}% discount` : "No discount"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.paymentStatus ? user.paymentStatus.charAt(0).toUpperCase() + user.paymentStatus.slice(1) : "Pending"}</Text>
        </View>
      </View>

      {/* Additional Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        {user?.rfidCardNumber && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>RFID: {user.rfidCardNumber}</Text>
          </View>
        )}
        {user?.libraryCardNumber && (
          <View style={styles.detailRow}>
            <Ionicons name="library-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>Library Card: {user.libraryCardNumber}</Text>
          </View>
        )}
        {user?.transportDetails?.required && (
          <View style={styles.detailRow}>
            <Ionicons name="bus-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>Transport: {user.transportDetails.busNumber || "Assigned"}</Text>
          </View>
        )}
        {user?.hostelInformation?.roomNumber && (
          <View style={styles.detailRow}>
            <Ionicons name="home-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>Hostel: Room {user.hostelInformation.roomNumber}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active"}</Text>
        </View>
      </View>

      {/* Medical Information Section */}
      {user?.medicalHistory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          {user.medicalHistory.allergies && user.medicalHistory.allergies.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="warning-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Allergies: {user.medicalHistory.allergies.join(", ")}</Text>
            </View>
          )}
          {user.medicalHistory.medicalConditions && user.medicalHistory.medicalConditions.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="medical-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Conditions: {user.medicalHistory.medicalConditions.join(", ")}</Text>
            </View>
          )}
          {user.medicalHistory.vaccinationStatus && (
            <View style={styles.detailRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Vaccination: {user.medicalHistory.vaccinationStatus.charAt(0).toUpperCase() + user.medicalHistory.vaccinationStatus.slice(1)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Emergency Contact Section */}
      {user?.emergencyContact && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user.emergencyContact.name} ({user.emergencyContact.relation})</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user.emergencyContact.phone}</Text>
          </View>
          {user.emergencyContact.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{user.emergencyContact.email}</Text>
            </View>
          )}
        </View>
      )}

      {/* Physical Metrics Section */}
      {user?.physicalMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Information</Text>
          {user.physicalMetrics.height && (
            <View style={styles.detailRow}>
              <Ionicons name="resize-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Height: {user.physicalMetrics.height} cm</Text>
            </View>
          )}
          {user.physicalMetrics.weight && (
            <View style={styles.detailRow}>
              <Ionicons name="scale-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Weight: {user.physicalMetrics.weight} kg</Text>
            </View>
          )}
          {user.physicalMetrics.bmi && (
            <View style={styles.detailRow}>
              <Ionicons name="analytics-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>BMI: {user.physicalMetrics.bmi}</Text>
            </View>
          )}
          {user.physicalMetrics.fitnessScore && (
            <View style={styles.detailRow}>
              <Ionicons name="fitness-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Fitness Score: {user.physicalMetrics.fitnessScore}/100</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.name}
          onChangeText={(text) => setProfileData({ ...profileData, name: text })}
          placeholder="Enter your full name"
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
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={20}
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
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
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
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "Student"}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            {!isEditing && (
              <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                <Ionicons name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? renderEditForm() : renderProfileInfo()}
        </Card>

        {/* Action Buttons Card */}
        <Card style={styles.actionCard}>
          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={() => setIsChangePasswordModalVisible(true)}
          >
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.profileActionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {renderChangePasswordModal()}
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
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl * 2,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.h5,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  profileEmail: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  profileDetails: {
    gap: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  detailText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  editForm: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body2,
    color: theme.colors.text,
  },
  inputWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: theme.spacing.md,
    top: theme.spacing.sm,
  },
  editButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  actionCard: {
    marginBottom: theme.spacing.lg,
  },
  profileActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  profileActionButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
  },
  logoutText: {
    ...theme.typography.button,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
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
    fontWeight: "bold",
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalFooter: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  modalButton: {
    flex: 1,
  },
}); 