import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Switch } from "react-native";
import { List, Card, Title, Divider, Button, Dialog, Portal, TextInput, IconButton } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import theme from "../../utils/theme";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen() {
  const { user, updateUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isPasswordDialogVisible, setIsPasswordDialogVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNotificationToggle = async () => {
    try {
      setNotificationsEnabled(!notificationsEnabled);
      await AsyncStorage.setItem("notificationsEnabled", (!notificationsEnabled).toString());
      showMessage({
        message: `Notifications ${!notificationsEnabled ? "enabled" : "disabled"}`,
        type: "success",
      });
    } catch (error) {
      showMessage({
        message: "Error updating notification settings",
        type: "danger",
      });
    }
  };

  const handleDarkModeToggle = async () => {
    try {
      setDarkMode(!darkMode);
      await AsyncStorage.setItem("darkMode", (!darkMode).toString());
      showMessage({
        message: `Dark mode ${!darkMode ? "enabled" : "disabled"}`,
        type: "success",
      });
    } catch (error) {
      showMessage({
        message: "Error updating theme settings",
        type: "danger",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showMessage({
        message: "Passwords do not match",
        type: "danger",
      });
      return;
    }

    try {
      // API call to change password
      await updateUser({ oldPassword, newPassword });
      setIsPasswordDialogVisible(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage({
        message: "Password updated successfully",
        type: "success",
      });
    } catch (error) {
      showMessage({
        message: "Error updating password",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Animatable.View animation="fadeIn" duration={500}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Account Settings</Title>
              <List.Item
                title="Email"
                description={user?.email}
                left={(props) => <List.Icon {...props} icon="email" />}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Role"
                description={user?.role}
                left={(props) => <List.Icon {...props} icon="account" />}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Change Password"
                left={(props) => <List.Icon {...props} icon="key" />}
                right={(props) => (
                  <IconButton {...props} icon="chevron-right" onPress={() => setIsPasswordDialogVisible(true)} />
                )}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Notifications</Title>
              <List.Item
                title="Push Notifications"
                description="Receive push notifications"
                left={(props) => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationToggle}
                    color={theme.colors.primary}
                  />
                )}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Appearance</Title>
              <List.Item
                title="Dark Mode"
                description="Enable dark theme"
                left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                right={() => (
                  <Switch value={darkMode} onValueChange={handleDarkModeToggle} color={theme.colors.primary} />
                )}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>About</Title>
              <List.Item
                title="Version"
                description="1.0.0"
                left={(props) => <List.Icon {...props} icon="information" />}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Terms of Service"
                left={(props) => <List.Icon {...props} icon="file-document" />}
                right={(props) => <IconButton {...props} icon="chevron-right" />}
              />
              <Divider style={styles.divider} />
              <List.Item
                title="Privacy Policy"
                left={(props) => <List.Icon {...props} icon="shield-account" />}
                right={(props) => <IconButton {...props} icon="chevron-right" />}
              />
            </Card.Content>
          </Card>
        </Animatable.View>
      </View>

      <Portal>
        <Dialog visible={isPasswordDialogVisible} onDismiss={() => setIsPasswordDialogVisible(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsPasswordDialogVisible(false)}>Cancel</Button>
            <Button onPress={handlePasswordChange}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    ...theme.typography.h6,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    marginVertical: theme.spacing.xs,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
});
