import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import TeacherDashboard from "../screens/teacher/TeacherDashboard";
import ClassesScreen from "../screens/teacher/ClassesScreen";
import AttendanceManagement from "../screens/teacher/AttendanceManagement";
import GradeManagement from "../screens/teacher/GradeManagement";
import ChangePassword from "../screens/teacher/ChangePassword";

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
      <Stack.Screen name="TeacherHome" component={TeacherDashboard} options={{ title: "Dashboard" }} />
      <Stack.Screen name="TeacherClasses" component={ClassesScreen} options={{ title: "Classes" }} />
      <Stack.Screen name="TeacherAttendance" component={AttendanceManagement} options={{ title: "Attendance" }} />
      <Stack.Screen name="TeacherGrades" component={GradeManagement} options={{ title: "Grades" }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: "Change Password" }} />
    </Stack.Navigator>
  );
}
