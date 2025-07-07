import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import StudentDashboard from "../screens/student/StudentDashboard";
import AssignmentsScreen from "../screens/student/AssignmentsScreen";
import AttendanceScreen from "../screens/student/AttendanceScreen";
import GradesScreen from "../screens/student/GradesScreen";
import TimetableScreen from "../screens/student/TimetableScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "StudentDashboardTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "StudentAssignmentsTab":
              iconName = focused ? "book" : "book-outline";
              break;
            case "StudentAttendanceTab":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "StudentGradesTab":
              iconName = focused ? "school" : "school-outline";
              break;
            case "StudentTimetableTab":
              iconName = focused ? "time" : "time-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="StudentDashboardTab" component={StudentDashboard} options={{ title: "Dashboard" }} />
      <Tab.Screen name="StudentAssignmentsTab" component={AssignmentsScreen} options={{ title: "Assignments" }} />
      <Tab.Screen name="StudentAttendanceTab" component={AttendanceScreen} options={{ title: "Attendance" }} />
      <Tab.Screen name="StudentGradesTab" component={GradesScreen} options={{ title: "Grades" }} />
      <Tab.Screen name="StudentTimetableTab" component={TimetableScreen} options={{ title: "Timetable" }} />
    </Tab.Navigator>
  );
};

export default function StudentNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
