import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import theme from "../utils/theme";

// Admin Screens
import AdminDashboard from "../screens/admin/AdminDashboard";
import UserManagement from "../screens/admin/UserManagement";
import ClassManagement from "../screens/admin/ClassManagement";
import ClassDetails from "../screens/admin/ClassDetails";
import FeeManagement from "../screens/admin/FeeManagement";
import LibraryManagement from "../screens/admin/LibraryManagement";
import TransportManagement from "../screens/admin/TransportManagement";
import SalaryManagement from "../screens/admin/SalaryManagement";
import AnnouncementManagement from "../screens/admin/AnnouncementManagement";
import ReportsScreen from "../screens/admin/ReportsScreen";
import SettingsScreen from "../screens/admin/SettingsScreen";
import ProfileScreen from "../screens/admin/ProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "AdminDashboardTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "AdminUsersTab":
              iconName = focused ? "people" : "people-outline";
              break;
            case "AdminClassesTab":
              iconName = focused ? "school" : "school-outline";
              break;
            case "AdminFeesTab":
              iconName = focused ? "cash" : "cash-outline";
              break;
            case "AdminLibraryTab":
              iconName = focused ? "library" : "library-outline";
              break;
            case "AdminTransportTab":
              iconName = focused ? "bus" : "bus-outline";
              break;
            case "AdminSalaryTab":
              iconName = focused ? "wallet" : "wallet-outline";
              break;
            case "AdminAnnouncementsTab":
              iconName = focused ? "megaphone" : "megaphone-outline";
              break;
            case "AdminReportsTab":
              iconName = focused ? "stats-chart" : "stats-chart-outline";
              break;
            case "AdminSettingsTab":
              iconName = focused ? "settings" : "settings-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminDashboardTab" component={AdminDashboard} options={{ title: "Dashboard" }} />
      <Tab.Screen name="AdminUsersTab" component={UserManagement} options={{ title: "Users" }} />
      <Tab.Screen name="AdminClassesTab" component={ClassManagement} options={{ title: "Classes" }} />
      <Tab.Screen name="AdminFeesTab" component={FeeManagement} options={{ title: "Fees" }} />
      <Tab.Screen name="AdminLibraryTab" component={LibraryManagement} options={{ title: "Library" }} />
      <Tab.Screen name="AdminTransportTab" component={TransportManagement} options={{ title: "Transport" }} />
      <Tab.Screen name="AdminSalaryTab" component={SalaryManagement} options={{ title: "Salary" }} />
      <Tab.Screen
        name="AdminAnnouncementsTab"
        component={AnnouncementManagement}
        options={{ title: "Announcements" }}
      />
      <Tab.Screen name="AdminReportsTab" component={ReportsScreen} options={{ title: "Reports" }} />
      <Tab.Screen name="AdminSettingsTab" component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
};

export default function AdminNavigator() {
  const { logout } = useAuth();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.primary,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: theme.colors.textLight,
    headerTitleStyle: {
      fontWeight: "600",
      fontSize: 18,
    },
    headerRight: () => (
      <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
        <Ionicons name="log-out-outline" size={24} color={theme.colors.textLight} />
      </TouchableOpacity>
    ),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="AdminProfile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="ClassDetails" component={ClassDetails} options={{ title: "Class Details" }} />
    </Stack.Navigator>
  );
}
