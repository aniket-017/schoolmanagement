import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TeacherDashboard from "../screens/teacher/TeacherDashboard";
import ClassesScreen from "../screens/teacher/ClassesScreen";
import AttendanceManagement from "../screens/teacher/AttendanceManagement";
import GradeManagement from "../screens/teacher/GradeManagement";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TeacherTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "TeacherDashboardTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "TeacherClassesTab":
              iconName = focused ? "people" : "people-outline";
              break;
            case "TeacherAttendanceTab":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "TeacherGradesTab":
              iconName = focused ? "school" : "school-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TeacherDashboardTab" component={TeacherDashboard} options={{ title: "Dashboard" }} />
      <Tab.Screen name="TeacherClassesTab" component={ClassesScreen} options={{ title: "Classes" }} />
      <Tab.Screen name="TeacherAttendanceTab" component={AttendanceManagement} options={{ title: "Attendance" }} />
      <Tab.Screen name="TeacherGradesTab" component={GradeManagement} options={{ title: "Grades" }} />
    </Tab.Navigator>
  );
};

export default function TeacherNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
