import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TeacherDashboard from "../screens/teacher/TeacherDashboard";
import ClassesScreen from "../screens/teacher/ClassesScreen";
import AttendanceManagement from "../screens/teacher/AttendanceManagement";
import GradeManagement from "../screens/teacher/GradeManagement";

const Tab = createBottomTabNavigator();

export default function TeacherNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tab.Screen name="Dashboard" component={TeacherDashboard} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Classes" component={ClassesScreen} options={{ title: "My Classes" }} />
      <Tab.Screen name="Attendance" component={AttendanceManagement} options={{ title: "Attendance" }} />
      <Tab.Screen name="Grades" component={GradeManagement} options={{ title: "Grades" }} />
    </Tab.Navigator>
  );
}
