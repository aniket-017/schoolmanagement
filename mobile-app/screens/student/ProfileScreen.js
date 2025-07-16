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
        <Text style={styles.detailText}>
          {user?.class_id ? `${user.class_id.name} - ${user.class_id.section}` : "No Class Assigned"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="id-card-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailText}>{user?.studentId || "Not provided"}</Text>
      </View>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        <Card style={styles.actionCard}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setIsChangePasswordModalVisible(true)}
          >
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
            <Text style={[styles.actionText, { color: theme.colors.danger }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
    gap: theme.spacing.md,
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
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  actionText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
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