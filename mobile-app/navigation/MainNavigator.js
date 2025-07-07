import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "../screens/student/StudentDashboard";
import AssignmentsScreen from "../screens/student/AssignmentsScreen";
import AttendanceScreen from "../screens/student/AttendanceScreen";
import GradesScreen from "../screens/student/GradesScreen";
import TimetableScreen from "../screens/student/TimetableScreen";
import TeacherNavigator from "./TeacherNavigator";
import AdminNavigator from "./AdminNavigator";
import theme from "../utils/theme";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useAuth();

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
          component={StudentDashboard}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="calendar" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Assignments"
          component={AssignmentsScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name="document-text" focused={focused} color={color} badge={user?.pendingAssignments || null} />
            ),
          }}
        />
        <Tab.Screen
          name="Grades"
          component={GradesScreen}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="trophy" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Timetable"
          component={TimetableScreen}
          options={{
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
          component={TeacherNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Classes"
          component={TeacherNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="school" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Attendance"
          component={TeacherNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="checkmark-done" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="Assignments"
          component={TeacherNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="document-text" focused={focused} color={color} />,
          }}
        />
        <Tab.Screen
          name="More"
          component={TeacherNavigator}
          options={{
            tabBarIcon: ({ focused, color }) => <TabIcon name="ellipsis-horizontal" focused={focused} color={color} />,
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
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    height: 70,
    ...theme.shadows.md,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabBarItem: {
    paddingTop: theme.spacing.xs,
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
