import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";

export default function TeacherDashboard({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherClasses")}>
              <Ionicons name="people" size={32} color={theme.colors.primary} />
              <Text style={styles.actionText}>Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherAttendance")}>
              <Ionicons name="calendar" size={32} color={theme.colors.primary} />
              <Text style={styles.actionText}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherGrades")}>
              <Ionicons name="school" size={32} color={theme.colors.primary} />
              <Text style={styles.actionText}>Grades</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("ChangePassword")}>
              <Ionicons name="key" size={32} color={theme.colors.primary} />
              <Text style={styles.actionText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={32} color={theme.colors.textLight} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileRole}>{user?.role}</Text>
            </View>
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{user?.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{user?.phone || "Not provided"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{user?.department || "Not provided"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  welcomeText: {
    ...theme.typography.h5,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  nameText: {
    ...theme.typography.h3,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.spacing.sm,
  },
  actionCard: {
    width: "50%",
    padding: theme.spacing.sm,
  },
  actionInner: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.md,
  },
  actionText: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  profileCard: {
    margin: theme.spacing.lg,
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
});
