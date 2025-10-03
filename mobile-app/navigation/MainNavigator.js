import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import StudentNavigator from "./StudentNavigator";
import TeacherDashboard from "../screens/teacher/TeacherDashboard";
import ClassesScreen from "../screens/teacher/ClassesScreen";
import AttendanceManagement from "../screens/teacher/AttendanceManagement";
import GradeManagement from "../screens/teacher/GradeManagement";
import AdminNavigator from "./AdminNavigator";
import theme from "../utils/theme";
import TeacherNavigator from "./TeacherNavigator";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Custom tab bar icon component
  const TabIcon = ({ name, focused, color, badge }) => (
    <View style={styles.tabIconContainer}>
      <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );


  // Student Navigation
  if (user?.role === "student") {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Set to false since StudentNavigator handles headers
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 8 : 20),
              height: Platform.OS === "android" ? 60 + Math.max(insets.bottom, 8) : 50 + Math.max(insets.bottom, 20),
            }
          ],
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tab.Screen
          name="StudentHome"
          component={StudentNavigator}
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="StudentAttendanceTab"
          component={StudentNavigator}
          options={{
            title: "Attendance",
            tabBarIcon: ({ focused, color }) => <TabIcon name="calendar" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="StudentFeesTab"
          component={StudentNavigator}
          options={{
            title: "Fees",
            tabBarIcon: ({ focused, color }) => <TabIcon name="card" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="StudentTimetableTab"
          component={StudentNavigator}
          options={{
            title: "Timetable",
            tabBarIcon: ({ focused, color }) => <TabIcon name="time" focused={focused} color={color} />,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Teacher Navigation
  if (user?.role === "teacher") {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Set to false since TeacherNavigator handles headers
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 8 : 20),
              height: Platform.OS === "android" ? 60 + Math.max(insets.bottom, 8) : 50 + Math.max(insets.bottom, 20),
            }
          ],
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tab.Screen
          name="TeacherHome"
          component={TeacherNavigator}
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="TeacherClassesTab"
          component={TeacherNavigator}
          options={{
            title: "Classes",
            tabBarIcon: ({ focused, color }) => <TabIcon name="school" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="TeacherAttendanceTab"
          component={TeacherNavigator}
          options={{
            title: "Attendance",
            tabBarIcon: ({ focused, color }) => <TabIcon name="checkmark-done" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="TeacherGradesTab"
          component={TeacherNavigator}
          options={{
            title: "Grades",
            tabBarIcon: ({ focused, color }) => <TabIcon name="trophy" focused={focused} color={color} />,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Admin/Principal Navigation
  if (user?.role === "admin" || user?.role === "principal") {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={AdminNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="analytics" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Users"
          component={AdminNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="people" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Classes"
          component={AdminNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="library" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Reports"
          component={AdminNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="bar-chart" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="More"
          component={AdminNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="settings" focused={focused} color={color} />,
          }}
        />
      </Tab.Navigator>
    );
  }

  // Default fallback
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="warning" size={48} color={theme.colors.warning} />
      <Text style={styles.errorText}>Role not supported: {user?.role || "Unknown"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingBottom: Platform.OS === "android" ? 8 : 20,
    height: Platform.OS === "android" ? 65 : 85,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  tabBarItem: {
    paddingTop: 8,
  },
  tabIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.textLight,
    fontSize: 10,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  errorText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
