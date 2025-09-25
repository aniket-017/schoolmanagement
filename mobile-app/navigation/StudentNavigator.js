import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import StudentDashboard from "../screens/student/StudentDashboard";
import AttendanceScreen from "../screens/student/AttendanceScreen";
import GradesScreen from "../screens/student/GradesScreen";
import TimetableScreen from "../screens/student/TimetableScreen";
import AnnouncementsScreen from "../screens/student/AnnouncementsScreen";
import ProfileScreen from "../screens/student/ProfileScreen";
import StudentAnnualCalendarScreen from "../screens/student/StudentAnnualCalendarScreen";
import StudentHomeworkScreen from "../screens/student/StudentHomeworkScreen";
import ExamsScreen from "../screens/student/ExamsScreen";
import FeeOverviewScreen from "../screens/student/FeeOverviewScreen";
import PaymentHistoryScreen from "../screens/student/PaymentHistoryScreen";

const Stack = createStackNavigator();

export default function StudentNavigator({ navigation, route }) {
  const stackNavigation = useNavigation();

  // Get the initial route name from the tab navigator with robust error handling
  const initialRouteName = (() => {
    try {
      if (route?.name && typeof route.name === 'string' && route.name.includes('Tab')) {
        const routeName = route.name.replace("Tab", "");
        // Map tab routes to actual screen names
        const routeMapping = {
          'StudentHome': 'StudentDashboard',
          'StudentAttendance': 'StudentAttendance',
          'StudentFees': 'FeeOverview',
          'StudentTimetable': 'StudentTimetable'
        };
        return routeMapping[routeName] || 'StudentDashboard';
      }
      return "StudentDashboard";
    } catch (error) {
      console.log("Error processing route name:", error);
      return "StudentDashboard";
    }
  })();

  // Handle tab switching by resetting the stack to the correct screen
  useEffect(() => {
    if (route?.name && route.name !== "StudentHome") {
      const targetScreen = (() => {
        if (route.name.includes('Tab')) {
          const routeName = route.name.replace("Tab", "");
          const routeMapping = {
            'StudentHome': 'StudentDashboard',
            'StudentAttendance': 'StudentAttendance',
            'StudentFees': 'FeeOverview',
            'StudentTimetable': 'StudentTimetable'
          };
          return routeMapping[routeName];
        }
        return null;
      })();

      if (targetScreen && navigation) {
        // Reset the stack to the target screen when tab is switched
        navigation.reset({
          index: 0,
          routes: [{ name: targetScreen }],
        });
      }
    }
  }, [route?.name, navigation]);

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
      <Stack.Screen name="StudentAttendance" component={AttendanceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudentGrades" component={GradesScreen} options={{ title: "Grades" }} />
      <Stack.Screen name="StudentTimetable" component={TimetableScreen} options={{ title: "Timetable" }} />
      <Stack.Screen name="StudentAnnouncements" component={AnnouncementsScreen} options={{ title: "Announcements" }} />
      <Stack.Screen name="StudentProfile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudentAnnualCalendar" component={StudentAnnualCalendarScreen} options={{ title: "Annual Calendar" }} />
      <Stack.Screen name="StudentHomework" component={StudentHomeworkScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudentExams" component={ExamsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FeeOverview" component={FeeOverviewScreen} options={{ title: "Fee Overview" }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: "Payment History" }} />
    </Stack.Navigator>
  );
}
