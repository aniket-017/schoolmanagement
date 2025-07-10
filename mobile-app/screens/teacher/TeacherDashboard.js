import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import Card from "../../components/ui/Card";

// Dummy Data
const scheduleData = [
  { time: "10:00 AM", subject: "Grade 9 - Math", location: "Room 101" },
  { time: "11:00 AM", subject: "Grade 10 - History", location: "Room 203" },
  { time: "01:00 PM", subject: "Grade 9 - Science", location: "Lab A" },
];

const notificationData = [
  { id: 1, text: "New announcement from Administration." },
  { id: 2, text: "You have 3 assignments to grade for English." },
  { id: 3, text: "Parent-teacher meeting scheduled for tomorrow." },
];

export default function TeacherDashboard({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#3b5998']}
        style={[styles.header, { paddingTop: insets.top + theme.spacing.lg }]}
      >
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate("TeacherProfile")}>
          <Ionicons name="person-outline" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
      >
        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Card style={styles.infoCard}>
            {scheduleData.map((item, index) => (
              <View
                key={index}
                style={[styles.scheduleItem, index === scheduleData.length - 1 && styles.lastItem]}
              >
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <View>
                  <Text style={styles.scheduleSubject}>{item.subject}</Text>
                  <Text style={styles.scheduleLocation}>{item.location}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <Card style={styles.infoCard}>
            {notificationData.map((item, index) => (
              <View
                key={item.id}
                style={[styles.notificationItem, index === notificationData.length - 1 && styles.lastItem]}
              >
                <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.notificationText}>{item.text}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherClasses")}>
              <View style={styles.actionInner}>
                <Ionicons name="people" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Classes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherAttendance")}>
              <View style={styles.actionInner}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Attendance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("TeacherGrades")}>
              <View style={styles.actionInner}>
                <Ionicons name="school" size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Grades</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
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
    fontWeight: "bold",
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: "bold",
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
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
    height: 120,
  },
  actionText: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  infoCard: {
    padding: 0,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  scheduleTime: {
    ...theme.typography.subtitle1,
    color: theme.colors.primary,
    width: 90,
  },
  scheduleSubject: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
  },
  scheduleLocation: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  notificationText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});
