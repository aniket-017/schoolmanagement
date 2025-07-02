import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function TeacherDashboard({ navigation }) {
  const { user, logout } = useAuth();

  const dashboardCards = [
    { title: "Total Classes", value: "5", color: "#4CAF50" },
    { title: "Total Students", value: "127", color: "#2196F3" },
    { title: "Pending Grades", value: "23", color: "#FF9800" },
    { title: "Today's Classes", value: "3", color: "#9C27B0" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || "Teacher"}</Text>
        <Text style={styles.userRole}>Department: {user?.department || "N/A"}</Text>
      </View>

      <View style={styles.cardsContainer}>
        {dashboardCards.map((card, index) => (
          <View key={index} style={[styles.card, { borderLeftColor: card.color }]}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Classes")}>
          <Text style={styles.actionButtonText}>Manage Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Attendance")}>
          <Text style={styles.actionButtonText}>Take Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Grades")}>
          <Text style={styles.actionButtonText}>Grade Management</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingBottom: 30,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  userRole: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
  },
  cardsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "center",
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
