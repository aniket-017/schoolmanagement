import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return {
        bg: '#dcfce7',
        text: '#166534',
      };
    case 'overdue':
      return {
        bg: '#fee2e2',
        text: '#991b1b',
      };
    case 'partial':
      return {
        bg: '#fef9c3',
        text: '#854d0e',
      };
    case 'pending':
    default:
      return {
        bg: '#f3f4f6',
        text: '#374151',
      };
  }
};

export const StatusBadge = ({ status }) => {
  const colors = getStatusColor(status);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
