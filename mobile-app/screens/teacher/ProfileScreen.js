import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';
import Card from '../../components/ui/Card';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Ionicons name="person-outline" size={32} color={theme.colors.textLight} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>{user?.role}</Text>
          </View>
        </View>
        <View style={styles.profileDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user?.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user?.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{user?.department || 'Not provided'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileActionButton} onPress={handleChangePassword}>
          <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.profileActionButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  profileCard: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.h6,
    color: theme.colors.text,
  },
  profileRole: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  profileDetails: {
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  detailText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  profileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  profileActionButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  logoutText: {
    ...theme.typography.button,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
}); 