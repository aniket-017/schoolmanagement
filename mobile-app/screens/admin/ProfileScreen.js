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
      <View style={styles.detailRow}>
        <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.email}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.phone || "Not provided"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="school-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.qualification || "Not provided"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>
          {user?.experience ? `${user.experience} years experience` : "Experience not provided"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="id-card-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.employeeId || "Not provided"}</Text>
      </View>

      {/* Subjects Section */}
      {user?.subjects && user.subjects.length > 0 && (
        <View style={styles.subjectsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Subjects Taught</Text>
          </View>
          <View style={styles.subjectsList}>
            {user.subjects.map((subject, index) => (
              <View key={subject._id || index} style={styles.subjectItem}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                {subject.code && <Text style={styles.subjectCode}>({subject.code})</Text>}
              </View>
            ))}
          </View>
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
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Ionicons name="person-outline" size={32} color={theme.colors.textLight} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>{user?.role}</Text>
          </View>
          {!isEditing && (
            <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? renderEditForm() : renderProfileInfo()}

        <TouchableOpacity style={styles.profileActionButton} onPress={() => setIsChangePasswordModalVisible(true)}>
          <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.profileActionButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Card>

      {renderChangePasswordModal()}
    </ScrollView>
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
  profileActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
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
  // Subjects Section Styles
  subjectsSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
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
