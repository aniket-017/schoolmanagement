import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import theme from '../../utils/theme';

const PaymentHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch real-time payment history from API
      const response = await apiService.fees.getStudentPaymentHistory(user.id, { limit: 50 });
      
      if (response.success) {
        setPaymentHistory(response.data?.paymentHistory || []);
        setPaymentSummary(response.data?.summary || null);
      } else {
        // Handle API response failure
        console.error('API response failed:', response);
        setPaymentHistory([]);
        setPaymentSummary(null);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Set empty data on error
      setPaymentHistory([]);
      setPaymentSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'cash-outline';
      case 'card':
        return 'card-outline';
      case 'online':
        return 'globe-outline';
      case 'bank_transfer':
        return 'business-outline';
      case 'cheque':
        return 'document-text-outline';
      default:
        return 'card-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
      >
        {/* Payment Summary Cards */}
        {paymentSummary && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.summaryCards}>
              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryCardContent}>
                  <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.summaryLabel}>Total Payments</Text>
                  <Text style={styles.summaryValue}>{paymentSummary.totalPayments || 0}</Text>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryCardContent}>
                  <Ionicons name="trending-up-outline" size={24} color={theme.colors.success} />
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                    {formatCurrency(paymentSummary.totalAmount)}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.summaryCard}>
                <Card.Content style={styles.summaryCardContent}>
                  <Ionicons name="calculator-outline" size={24} color={theme.colors.info} />
                  <Text style={styles.summaryLabel}>Average</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                    {formatCurrency(paymentSummary.averageAmount)}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </View>
        )}

        {/* Payment History List */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Payment Records</Text>
            <Text style={styles.paymentCount}>
              {paymentHistory.length} payments
            </Text>
          </View>
          
          {paymentHistory.length > 0 ? (
            paymentHistory.map((payment, index) => (
              <View key={index} style={styles.paymentCardWrapper}>
                <Card style={styles.paymentCard}>
                  <Card.Content style={styles.paymentCardContent}>
                    {/* Payment Header */}
                    <View style={styles.paymentHeader}>
                      <View style={styles.paymentAmountContainer}>
                        <Text style={styles.paymentAmount}>
                          {formatCurrency(payment.amount)}
                        </Text>
                        {payment.paymentMethod && (
                          <View style={styles.paymentMethodContainer}>
                            <Ionicons 
                              name={getPaymentMethodIcon(payment.paymentMethod)} 
                              size={16} 
                              color={theme.colors.textSecondary} 
                            />
                            <Text style={styles.paymentMethod}>
                              {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.paymentDateContainer}>
                        <Text style={styles.paymentDate}>{formatDate(payment.paymentDate)}</Text>
                        <Text style={styles.paymentTime}>{formatTime(payment.paymentDate)}</Text>
                      </View>
                    </View>

                    {/* Payment Details */}
                    <View style={styles.paymentDetails}>
                      {payment.feeType && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Fee Type:</Text>
                          <Text style={styles.detailValue}>
                            {payment.feeType.charAt(0).toUpperCase() + payment.feeType.slice(1)}
                          </Text>
                        </View>
                      )}

                      {payment.installmentNumber && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Installment:</Text>
                          <Text style={styles.detailValue}>#{payment.installmentNumber}</Text>
                        </View>
                      )}

                      {payment.academicYear && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Academic Year:</Text>
                          <Text style={styles.detailValue}>{payment.academicYear}</Text>
                        </View>
                      )}

                      {payment.transactionId && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Transaction ID:</Text>
                          <Text style={styles.detailValue}>{payment.transactionId}</Text>
                        </View>
                      )}

                      {payment.receiptNumber && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Receipt:</Text>
                          <Text style={styles.detailValue}>{payment.receiptNumber}</Text>
                        </View>
                      )}

                      {payment.remarks && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Remarks:</Text>
                          <Text style={styles.detailValue}>{payment.remarks}</Text>
                        </View>
                      )}
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                        <Text style={[styles.statusText, { color: theme.colors.success }]}>
                          Completed
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyCardContent}>
                <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Payment History</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't made any payments yet. Your payment history will appear here once you start making payments.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
  },
  summaryContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 0,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  summaryCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 4,
  },
  historyContainer: {
    marginTop: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  paymentCardWrapper: {
    marginBottom: 16,
  },
  paymentCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  paymentCardContent: {
    padding: 20,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  paymentAmountContainer: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  paymentMethod: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  paymentDateContainer: {
    alignItems: 'flex-end',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  paymentDate: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  paymentTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  paymentDetails: {
    marginBottom: 20,
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider + '50',
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    marginTop: 32,
    elevation: 2,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  bottomPadding: {
    height: 100,
  },
});

export default PaymentHistoryScreen;
