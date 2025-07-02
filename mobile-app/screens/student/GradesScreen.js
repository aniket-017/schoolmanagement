import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function GradesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grades</Text>
      <Text style={styles.subtitle}>Your grades and marks will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
