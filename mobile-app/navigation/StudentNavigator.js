import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StudentDashboard from '../screens/student/StudentDashboard';
import TimetableScreen from '../screens/student/TimetableScreen';
import AssignmentsScreen from '../screens/student/AssignmentsScreen';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import GradesScreen from '../screens/student/GradesScreen';

const Tab = createBottomTabNavigator();

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={StudentDashboard} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Timetable" 
        component={TimetableScreen} 
        options={{ title: 'Timetable' }}
      />
      <Tab.Screen 
        name="Assignments" 
        component={AssignmentsScreen} 
        options={{ title: 'Assignments' }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ title: 'Attendance' }}
      />
      <Tab.Screen 
        name="Grades" 
        component={GradesScreen} 
        options={{ title: 'Grades' }}
      />
    </Tab.Navigator>
  );
} 