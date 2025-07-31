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
  const { user } = useTeacherAuth();

  useEffect(() => {
    if (user) {
      loadFeesData();
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
      const feesResponse = await apiService.fees.getStudentFees(user.id);

      if (feesResponse.success) {
        console.log("Fees API response:", feesResponse.data);
        setFeesData(feesResponse.data);
      }
    } catch (error) {
      console.error("Error loading fees data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh fees data
  const refreshFeesData = async () => {
    try {
      const feesResponse = await apiService.fees.getStudentFees(user.id);
      if (feesResponse.success) {
        console.log("Refreshed fees data:", feesResponse.data);
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
        {feesData && feesData.statistics && (
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
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{feesData.statistics.totalAmount?.toLocaleString() || "0"}
                    </p>
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
                    <p className="text-2xl font-bold text-green-600">
                      ₹{feesData.statistics.paidAmount?.toLocaleString() || "0"}
                    </p>
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
                    <p className="text-2xl font-bold text-yellow-600">
                      ₹{feesData.statistics.pendingAmount?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                </div>
              </motion.div>
            </div>
          </div>
        )}

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
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feesData.feeSlab.slabName || "Fee Slab"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Total Amount: ₹{feesData.feeSlab.totalAmount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              {feesData.feeSlab.installments && feesData.feeSlab.installments.length > 0 && (
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Installment Schedule</h4>
                  <div className="space-y-4">
                    {feesData.feeSlab.installments.map((installment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Installment {index + 1}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString() : "N/A"}
                              </p>
                              {installment.description && (
                                <p className="text-xs text-gray-500">
                                  {installment.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ₹{installment.amount?.toLocaleString() || "0"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {installment.percentage}% of total
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
                    <p className="text-sm text-gray-500">
                      Fee ID: {selectedFee._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeFeeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Fee Content */}
              <div className="space-y-6">
                {/* Status and Amount */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Payment Status</h4>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedFee.status)}`}>
                      {getStatusText(selectedFee.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{selectedFee.amount?.toLocaleString() || "0"}
                      </p>
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
                        <p className="text-xl font-bold text-blue-600">
                          ₹{selectedFee.discount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-xl font-bold text-yellow-600">
                        ₹{((selectedFee.amount || 0) - (selectedFee.paidAmount || 0) - (selectedFee.discount || 0)).toLocaleString()}
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
                          <span className="font-medium">
                            {new Date(selectedFee.paidDate).toLocaleDateString()}
                          </span>
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
    </div>
  );
};

export default StudentFees; 