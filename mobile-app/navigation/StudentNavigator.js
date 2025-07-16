import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import StudentDashboard from "../screens/student/StudentDashboard";
import AttendanceScreen from "../screens/student/AttendanceScreen";
import GradesScreen from "../screens/student/GradesScreen";
import TimetableScreen from "../screens/student/TimetableScreen";
import ProfileScreen from "../screens/student/ProfileScreen";

const Stack = createStackNavigator();

export default function StudentNavigator({ navigation, route }) {
  // Get the initial route name from the tab navigator
  const initialRouteName = route?.name?.replace("Tab", "") || "StudentHome";

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="StudentAttendance" component={AttendanceScreen} options={{ title: "Attendance" }} />
      <Stack.Screen name="StudentGrades" component={GradesScreen} options={{ title: "Grades" }} />
      <Stack.Screen name="StudentTimetable" component={TimetableScreen} options={{ title: "Timetable" }} />
      <Stack.Screen name="StudentProfile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
