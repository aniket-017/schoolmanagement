import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import {
  List,
  FAB,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Dialog,
  Portal,
  TextInput,
  SegmentedButtons,
  Chip,
  Avatar,
  IconButton,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function UserManagement({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data.data);
      filterUsers(response.data.data, searchQuery, selectedRole);
    } catch (error) {
      showMessage({
        message: "Error fetching users",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterUsers = (userList, query, role) => {
    let filtered = userList;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by role
    if (role !== "all") {
      filtered = filtered.filter((user) => user.role === role);
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterUsers(users, query, selectedRole);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    filterUsers(users, searchQuery, role);
  };

  const handleUserPress = (user) => {
    setSelectedUser(user);
    setIsDialogVisible(true);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`/api/users/${userId}/status`, {
        isActive: newStatus,
      });

      showMessage({
        message: "User status updated",
        type: "success",
      });

      fetchUsers();
    } catch (error) {
      showMessage({
        message: "Error updating user status",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const UserCard = ({ user }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card style={styles.card} onPress={() => handleUserPress(user)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={40}
              label={user.name.substring(0, 2).toUpperCase()}
              backgroundColor={theme.colors.primary}
            />
            <View style={styles.userDetails}>
              <Title style={styles.userName}>{user.name}</Title>
              <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
              <View style={styles.chips}>
                <Chip style={[styles.roleChip, { backgroundColor: theme.colors.primaryLight }]}>{user.role}</Chip>
                <Chip
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: user.isActive ? theme.colors.success + "20" : theme.colors.error + "20",
                    },
                  ]}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Chip>
                {user.role === "teacher" && (
                  <Chip
                    style={[
                      styles.passwordChip,
                      {
                        backgroundColor: user.isFirstLogin ? theme.colors.warning + "20" : theme.colors.success + "20",
                      },
                    ]}
                  >
                    {user.isFirstLogin ? "First Login" : "Password Changed"}
                  </Chip>
                )}
              </View>
              {user.role === "teacher" && user.subjects && user.subjects.length > 0 && (
                <View style={styles.subjectsContainer}>
                  <Paragraph style={styles.subjectsLabel}>Subjects:</Paragraph>
                  <View style={styles.subjectsList}>
                    {user.subjects.slice(0, 3).map((subject, index) => (
                      <Chip
                        key={subject._id || index}
                        style={[styles.subjectChip, { backgroundColor: theme.colors.info + "20" }]}
                        textStyle={{ color: theme.colors.info }}
                      >
                        {subject.name}
                      </Chip>
                    ))}
                    {user.subjects.length > 3 && (
                      <Chip
                        style={[styles.subjectChip, { backgroundColor: theme.colors.grey + "20" }]}
                        textStyle={{ color: theme.colors.grey }}
                      >
                        +{user.subjects.length - 3} more
                      </Chip>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
          <IconButton icon="chevron-right" size={24} iconColor={theme.colors.primary} />
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={selectedRole}
          onValueChange={handleRoleChange}
          buttons={[
            { value: "all", label: "All" },
            { value: "teacher", label: "Teachers" },
            { value: "student", label: "Students" },
            { value: "parent", label: "Parents" },
          ]}
          style={styles.roleFilter}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredUsers.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>User Details</Dialog.Title>
          <Dialog.Content>
            {selectedUser && (
              <>
                <Paragraph>Name: {selectedUser.name}</Paragraph>
                <Paragraph>Email: {selectedUser.email}</Paragraph>
                <Paragraph>Role: {selectedUser.role}</Paragraph>
                <Paragraph>Status: {selectedUser.isActive ? "Active" : "Inactive"}</Paragraph>
                {selectedUser.role === "teacher" && (
                  <>
                    <Paragraph>
                      Password Status: {selectedUser.isFirstLogin ? "First Login Required" : "Password Changed"}
                    </Paragraph>
                    {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                      <View style={styles.dialogSubjectsContainer}>
                        <Paragraph style={styles.dialogSubjectsLabel}>Subjects Taught:</Paragraph>
                        <View style={styles.dialogSubjectsList}>
                          {selectedUser.subjects.map((subject, index) => (
                            <Chip
                              key={subject._id || index}
                              style={[styles.dialogSubjectChip, { backgroundColor: theme.colors.info + "20" }]}
                              textStyle={{ color: theme.colors.info }}
                            >
                              {subject.name}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}
                <View style={styles.dialogActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleStatusChange(selectedUser._id, !selectedUser.isActive)}
                    style={styles.statusButton}
                  >
                    {selectedUser.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate("EditUser", {
                        userId: selectedUser._id,
                      })
                    }
                  >
                    Edit
                  </Button>
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("AddUser")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  roleFilter: {
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  userName: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  userEmail: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  chips: {
    flexDirection: "row",
    marginTop: theme.spacing.xs,
  },
  roleChip: {
    marginRight: theme.spacing.sm,
  },
  statusChip: {
    marginRight: theme.spacing.sm,
  },
  passwordChip: {
    marginRight: theme.spacing.sm,
  },
  subjectsContainer: {
    marginTop: theme.spacing.xs,
  },
  subjectsLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  subjectsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subjectChip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.lg,
  },
  statusButton: {
    marginRight: theme.spacing.md,
  },
  dialogSubjectsContainer: {
    marginTop: theme.spacing.sm,
  },
  dialogSubjectsLabel: {
    ...theme.typography.body2,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  dialogSubjectsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dialogSubjectChip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
});
