import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import feeService from '../services/feeService';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

const FeeOverviewScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeeInfo = async () => {
    try {
      const response = await feeService.getStudentFeeInfo(user.id);
      setFeeInfo(response.data);
    } catch (error) {
      console.error('Error fetching fee info:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeeInfo();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFeeInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Fee Summary Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Fee Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fee Structure:</Text>
          <Text style={styles.value}>
            {feeInfo?.feeSlab?.slabName || 'Regular'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.value}>
            {formatCurrency(feeInfo?.summary?.totalAmount || 0)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fees Paid:</Text>
          <Text style={[styles.value, { color: colors.success }]}>
            {formatCurrency(feeInfo?.summary?.paidAmount || 0)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Remaining:</Text>
          <Text style={[styles.value, { color: colors.error }]}>
            {formatCurrency(
              (feeInfo?.summary?.totalAmount || 0) -
                (feeInfo?.summary?.paidAmount || 0)
            )}
          </Text>
        </View>
        <View style={[styles.row, styles.statusRow]}>
          <Text style={styles.label}>Status:</Text>
          <StatusBadge status={feeInfo?.summary?.status || 'pending'} />
        </View>
      </Card>

      {/* Next Payment Card */}
      {feeInfo?.nextPayment && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Next Payment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {new Date(feeInfo.nextPayment.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>
              {formatCurrency(feeInfo.nextPayment.amount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Installment:</Text>
            <Text style={styles.value}>
              {feeInfo.nextPayment.installmentNumber || 'N/A'}
            </Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusRow: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
});

export default FeeOverviewScreen;
