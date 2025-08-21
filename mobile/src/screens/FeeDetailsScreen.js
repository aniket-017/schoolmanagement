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

const FeeDetailsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [feeDetails, setFeeDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [feeResponse, historyResponse] = await Promise.all([
        feeService.getStudentFees(user.id),
        feeService.getPaymentHistory(user.id),
      ]);
      setFeeDetails(feeResponse.data);
      setPaymentHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching fee details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
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
      {/* Installments Section */}
      <Text style={styles.sectionTitle}>Installments</Text>
      {feeDetails?.installments?.map((installment, index) => (
        <Card key={index} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Installment {installment.installmentNumber}</Text>
            <StatusBadge status={installment.status} />
          </View>
          <View style={styles.row}>
            <Text style={styles.sublabel}>Amount:</Text>
            <Text style={styles.value}>{formatCurrency(installment.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.sublabel}>Due Date:</Text>
            <Text style={styles.value}>
              {new Date(installment.dueDate).toLocaleDateString()}
            </Text>
          </View>
          {installment.paidAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.sublabel}>Paid:</Text>
              <Text style={[styles.value, { color: colors.success }]}>
                {formatCurrency(installment.paidAmount)}
              </Text>
            </View>
          )}
        </Card>
      ))}

      {/* Payment History Section */}
      <Text style={styles.sectionTitle}>Payment History</Text>
      {paymentHistory.map((payment, index) => (
        <Card key={index} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt #{payment.receiptNumber}</Text>
            <Text style={styles.date}>
              {new Date(payment.paidDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.sublabel}>Amount Paid:</Text>
            <Text style={[styles.value, { color: colors.success }]}>
              {formatCurrency(payment.paidAmount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.sublabel}>Payment Method:</Text>
            <Text style={styles.value}>
              {payment.paymentMethod.charAt(0).toUpperCase() +
                payment.paymentMethod.slice(1)}
            </Text>
          </View>
          {payment.transactionId && (
            <View style={styles.row}>
              <Text style={styles.sublabel}>Transaction ID:</Text>
              <Text style={styles.value}>{payment.transactionId}</Text>
            </View>
          )}
        </Card>
      ))}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});
