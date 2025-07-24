import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import StudentDashboard from "../screens/student/StudentDashboard";
import AttendanceScreen from "../screens/student/AttendanceScreen";
import GradesScreen from "../screens/student/GradesScreen";
import TimetableScreen from "../screens/student/TimetableScreen";
import AnnouncementsScreen from "../screens/student/AnnouncementsScreen";
import ProfileScreen from "../screens/student/ProfileScreen";
import StudentAnnualCalendarScreen from "../screens/student/StudentAnnualCalendarScreen";

const Stack = createStackNavigator();

export default function StudentNavigator({ navigation, route }) {
  // Get the initial route name from the tab navigator
  const initialRouteName = route?.name?.replace("Tab", "") || "StudentHome";

  // Handle tab navigation
  useEffect(() => {
    if (route?.name) {
      const routeName = route.name.replace("Tab", "");
      if (routeName === "StudentAttendance") {
        navigation.navigate("StudentAttendance");
      } else if (routeName === "StudentGrades") {
        navigation.navigate("StudentGrades");
      } else if (routeName === "StudentTimetable") {
        navigation.navigate("StudentTimetable");
      } else if (routeName === "StudentAnnouncements") {
        navigation.navigate("StudentAnnouncements");
      }
    }
  }, [route?.name, navigation]);

  return (
    <Stack.Navigator
      initialRouteName="StudentDashboard"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="StudentAttendance" component={AttendanceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudentGrades" component={GradesScreen} options={{ title: "Grades" }} />
      <Stack.Screen name="StudentTimetable" component={TimetableScreen} options={{ title: "Timetable" }} />
      <Stack.Screen name="StudentAnnouncements" component={AnnouncementsScreen} options={{ title: "Announcements" }} />
      <Stack.Screen name="StudentProfile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudentAnnualCalendar" component={StudentAnnualCalendarScreen} options={{ title: "Annual Calendar" }} />
    </Stack.Navigator>
  );
}
