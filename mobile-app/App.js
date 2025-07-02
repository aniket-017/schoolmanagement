import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthContext";
import AuthNavigator from "./navigation/AuthNavigator";
import MainNavigator from "./navigation/MainNavigator";
import { useAuth } from "./context/AuthContext";

const Stack = createStackNavigator();

function AppContent() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
