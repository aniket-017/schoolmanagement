import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StudentNavigator from "./StudentNavigator";
import TeacherNavigator from "./TeacherNavigator";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useAuth();

  if (user?.role === "student" || user?.role === "parent") {
    return <StudentNavigator />;
  }

  if (user?.role === "teacher") {
    return <TeacherNavigator />;
  }

  return null;
}
