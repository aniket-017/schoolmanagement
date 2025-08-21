import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const StudentFees = () => {
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { user } = useTeacherAuth();

  // No helper functions needed; backend returns summary with adjusted totals

  useEffect(() => {
    if (user) {
      loadFeesData();
      loadMessages();
      loadPaymentHistory();
    }
  }, [user]);

  // Auto-refresh fees data every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshFeesData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadFeesData = async () => {
    try {
      setLoading(true);
      const feesResponse = await apiService.fees.getStudentFeeInfo(user.id);

      if (feesResponse.success) {
        setFeesData(feesResponse.data);
      }
    } catch (error) {
      console.error("Error loading fees data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const messagesResponse = await apiService.messages.getUserMessages({
        messageType: "fee_reminder",
        limit: 50,
      });

      if (messagesResponse.success) {
        setMessages(messagesResponse.data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiService.fees.getStudentPaymentHistory(user.id, { limit: 50 });
      if (res.success) {
        setPaymentHistory(res.data?.paymentHistory || []);
        setPaymentSummary(res.data?.summary || null);
      }
    } catch (error) {
      console.error("Error loading payment history:", error);
      // Show user-friendly error message
      if (error.message.includes("500")) {
        console.error("Server error - backend may be down or database connection issue");
      } else if (error.message.includes("404")) {
        console.error("Student not found");
      } else if (error.message.includes("403")) {
        console.error("Access denied");
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // Refresh fees data
  const refreshFeesData = async () => {
    try {
      const feesResponse = await apiService.fees.getStudentFeeInfo(user.id);
      if (feesResponse.success) {
        setFeesData(feesResponse.data);
      }
    } catch (error) {
      console.error("Error refreshing fees data:", error);
    }
  };

  const handleFeeClick = (fee) => {
    setSelectedFee(fee);
    setShowFeeModal(true);
  };

  const closeFeeModal = () => {
    setShowFeeModal(false);
    setSelectedFee(null);
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    // Mark message as read if it's not already read
    if (!message.isRead) {
      try {
        await apiService.messages.markAsRead(message._id);
        // Update the message in the local state
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === message._id ? { ...msg, isRead: true } : msg))
        );
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case "overdue":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case "partial":
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "partial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      case "partial":
        return "Partial";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/student/dashboard"
              className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
              <p className="text-gray-600">View your fee status and details</p>
            </div>
          </div>
        </div>

        {/* Fee Overview Section */}
        {feesData && feesData.summary && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Fee Status
              </h2>
              <button
                onClick={refreshFeesData}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh fee data"
              >
                Refresh
              </button>
            </div>

            {/* Concession Notice */}
            {feesData.student?.concessionAmount > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Concession Applied: ₹{feesData.student.concessionAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">Your fee amounts below reflect the applied concession.</p>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {(() => {
                const summary = feesData.summary || {};
                const totalAmount = summary.adjustedTotalAmount ?? summary.totalAmount ?? 0;
                const paidAmount = summary.paidAmount ?? 0;
                const pendingAmount =
                  summary.adjustedPendingAmount ?? summary.pendingAmount ?? Math.max(0, totalAmount - paidAmount);

                return (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
                          {feesData.summary?.concessionAmount > 0 && (
                            <p className="text-xs text-green-600">
                              (₹{feesData.summary.concessionAmount.toLocaleString()} concession applied)
                            </p>
                          )}
                        </div>
                        <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Remaining Amount</p>
                          <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-yellow-600" />
                      </div>
                    </motion.div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Payment History
            </h2>
            <button
              onClick={loadPaymentHistory}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh payment history"
            >
              Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : paymentHistory.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {paymentSummary && (
                <div className="px-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded border bg-gray-50">
                      <p className="text-sm text-gray-600">Total Payments</p>
                      <p className="text-lg font-semibold text-gray-900">{paymentSummary.totalPayments}</p>
                    </div>
                    <div className="p-3 rounded border bg-gray-50">
                      <p className="text-sm text-gray-600">Total Amount Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{(paymentSummary.totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded border bg-gray-50">
                      <p className="text-sm text-gray-600">Average Payment</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ₹{(paymentSummary.averageAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="divide-y">
                {paymentHistory.map((pmt, idx) => (
                  <div key={idx} className="p-6 flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">₹{(pmt.amount || 0).toLocaleString()}</h4>
                          {pmt.paymentMethod && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                              {pmt.paymentMethod}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {pmt.feeType && <span className="capitalize">{pmt.feeType}</span>}
                          {pmt.installmentNumber && <span className="ml-2">Installment {pmt.installmentNumber}</span>}
                          {pmt.academicYear && <span className="ml-2">AY {pmt.academicYear}</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {pmt.transactionId && <span>Txn: {pmt.transactionId}</span>}
                          {pmt.receiptNumber && <span className="ml-2">Receipt: {pmt.receiptNumber}</span>}
                        </div>
                        {pmt.remarks && <p className="text-xs text-gray-600 mt-2">{pmt.remarks}</p>}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleDateString() : ""}</div>
                      <div>{pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleTimeString() : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-600">No payment history yet.</div>
            </div>
          )}
        </div>

        {/* Messages from Admin Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Messages from Admin
            </h2>
            <button
              onClick={loadMessages}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh messages"
            >
              Refresh
            </button>
          </div>

          {loadingMessages ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        message.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                      }`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{message.subject}</h4>
                            {!message.isRead && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                New
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                message.priority === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : message.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : message.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {message.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                          {message.feeAmount && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Fee Amount:</span> ₹{message.feeAmount.toLocaleString()}
                              {message.remainingAmount && (
                                <span className="ml-2">
                                  <span className="font-medium">Remaining:</span> ₹
                                  {message.remainingAmount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{new Date(message.sentAt).toLocaleDateString()}</div>
                          <div>{new Date(message.sentAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
                <p className="text-gray-600">You don't have any fee reminder messages from admin yet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee Slab Details Section */}
        {feesData && feesData.feeSlab && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Fee Slab Details
              </h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">{feesData.feeSlab.slabName || "Fee Slab"}</h3>
                  <p className="text-sm text-gray-600">
                    Total Amount: ₹
                    {(feesData.summary?.adjustedTotalAmount ?? feesData.summary?.totalAmount ?? 0).toLocaleString()}
                    {feesData.summary?.concessionAmount > 0 && (
                      <span className="text-green-600 ml-2">
                        (Original: ₹{(feesData.summary.totalAmount || 0).toLocaleString()})
                      </span>
                    )}
                  </p>
                  {feesData.summary?.concessionAmount > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Concession Applied: ₹{feesData.summary.concessionAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {feesData.feeSlab.installments && feesData.feeSlab.installments.length > 0 && (
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Installment Schedule</h4>
                  {feesData.summary?.concessionAmount > 0 && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">
                        ✓ Installment amounts below are adjusted for your ₹
                        {feesData.summary.concessionAmount.toLocaleString()} concession
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {feesData.installments?.map((installment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          installment.status === "paid"
                            ? "bg-green-50 border-green-200"
                            : installment.status === "partial"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{installment.installmentNumber}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Installment {installment.installmentNumber}</h4>
                              <p className="text-sm text-gray-600">
                                Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString() : "N/A"}
                              </p>
                              {installment.description && (
                                <p className="text-xs text-gray-500">{installment.description}</p>
                              )}
                              {installment.discountAmount > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Discount: ₹{installment.discountAmount.toLocaleString()}
                                  {installment.originalAmount && (
                                    <span className="text-gray-400 line-through ml-1">
                                      (was ₹{installment.originalAmount.toLocaleString()})
                                    </span>
                                  )}
                                </p>
                              )}
                              {installment.paidAmount > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Paid: ₹{installment.paidAmount.toLocaleString()}
                                  {installment.remainingAmount > 0 && (
                                    <span className="text-gray-500 ml-1">
                                      (Remaining: ₹{installment.remainingAmount.toLocaleString()})
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{installment.amount?.toLocaleString() || "0"}</p>
                            <p className="text-xs text-gray-500">
                              {installment.percentage ? `${installment.percentage}% of total` : "N/A"}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                installment.status === "paid"
                                  ? "text-green-600"
                                  : installment.status === "partial"
                                  ? "text-yellow-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {installment.status?.charAt(0).toUpperCase() + installment.status?.slice(1) || "Pending"}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fee Detail Modal */}
      {showFeeModal && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {selectedFee.feeType || "Fee"} Details
                    </h3>
                    <p className="text-sm text-gray-500">Fee ID: {selectedFee._id}</p>
                  </div>
                </div>
                <button onClick={closeFeeModal} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Fee Content */}
              <div className="space-y-6">
                {/* Status and Amount */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Payment Status</h4>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                        selectedFee.status
                      )}`}
                    >
                      {getStatusText(selectedFee.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">₹{selectedFee.amount?.toLocaleString() || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paid Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{selectedFee.paidAmount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    {selectedFee.discount > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Discount</p>
                        <p className="text-xl font-bold text-blue-600">₹{selectedFee.discount.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-xl font-bold text-yellow-600">
                        ₹
                        {(
                          (selectedFee.amount || 0) -
                          (selectedFee.paidAmount || 0) -
                          (selectedFee.discount || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fee Details */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Fee Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Type:</span>
                      <span className="font-medium capitalize">{selectedFee.feeType || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">
                        {selectedFee.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Academic Year:</span>
                      <span className="font-medium">{selectedFee.academicYear || "N/A"}</span>
                    </div>
                    {selectedFee.installmentNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Installment:</span>
                        <span className="font-medium">{selectedFee.installmentNumber}</span>
                      </div>
                    )}
                    {selectedFee.semester && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Semester:</span>
                        <span className="font-medium">{selectedFee.semester}</span>
                      </div>
                    )}
                    {selectedFee.month && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Month:</span>
                        <span className="font-medium">{selectedFee.month}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                {selectedFee.paidAmount > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-4">Payment Information</h4>
                    <div className="space-y-3">
                      {selectedFee.paidDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid Date:</span>
                          <span className="font-medium">{new Date(selectedFee.paidDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedFee.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium capitalize">{selectedFee.paymentMethod}</span>
                        </div>
                      )}
                      {selectedFee.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium">{selectedFee.transactionId}</span>
                        </div>
                      )}
                      {selectedFee.receiptNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Receipt Number:</span>
                          <span className="font-medium">{selectedFee.receiptNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {selectedFee.remarks && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-2">Remarks</h4>
                    <p className="text-gray-700">{selectedFee.remarks}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeFeeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Message from Admin</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.sentAt).toLocaleDateString()} at{" "}
                      {new Date(selectedMessage.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button onClick={closeMessageModal} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Message Content */}
              <div className="space-y-6">
                {/* Subject and Priority */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Subject</h4>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedMessage.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : selectedMessage.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : selectedMessage.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedMessage.priority} Priority
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{selectedMessage.subject}</p>
                </div>

                {/* Message Body */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Message</h4>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Fee Information */}
                {(selectedMessage.feeAmount || selectedMessage.remainingAmount) && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-4">Fee Information</h4>
                    <div className="space-y-3">
                      {selectedMessage.feeAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Fee Amount:</span>
                          <span className="font-medium">₹{selectedMessage.feeAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedMessage.remainingAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining Amount:</span>
                          <span className="font-medium text-red-600">
                            ₹{selectedMessage.remainingAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedMessage.feeType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fee Type:</span>
                          <span className="font-medium capitalize">{selectedMessage.feeType}</span>
                        </div>
                      )}
                      {selectedMessage.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">{new Date(selectedMessage.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sender Information */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2">Sent by</h4>
                  <p className="text-gray-700">{selectedMessage.senderId?.name || "School Administration"}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeMessageModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;
