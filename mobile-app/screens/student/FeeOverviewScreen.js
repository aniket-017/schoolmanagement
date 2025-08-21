import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import theme from '../../utils/theme';

const FeeOverviewScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const fetchFeeInfo = async () => {
    try {
      setLoading(true);
      
      // Fetch fee information from API
      const feeResponse = await apiService.fees.getStudentFeeInfo(user.id);
      
      // Fetch payment history from API
      const paymentResponse = await apiService.fees.getStudentPaymentHistory(user.id, { limit: 50 });
      
      // Fetch admin messages from communication API
      const messagesResponse = await apiService.messages.getUserMessages({ 
        messageType: 'fee_reminder',
        limit: 50 
      });
      
      if (feeResponse.success && paymentResponse.success) {
        const feeData = feeResponse.data;
        const paymentData = paymentResponse.data;
        const messagesData = messagesResponse?.data || [];
        
        // Calculate remaining amount if not provided
        const totalAmount = feeData.feeSlab?.totalAmount || 0;
        const paidAmount = paymentData.summary?.totalAmount || 0;
        const remainingAmount = totalAmount - paidAmount;
        
        setFeeInfo({
          feeSlab: feeData.feeSlab || { 
            slabName: 'N/A',
            totalAmount: totalAmount
          },
          summary: {
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            remainingAmount: Math.max(0, remainingAmount), // Ensure non-negative
            status: remainingAmount > 0 ? 'pending' : 'paid'
          },
          installments: feeData.installments || [],
          adminMessages: messagesData || [],
          paymentHistory: paymentData.paymentHistory || [],
          paymentSummary: paymentData.summary || {
            totalPayments: 0,
            totalAmount: paidAmount,
            averageAmount: 0
          }
        });
      } else {
        // Set empty data if API calls fail
        setFeeInfo({
          feeSlab: { slabName: 'N/A', totalAmount: 0 },
          summary: { totalAmount: 0, paidAmount: 0, remainingAmount: 0, status: 'pending' },
          installments: [],
          adminMessages: [],
          paymentHistory: [],
          paymentSummary: { totalPayments: 0, totalAmount: 0, averageAmount: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching fee info:', error);
      // Set empty data on error
      setFeeInfo({
        feeSlab: { slabName: 'N/A', totalAmount: 0 },
        summary: { totalAmount: 0, paidAmount: 0, remainingAmount: 0, status: 'pending' },
        installments: [],
        adminMessages: [],
        paymentHistory: [],
        paymentSummary: { totalPayments: 0, totalAmount: 0, averageAmount: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeeInfo();
    setRefreshing(false);
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await apiService.messages.markAsRead(messageId);
      // Refresh the fee info to update the message status
      await fetchFeeInfo();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    // Mark message as read when opened
    if (message._id && !message.isRead) {
      markMessageAsRead(message._id);
    }
  };

  useEffect(() => {
    fetchFeeInfo();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return theme.colors.success;
      case 'overdue':
        return theme.colors.error;
      case 'partial':
        return theme.colors.warning;
      case 'pending':
      default:
        return theme.colors.grey;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
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
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Fee Status Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Fee Status</Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.feeStatusRow}>
            <View style={styles.feeStatusItem}>
              <Ionicons name="card" size={24} color={theme.colors.primary} />
              <Text style={styles.feeStatusLabel}>Total Amount</Text>
              <Text style={styles.feeStatusAmount}>
                {formatCurrency(feeInfo?.summary?.totalAmount || 0)}
              </Text>
            </View>
            
            <View style={styles.feeStatusItem}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.feeStatusLabel}>Paid Amount</Text>
              <Text style={styles.feeStatusAmount}>
                {formatCurrency(feeInfo?.summary?.paidAmount || 0)}
              </Text>
            </View>
            
            <View style={styles.feeStatusItem}>
              <Ionicons name="time" size={24} color={theme.colors.warning} />
              <Text style={styles.feeStatusLabel}>Remaining Amount</Text>
              <Text style={styles.feeStatusAmount}>
                {formatCurrency(feeInfo?.summary?.remainingAmount || 0)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Payment History Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Payment History</Text>
            <View style={styles.cardHeaderActions}>
              <TouchableOpacity style={styles.refreshButton}>
                <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('PaymentHistory')}
              >
                <Text style={styles.viewAllButtonText}>View All</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Payment Summary Section */}
          {feeInfo?.paymentSummary && (
            <View style={styles.paymentSummarySection}>
              <View style={styles.paymentSummaryRow}>
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Total Payments:</Text>
                  <Text style={styles.paymentSummaryValue}>
                    {feeInfo.paymentSummary.totalPayments || 0}
                  </Text>
                </View>
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Total Amount Paid:</Text>
                  <Text style={[styles.paymentSummaryValue, { color: theme.colors.success }]}>
                    {formatCurrency(feeInfo.paymentSummary.totalAmount || 0)}
                  </Text>
                </View>
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Average Payment:</Text>
                  <Text style={[styles.paymentSummaryValue, { color: theme.colors.info }]}>
                    {formatCurrency(feeInfo.paymentSummary.averageAmount || 0)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment History List */}
          {feeInfo?.paymentHistory?.length > 0 ? (
            <>
              {feeInfo.paymentHistory.slice(0, 3).map((payment, index) => (
                <View key={index} style={styles.paymentHistoryItem}>
                  <View style={styles.paymentHistoryHeader}>
                    <View style={styles.paymentHistoryLeft}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                      <Text style={styles.paymentHistoryAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={styles.paymentHistoryMethod}>
                        {payment.method}
                      </Text>
                    </View>
                    <View style={styles.paymentHistoryRight}>
                      <Text style={styles.paymentHistoryDate}>
                        {payment.date}
                      </Text>
                      <Text style={styles.paymentHistoryTime}>
                        {formatTime(payment.paymentDate)}
                      </Text>
                      <Text style={styles.paymentHistoryDetails}>
                        {payment.feeType} Installment {payment.installmentNumber} AY {payment.academicYear}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {feeInfo.paymentHistory.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => navigation.navigate('PaymentHistory')}
                >
                  <Text style={styles.viewMoreButtonText}>
                    View {feeInfo.paymentHistory.length - 3} more payments
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No payment history yet.</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('PaymentHistory')}
              >
                <Text style={styles.viewAllButtonText}>View Payment History</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Messages from Admin Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Messages from Admin</Text>
              {feeInfo?.adminMessages?.length > 0 && (
                <Text style={styles.messageCount}>
                  {feeInfo.adminMessages.length} message{feeInfo.adminMessages.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {feeInfo?.adminMessages && Array.isArray(feeInfo.adminMessages) && feeInfo.adminMessages.length > 0 ? (
            feeInfo.adminMessages.map((message, index) => (
              <TouchableOpacity
                key={message._id || message.id || `message-${index}`}
                style={[styles.adminMessage, !message.isRead && styles.unreadMessage]}
                onPress={() => openMessageModal(message)}
              >
                <View style={styles.messagePreview}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messagePreviewTitle}>
                      {message.subject || 'Fee Reminder'}
                    </Text>
                    {!message.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.messagePreviewSubtitle}>
                    {message.sentAt ? `Received: ${new Date(message.sentAt).toLocaleDateString()}` : 'Tap to view details'}
                  </Text>
                  {message.priority && (
                    <View style={[styles.messagePriorityBadge, { backgroundColor: getPriorityColor(message.priority) + '20' }]}>
                      <Text style={[styles.messagePriorityText, { color: getPriorityColor(message.priority) }]}>
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)} Priority
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No messages from admin yet.</Text>
              <Text style={styles.emptyStateSubtext}>
                You'll receive fee reminders and important updates here when available.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Fee Slab Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Fee Slab Details</Text>
          <View style={styles.feeSlabRow}>
            <Text style={styles.feeSlabLabel}>Fee Structure:</Text>
            <Text style={styles.feeSlabValue}>{feeInfo?.feeSlab?.slabName}</Text>
          </View>
          <View style={styles.feeSlabRow}>
            <Text style={styles.feeSlabLabel}>Total Amount:</Text>
            <Text style={styles.feeSlabAmount}>
              {formatCurrency(feeInfo?.feeSlab?.totalAmount || 0)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Installment Schedule */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Installment Schedule</Text>
          
          {feeInfo?.installments?.map((installment, index) => (
            <View key={installment.number || `installment-${index}`} style={styles.installmentItem}>
              <View style={styles.installmentHeader}>
                <View style={styles.installmentNumber}>
                  <Text style={styles.installmentNumberText}>{installment.number}</Text>
                </View>
                <View style={styles.installmentInfo}>
                  <Text style={styles.installmentDueDate}>Due: {installment.dueDate}</Text>
                  <Text style={styles.installmentTitle}>
                    Installment {installment.number} 
                    {installment.status === 'paid' ? ` Paid: ${formatCurrency(installment.paidAmount)}` : ''}
                  </Text>
                </View>
                <View style={styles.installmentAmount}>
                  <Text style={styles.installmentAmountText}>
                    {formatCurrency(installment.amount)}
                  </Text>
                  <Text style={[
                    styles.installmentStatus,
                    { color: getStatusColor(installment.status) }
                  ]}>
                    {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Add bottom padding to ensure last card is fully visible */}
      <View style={styles.bottomPadding} />

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedMessage && (
              <>
                {/* Message from Admin Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Message from Admin</Text>
                  <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                {/* Timestamp */}
                <Text style={styles.modalTimestamp}>
                  {selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleString() : 'No date'}
                </Text>
                
                {/* Subject Row */}
                <View style={styles.modalSubjectRow}>
                  <Text style={styles.modalSubjectLabel}>Subject</Text>
                  <Text style={styles.modalSubjectText}>{selectedMessage.subject}</Text>
                </View>
                
                {/* Priority Badge */}
                {selectedMessage.priority && (
                  <View style={[styles.modalPriorityBadge, { backgroundColor: getPriorityColor(selectedMessage.priority) }]}>
                    <Text style={styles.modalPriorityText}>{selectedMessage.priority} Priority</Text>
                  </View>
                )}
                
                {/* Message Body */}
                <Text style={styles.modalMessageBody}>
                  {selectedMessage.message}
                </Text>
                
                {/* Fee Information Section - Only show if fee-related data exists */}
                {(selectedMessage.feeAmount || selectedMessage.remainingAmount || selectedMessage.feeType) && (
                  <View style={styles.modalFeeInfoSection}>
                    <Text style={styles.modalFeeInfoTitle}>Fee Information</Text>
                    
                    {selectedMessage.feeAmount && (
                      <View style={styles.modalFeeInfoRow}>
                        <Text style={styles.modalFeeInfoLabel}>Fee Amount:</Text>
                        <Text style={styles.modalFeeInfoValue}>₹{selectedMessage.feeAmount.toLocaleString()}</Text>
                      </View>
                    )}
                    
                    {selectedMessage.remainingAmount && (
                      <View style={styles.modalFeeInfoRow}>
                        <Text style={styles.modalFeeInfoLabel}>Remaining Amount:</Text>
                        <Text style={styles.modalFeeInfoValueRed}>₹{selectedMessage.remainingAmount.toLocaleString()}</Text>
                      </View>
                    )}
                    
                    {selectedMessage.feeType && (
                      <View style={styles.modalFeeInfoRow}>
                        <Text style={styles.modalFeeInfoLabel}>Fee Type:</Text>
                        <Text style={styles.modalFeeInfoValue}>{selectedMessage.feeType}</Text>
                      </View>
                    )}
                    
                    {selectedMessage.dueDate && (
                      <View style={styles.modalFeeInfoRow}>
                        <Text style={styles.modalFeeInfoLabel}>Due Date:</Text>
                        <Text style={styles.modalFeeInfoValue}>{new Date(selectedMessage.dueDate).toLocaleDateString()}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Sent by Section */}
                <View style={styles.modalSentBySection}>
                  <Text style={styles.modalSentByText}>
                    Sent by {selectedMessage.senderId?.name || 'School Administrator'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    paddingBottom: 0,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    ...theme.typography.h6,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 0,
  },
  messageCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 16,
    gap: 4,
  },
  viewAllButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: 4,
  },
  viewMoreButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  feeStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  feeStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  feeStatusLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  feeStatusAmount: {
    ...theme.typography.h6,
    fontWeight: "bold",
    color: "#212121",
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    padding: theme.spacing.md,
  },
  emptyStateText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  emptyStateSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  adminMessage: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  messagePreview: {
    paddingVertical: theme.spacing.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  messagePreviewTitle: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: '#212121',
  },
  messagePreviewSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  messageTitle: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  messageLabels: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  messageLabel: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  messageLabelText: {
    ...theme.typography.caption,
    color: 'white',
    fontWeight: '600',
  },
  messageContent: {
    ...theme.typography.body2,
    color: '#555',
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  messageDate: {
    ...theme.typography.caption,
    color: '#888',
    marginBottom: theme.spacing.sm,
  },
  messageFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.sm,
  },
  messageFooterText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  messagePriorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  messagePriorityText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  feeSlabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  feeSlabLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  feeSlabValue: {
    ...theme.typography.body2,
    fontWeight: 'bold',
    color: '#212121',
  },
  feeSlabAmount: {
    ...theme.typography.h6,
    fontWeight: 'bold',
    color: '#212121',
  },
  installmentItem: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  installmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  installmentNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  installmentNumberText: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  installmentInfo: {
    flex: 1,
  },
  installmentDueDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  installmentTitle: {
    ...theme.typography.subtitle2,
    fontWeight: '500',
    color: '#212121',
  },
  installmentAmount: {
    alignItems: 'flex-end',
  },
  installmentAmountText: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  installmentStatus: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  // Payment Summary Styles
  paymentSummarySection: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentSummaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  paymentSummaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  paymentSummaryValue: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 16,
  },

  // Payment History Styles
  paymentHistoryItem: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentHistoryLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
    alignItems: 'flex-start',
  },
  paymentHistoryRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  paymentHistoryAmount: {
    ...theme.typography.h6,
    fontWeight: "bold",
    color: theme.colors.success,
    marginBottom: 6,
    marginTop: 4,
    fontSize: 20,
  },
  paymentHistoryMethod: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  paymentHistoryDate: {
    ...theme.typography.subtitle2,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  paymentHistoryTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  paymentHistoryDetails: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    maxWidth: 120,
    lineHeight: 16,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 100,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalHeaderTitle: {
    ...theme.typography.h6,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalTimestamp: {
    ...theme.typography.caption,
    color: '#888',
    textAlign: 'right',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  modalSubjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  modalSubjectLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  modalSubjectText: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalPriorityBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 5,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  modalPriorityText: {
    ...theme.typography.caption,
    color: 'white',
    fontWeight: '600',
  },
  modalMessageBody: {
    ...theme.typography.body1,
    color: '#555',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  modalFeeInfoSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.md,
  },
  modalFeeInfoTitle: {
    ...theme.typography.subtitle2,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: theme.spacing.sm,
  },
  modalFeeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  modalFeeInfoLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  modalFeeInfoValue: {
    ...theme.typography.body2,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalFeeInfoValueRed: {
    ...theme.typography.body2,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  modalSentBySection: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  modalSentByText: {
    ...theme.typography.body2,
    color: '#555',
    textAlign: 'center',
  },
});

export default FeeOverviewScreen; 