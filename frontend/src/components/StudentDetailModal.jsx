import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Edit,
  Trash2,
  X,
  Users,
  BookOpen,
  Award,
  Shield,
  Heart,
  FileText,
  DollarSign,
  UserCheck,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import appConfig from "../config/environment";
import apiService from "../services/apiService";

const StudentDetailModal = ({ student, isOpen, onClose, onEdit, onRefresh }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [calculatedInstallments, setCalculatedInstallments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    statistics: {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      attendancePercentage: 0,
    },
    attendance: [],
  });
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Calculate installments with concession when component mounts or student changes
  useEffect(() => {
    if (student?.feeSlabId?._id && student?.concessionAmount > 0) {
      calculateInstallments(student.feeSlabId._id, student.concessionAmount);
    } else {
      setCalculatedInstallments([]);
    }
  }, [student]);

  // Fetch student attendance data when modal opens with a student
  useEffect(() => {
    if (isOpen && student?._id) {
      fetchStudentAttendance(student._id);
    }
  }, [isOpen, student]);

  // Function to fetch student attendance data
  const fetchStudentAttendance = async (studentId) => {
    try {
      setLoadingAttendance(true);
      // Get attendance for current academic year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const response = await apiService.attendance.getStudentAttendance(studentId, {
        startDate,
        endDate,
      });

      if (response.success && response.data) {
        setAttendanceData(response.data);
      }
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      // Don't show toast to avoid disrupting user experience for a non-critical feature
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Calculate installments with concession
  const calculateInstallments = async (slabId, concessionAmount) => {
    if (!slabId || !concessionAmount || concessionAmount <= 0) {
      setCalculatedInstallments([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs/${slabId}/calculate-concession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ concessionAmount: parseFloat(concessionAmount) }),
      });
      const data = await response.json();
      if (data.success) {
        setCalculatedInstallments(data.data.installments);
      }
    } catch (error) {
      console.error("Error calculating concession:", error);
    }
  };

  if (!student) return null;

  const getStudentName = () => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName}`.trim();
    }
    return student.name || "N/A";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "graduated":
        return "bg-blue-100 text-blue-800";
      case "transferred":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/students/${student._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Student deleted successfully");
        onClose();
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || "Error deleting student");
      }
    } catch (error) {
      toast.error("Error deleting student");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {getStudentName().charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getStudentName()}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    student.status
                  )}`}
                >
                  {student.status || "active"}
                </span>
                {student.studentId && <span className="text-sm text-gray-500">ID: {student.studentId}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit && onEdit(student)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{getStudentName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium capitalize">{student.gender || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roll Number:</span>
                    <span className="font-medium">{student.rollNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blood Group:</span>
                    <span className="font-medium">{student.bloodGroup || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nationality:</span>
                    <span className="font-medium">{student.nationality || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{student.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mobile Number:</span>
                    <span className="font-medium">{student.mobileNumber || student.phone || "N/A"}</span>
                  </div>
                  {student.optionalMobileNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Optional Mobile Number:</span>
                      <span className="font-medium">{student.optionalMobileNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right max-w-xs">
                      {student.currentAddress || student.address?.street || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Parent Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mother's Name:</span>
                    <span className="font-medium">{student.mothersName || student.mother?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent's Mobile:</span>
                    <span className="font-medium">N/A</span>
                  </div>
                  {student.father?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Father's Name:</span>
                      <span className="font-medium">{student.father.name}</span>
                    </div>
                  )}
                  {student.father?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Father's Phone:</span>
                      <span className="font-medium">{student.father.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Academic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Academic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-medium">{student.studentId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-medium">{student.grade || student.currentGrade || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Academic Year:</span>
                    <span className="font-medium">{student.academicYear || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission Date:</span>
                    <span className="font-medium">
                      {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    {loadingAttendance ? (
                      <span className="text-gray-600 flex items-center">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full text-sm ${
                          parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 90
                            ? "bg-green-100 text-green-800"
                            : parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {attendanceData.statistics?.attendancePercentage || "0"}%
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee Category:</span>
                    <span className="font-medium capitalize">{student.feeCategory || "regular"}</span>
                  </div>
                  {student.feeDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Discount:</span>
                      <span className="font-medium">{student.feeDiscount}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Attendance Details
                </h3>

                {loadingAttendance ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading attendance data...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Attendance gauge */}
                    <div className="flex justify-center py-2">
                      <div className="relative w-48 h-48">
                        {/* Circular background */}
                        <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                        {/* Progress arc - we'll create a circle with colored border based on percentage */}
                        <div
                          className="absolute inset-0 rounded-full border-8 border-transparent"
                          style={{
                            borderTopColor:
                              parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 90
                                ? "#10b981" // Green for excellent
                                : parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 75
                                ? "#f59e0b" // Yellow for good
                                : "#ef4444", // Red for poor
                            borderRightColor:
                              parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 50
                                ? parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 90
                                  ? "#10b981"
                                  : "#f59e0b"
                                : "transparent",
                            borderBottomColor:
                              parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 75
                                ? "#10b981"
                                : "transparent",
                            borderLeftColor:
                              parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 25
                                ? parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 75
                                  ? "#10b981"
                                  : "#f59e0b"
                                : "#ef4444",
                            transform: "rotate(45deg)",
                          }}
                        ></div>

                        {/* Percentage display in the middle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">
                              {attendanceData.statistics?.attendancePercentage || "0"}%
                            </div>
                            <div className="text-sm text-gray-600">Attendance</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance status */}
                    <div className="mt-4 flex justify-center">
                      <div
                        className={`text-center px-4 py-2 rounded-lg font-medium ${
                          parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 90
                            ? "bg-green-100 text-green-800"
                            : parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 90
                          ? "Excellent Attendance"
                          : parseFloat(attendanceData.statistics?.attendancePercentage || 0) >= 75
                          ? "Good Attendance"
                          : "Needs Improvement"}
                      </div>
                    </div>

                    {/* Attendance statistics */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Present Days</div>
                        <div className="text-lg font-semibold text-green-600">
                          {attendanceData.statistics?.presentDays || 0} days
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Absent Days</div>
                        <div className="text-lg font-semibold text-red-600">
                          {attendanceData.statistics?.absentDays || 0} days
                        </div>
                      </div>
                    </div>

                    {/* Additional Attendance Statistics */}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Late Days</div>
                        <div className="text-lg font-semibold text-orange-600">
                          {attendanceData.statistics?.lateDays || 0} days
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Total School Days</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {attendanceData.statistics?.totalDays || 0} days
                        </div>
                      </div>
                    </div>

                    {/* Recent attendance records */}
                    {attendanceData.attendance && attendanceData.attendance.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-md font-medium mb-3">Recent Attendance Records</h4>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >
                                  Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {attendanceData.attendance.slice(0, 5).map((record, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        record.status === "present"
                                          ? "bg-green-100 text-green-800"
                                          : record.status === "late"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Note about attendance */}
                    <div className="text-sm text-gray-500 mt-4 text-center">
                      Attendance calculated for the current academic year
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Slab Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Fee Slab Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee Structure:</span>
                    <span className="font-medium capitalize">{student.feeStructure || "regular"}</span>
                  </div>
                  {student.feeSlabId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Slab:</span>
                      <span className="font-medium">{student.feeSlabId?.slabName || "N/A"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                        student.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : student.paymentStatus === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.paymentStatus || "pending"}
                    </span>
                  </div>
                  {student.concessionAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Concession Amount:</span>
                      <span className="font-medium">₹{student.concessionAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {student.lateFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Late Fees:</span>
                      <span className="font-medium text-red-600">₹{student.lateFees.toLocaleString()}</span>
                    </div>
                  )}
                  {student.scholarshipDetails && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scholarship Details:</span>
                      <span className="font-medium text-right max-w-xs">{student.scholarshipDetails}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fees Paid:</span>
                    <span className="font-medium">₹{student.feesPaid?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Amount:</span>
                    <span className="font-medium">
                      ₹{((student.feeSlabId?.totalAmount || 0) - (student.feesPaid || 0)).toLocaleString()}
                    </span>
                  </div>
                  {student.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">{new Date(student.paymentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {student.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{student.paymentMethod.replace("_", " ")}</span>
                    </div>
                  )}
                  {student.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{student.transactionId}</span>
                    </div>
                  )}
                </div>

                {/* Installment Details */}
                {student.feeSlabId && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Installment Structure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(calculatedInstallments.length > 0
                        ? calculatedInstallments
                        : student.feeSlabId.installments || []
                      ).map((installment, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium text-sm">
                            Installment {installment.installmentNumber || index + 1}
                          </div>
                          <div className="text-lg font-bold text-green-600">₹{installment.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            {installment.percentage
                              ? `${installment.percentage}%`
                              : `${((installment.amount / (student.feeSlabId.totalAmount || 1)) * 100).toFixed(1)}%`}
                          </div>
                          <div className="text-xs text-gray-600">
                            Due: {new Date(installment.dueDate).toLocaleDateString()}
                          </div>
                          {installment.discountAmount && (
                            <div className="text-xs text-blue-600">
                              Saved: ₹{installment.discountAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Transport Information */}
              {student.transportDetails?.required && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    Transport Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transport Required:</span>
                      <span className="font-medium">Yes</span>
                    </div>
                    {student.transportDetails?.route && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium">{student.transportDetails.route.routeName || "N/A"}</span>
                      </div>
                    )}
                    {student.transportDetails?.pickupPoint && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pickup Point:</span>
                        <span className="font-medium">{student.transportDetails.pickupPoint}</span>
                      </div>
                    )}
                    {student.transportDetails?.dropPoint && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drop Point:</span>
                        <span className="font-medium">{student.transportDetails.dropPoint}</span>
                      </div>
                    )}
                    {student.transportDetails?.busNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bus Number:</span>
                        <span className="font-medium">{student.transportDetails.busNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              {student.medicalInfo && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    {student.medicalInfo.allergies && student.medicalInfo.allergies.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-1">Allergies:</span>
                        <div className="flex flex-wrap gap-1">
                          {student.medicalInfo.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {student.medicalInfo.medicalConditions && student.medicalInfo.medicalConditions.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-1">Medical Conditions:</span>
                        <div className="flex flex-wrap gap-1">
                          {student.medicalInfo.medicalConditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {student.medicalInfo.emergencyInstructions && (
                      <div>
                        <span className="text-gray-600 block mb-1">Emergency Instructions:</span>
                        <span className="text-sm">{student.medicalInfo.emergencyInstructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              {student.documents && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Documents
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(student.documents).map(
                      ([key, value]) =>
                        value && (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                            </span>
                            <span className="font-medium text-green-600">✓ Available</span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {student.remarks && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Remarks</h3>
                  <p className="text-gray-700">{student.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetailModal;
