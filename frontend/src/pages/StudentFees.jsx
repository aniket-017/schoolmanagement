import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  BellIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const StudentFees = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [feesData, setFeesData] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { user } = useTeacherAuth();

  useEffect(() => {
    if (user) {
      loadFeesData();
    }
  }, [user]);

  const loadFeesData = async () => {
    try {
      setLoading(true);
      const [messagesResponse, feesResponse] = await Promise.all([
        apiService.communications.getUserMessages({ type: "fee_reminder" }),
        apiService.fees.getStudentFees(user.id)
      ]);

      if (messagesResponse.success) {
        setMessages(messagesResponse.data || []);
      }

      if (feesResponse.success) {
        console.log("Fees API response:", feesResponse.data);
        setFeesData(feesResponse.data);
      }
    } catch (error) {
      console.error("Error loading messages data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (message) => {
    console.log("Message data:", message);
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
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
              <h1 className="text-2xl font-bold text-gray-900">Fees & Messages</h1>
              <p className="text-gray-600">View your fee status and messages</p>
            </div>
          </div>
        </div>



        {/* Messages Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Messages ({messages.length})
              </h3>
            </div>
          </div>

          <div className="p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
                    <p className="text-gray-500">You don't have any fee-related messages.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BellIcon className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                        <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap line-clamp-3">
                              {message.message}
                            </p>
                        
                        {/* Fee Information Display */}
                        {(message.feeAmount || message.amount || message.fee_amount || (feesData && feesData.fees && feesData.fees.length > 0)) && (
                          <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-200">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <CurrencyDollarIcon className="w-4 h-4 mr-2 text-yellow-600" />
                              Fee Details
                            </h5>
                            <div className="space-y-2">
                              {/* Show fees from feesData if available (prioritize this) */}
                              {feesData && feesData.fees && feesData.fees.length > 0 ? (
                                feesData.fees.map((fee, feeIndex) => (
                                  <div key={fee._id || feeIndex} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="text-gray-600">
                                        Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="font-medium text-gray-900">
                                        ₹{fee.amount?.toLocaleString() || "0"}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                /* Show fee from message if available (fallback) */
                                (message.feeAmount || message.amount || message.fee_amount) && (
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="text-gray-600">
                                        Due: {message.dueDate || message.due_date ? new Date(message.dueDate || message.due_date).toLocaleDateString() : "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="font-medium text-gray-900">
                                        ₹{(message.feeAmount || message.amount || message.fee_amount)?.toLocaleString() || "0"}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                              <span>From: School Administration</span>
                              <span>
                                {message.sentAt ? new Date(message.sentAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <BellIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeMessageModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Message Content */}
              <div className="space-y-6">
                {/* Full Message */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-3">Message Content</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                                {/* Fee Information */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Fee Information
                  </h4>
                  <div className="space-y-3">
                    {/* Show fee details from feesData if available (prioritize this) */}
                    {feesData && feesData.fees && feesData.fees.length > 0 ? (
                      feesData.fees.map((fee, feeIndex) => (
                        <div key={fee._id || feeIndex} className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 capitalize">
                              {fee.feeType || "Fee"} {feeIndex + 1}
                            </h5>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              fee.status === "paid" ? "bg-green-100 text-green-800" :
                              fee.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              fee.status === "overdue" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {fee.status || "pending"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                Amount: ₹{fee.amount?.toLocaleString() || "0"}
                              </span>
                            </div>
                            {fee.paidAmount > 0 && (
                              <div className="flex items-center space-x-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">
                                  Paid: ₹{fee.paidAmount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {fee.remarks && (
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">Remarks:</span> {fee.remarks}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Show fee details from message if available (fallback) */
                      (selectedMessage.feeAmount || selectedMessage.amount || selectedMessage.fee_amount) ? (
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 capitalize">
                              {selectedMessage.feeType || selectedMessage.fee_type || "Tuition"} Fee
                            </h5>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                Due: {selectedMessage.dueDate || selectedMessage.due_date ? new Date(selectedMessage.dueDate || selectedMessage.due_date).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                Amount: ₹{(selectedMessage.feeAmount || selectedMessage.amount || selectedMessage.fee_amount)?.toLocaleString() || "0"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Show message if no fee data available */
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-gray-500 text-sm">No specific fee details available for this message.</p>
                          <p className="text-gray-400 text-xs mt-1">Fee information will be available for new messages sent by admin.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Message Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Message Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">School Administration</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium">
                        {selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Message ID:</span>
                      <span className="font-medium">{selectedMessage._id || "N/A"}</span>
                    </div>
                  </div>
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