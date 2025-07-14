import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TeacherDashboard from "../screens/teacher/TeacherDashboard";
import ClassesScreen from "../screens/teacher/ClassesScreen";
import ClassDetails from "../screens/teacher/ClassDetails";
import AttendanceManagement from "../screens/teacher/AttendanceManagement";
import GradeManagement from "../screens/teacher/GradeManagement";
import ProfileScreen from "../screens/teacher/ProfileScreen";

const Stack = createStackNavigator();

export default function TeacherNavigator({ navigation, route }) {
  // Get the initial route name from the tab navigator
  const initialRouteName = route?.name?.replace("Tab", "") || "TeacherHome";

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
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="TeacherClasses" component={ClassesScreen} options={{ title: "Classes" }} />
      <Stack.Screen name="TeacherClassDetails" component={ClassDetails} options={{ title: "Class Details" }} />
      <Stack.Screen name="TeacherAttendance" component={AttendanceManagement} options={{ title: "Attendance" }} />
      <Stack.Screen name="TeacherGrades" component={GradeManagement} options={{ title: "Grades" }} />
      <Stack.Screen name="TeacherProfile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Stack.Navigator>
  );
}
