import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  Shield,
  Heart,
  FileText,
  X,
  Save,
  DollarSign,
} from "lucide-react";
import { toast } from "react-toastify";
import appConfig from "../config/environment";

const StudentEditModal = ({ student, isOpen, onClose, onSave, onRefresh }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    optionalMobileNumber: "",
    dateOfBirth: "",
    gender: "",
    currentAddress: "",
    mothersName: "",

    rollNumber: "",
    bloodGroup: "",
    nationality: "",
    religion: "",
    feeCategory: "regular",
    feeDiscount: 0,
    transportRequired: false,
    pickupPoint: "",
    dropPoint: "",
    remarks: "",

    // Fee Slab fields
    feeSlabId: "",
    feeStructure: "",
    paymentStatus: "pending",
    concessionAmount: 0,
    lateFees: 0,
    scholarshipDetails: "",
    // Payment fields
    paymentDate: "",
    paymentMethod: "",
    transactionId: "",
    feesPaid: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feeSlabs, setFeeSlabs] = useState([]);
  const [loadingFeeSlabs, setLoadingFeeSlabs] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [calculatedInstallments, setCalculatedInstallments] = useState([]);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        middleName: student.middleName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        mobileNumber: student.mobileNumber || student.phone || "",
        optionalMobileNumber: student.optionalMobileNumber || "",
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
        gender: student.gender || "",
        currentAddress: student.currentAddress || student.address?.street || "",
        mothersName: student.mothersName || student.mother?.name || "",

        rollNumber: student.rollNumber || "",
        bloodGroup: student.bloodGroup || "",
        nationality: student.nationality || "",
        religion: student.religion || "",
        feeCategory: student.feeCategory || "regular",
        feeDiscount: student.feeDiscount || 0,
        transportRequired: student.transportRequired || false,
        pickupPoint: student.pickupPoint || "",
        dropPoint: student.dropPoint || "",
        remarks: student.remarks || "",

        // Fee Slab fields
        feeSlabId: student.feeSlabId || "",
        feeStructure: student.feeStructure || "",
        paymentStatus: student.paymentStatus || "pending",
        concessionAmount: student.concessionAmount || 0,
        lateFees: student.lateFees || 0,
        scholarshipDetails: student.scholarshipDetails || "",
        // Payment fields
        paymentDate: student.paymentDate ? new Date(student.paymentDate).toISOString().split("T")[0] : "",
        paymentMethod: student.paymentMethod || "",
        transactionId: student.transactionId || "",
        feesPaid: student.feesPaid || 0,
      });
    }
  }, [student]);

  // Set selected slab when fee slabs are loaded or fee slab ID changes
  useEffect(() => {
    if (formData.feeSlabId && feeSlabs.length > 0) {
      const slab = feeSlabs.find((s) => s._id === formData.feeSlabId);
      setSelectedSlab(slab);

      // Calculate installments if concession amount exists
      if (formData.concessionAmount && formData.concessionAmount > 0) {
        calculateInstallments(formData.feeSlabId, formData.concessionAmount);
      }
    }
  }, [formData.feeSlabId, feeSlabs, formData.concessionAmount]);

  // Fetch fee slabs
  const fetchFeeSlabs = async () => {
    setLoadingFeeSlabs(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFeeSlabs(data.data.filter((slab) => slab.isActive));
      }
    } catch (error) {
      console.error("Error fetching fee slabs:", error);
    } finally {
      setLoadingFeeSlabs(false);
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

  useEffect(() => {
    fetchFeeSlabs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepare the data to send, handling optional fee fields
      const dataToSend = {
        ...formData,
        // Handle payment fields - only include if they have valid values
        ...(formData.paymentDate && { paymentDate: new Date(formData.paymentDate) }),
        ...(formData.paymentMethod && formData.paymentMethod.trim() && { paymentMethod: formData.paymentMethod }),
        ...(formData.transactionId && formData.transactionId.trim() && { transactionId: formData.transactionId }),
        ...(formData.feesPaid && formData.feesPaid > 0 && { feesPaid: parseFloat(formData.feesPaid) }),
        // Handle fee-related fields - only include if fee structure is selected
        ...(formData.feeStructure && {
          feeStructure: formData.feeStructure,
          feeSlabId: formData.feeSlabId || undefined,
          feeDiscount: formData.feeDiscount ? parseFloat(formData.feeDiscount) : undefined,
          paymentStatus: formData.paymentStatus,
          lateFees: formData.lateFees ? parseFloat(formData.lateFees) : undefined,
          concessionAmount: formData.concessionAmount ? parseFloat(formData.concessionAmount) : undefined,
          scholarshipDetails: formData.scholarshipDetails || undefined,
        }),
      };

      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(dataToSend).filter(([key, value]) => value !== undefined && value !== null && value !== "")
      );

      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/students/${student._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Student updated successfully");
        onSave && onSave(data.data);
        onRefresh && onRefresh();
        onClose();
      } else {
        toast.error(data.message || "Error updating student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Error updating student");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Handle fee slab change
    if (field === "feeSlabId") {
      const slab = feeSlabs.find((s) => s._id === value);
      setSelectedSlab(slab);

      // Calculate installments if concession amount exists
      if (formData.concessionAmount && formData.concessionAmount > 0) {
        calculateInstallments(value, formData.concessionAmount);
      } else {
        setCalculatedInstallments([]);
      }
    }

    // Handle concession amount change
    if (field === "concessionAmount") {
      if (formData.feeSlabId && value > 0) {
        calculateInstallments(formData.feeSlabId, value);
      } else {
        setCalculatedInstallments([]);
      }
    }
  };

  if (!student) return null;

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
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
              <p className="text-sm text-gray-500">
                {student.firstName && student.lastName
                  ? `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${
                      student.lastName
                    }`.trim()
                  : student.name || "Student"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup}
                        onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., A+, B-, O+"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => handleInputChange("religion", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        pattern="^[1-9]\d{9}$"
                        title="Mobile number must be exactly 10 digits and cannot start with 0"
                        placeholder="Enter 10 digit mobile number"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Optional Mobile Number</label>
                      <input
                        type="tel"
                        pattern="^[1-9]\d{9}$"
                        title="Mobile number must be exactly 10 digits and cannot start with 0"
                        placeholder="Enter 10 digit mobile number (optional)"
                        value={formData.optionalMobileNumber}
                        onChange={(e) => handleInputChange("optionalMobileNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
                    <textarea
                      required
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Parent Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.mothersName}
                        onChange={(e) => handleInputChange("mothersName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category</label>
                      <select
                        value={formData.feeCategory}
                        onChange={(e) => handleInputChange("feeCategory", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="regular">Regular</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="concession">Concession</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.feeDiscount}
                        onChange={(e) => handleInputChange("feeDiscount", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Slab Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Fee Slab Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure</label>
                      <select
                        value={formData.feeStructure}
                        onChange={(e) => handleInputChange("feeStructure", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Fee Structure (Optional)</option>
                        <option value="regular">Regular</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="concession">Concession</option>
                        <option value="free">Free</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fee Slab {formData.feeStructure === "regular" ? "(Recommended)" : ""}
                      </label>
                      <select
                        value={formData.feeSlabId}
                        onChange={(e) => handleInputChange("feeSlabId", e.target.value)}
                        disabled={loadingFeeSlabs || formData.feeStructure === "free" || !formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">
                          {loadingFeeSlabs
                            ? "Loading slabs..."
                            : !formData.feeStructure
                            ? "Select fee structure first"
                            : formData.feeStructure === "free"
                            ? "Not applicable"
                            : "Select Fee Slab (Optional)"}
                        </option>
                        {feeSlabs.map((slab) => (
                          <option key={slab._id} value={slab._id}>
                            {slab.slabName} - ₹{slab.totalAmount.toLocaleString()} ({slab.installments.length}{" "}
                            installments)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                        disabled={!formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Concession Amount (₹)</label>
                      <input
                        type="number"
                        value={formData.concessionAmount}
                        onChange={(e) => handleInputChange("concessionAmount", parseFloat(e.target.value) || 0)}
                        min="0"
                        max={selectedSlab ? selectedSlab.totalAmount : undefined}
                        placeholder="0"
                        disabled={formData.feeStructure === "free"}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                      {selectedSlab && formData.concessionAmount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {((formData.concessionAmount / selectedSlab.totalAmount) * 100).toFixed(1)}% discount
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Late Fees (₹)</label>
                      <input
                        type="number"
                        value={formData.lateFees}
                        onChange={(e) => handleInputChange("lateFees", parseFloat(e.target.value) || 0)}
                        min="0"
                        placeholder="0"
                        disabled={!formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Details</label>
                    <textarea
                      value={formData.scholarshipDetails}
                      onChange={(e) => handleInputChange("scholarshipDetails", e.target.value)}
                      rows={3}
                      disabled={!formData.feeStructure}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Details of any scholarships or financial aid received..."
                    />
                  </div>

                  {/* Fee Calculation Preview */}
                  {formData.feeStructure && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-md font-medium text-gray-800 mb-3">Fee Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-gray-600">Fee Structure</div>
                          <div className="font-medium capitalize">{formData.feeStructure}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-gray-600">Fee Slab</div>
                          <div className="font-medium">{selectedSlab ? selectedSlab.slabName : "Not selected"}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-gray-600">Total Amount</div>
                          <div className="font-medium">
                            {selectedSlab ? `₹${selectedSlab.totalAmount.toLocaleString()}` : "N/A"}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-gray-600">Status</div>
                          <div
                            className={`font-medium capitalize ${
                              formData.paymentStatus === "paid"
                                ? "text-green-600"
                                : formData.paymentStatus === "overdue"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {formData.paymentStatus || "Pending"}
                          </div>
                        </div>
                      </div>

                      {/* Concession Applied */}
                      {formData.concessionAmount > 0 && selectedSlab && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <h5 className="font-medium text-blue-800 mb-2">Concession Applied</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-blue-600">Original Amount:</span>
                              <span className="font-medium ml-2">₹{selectedSlab.totalAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-blue-600">Concession:</span>
                              <span className="font-medium ml-2">
                                ₹{parseInt(formData.concessionAmount).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-blue-600">Final Amount:</span>
                              <span className="font-medium ml-2">
                                ₹{(selectedSlab.totalAmount - (formData.concessionAmount || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Installment Details */}
                      {selectedSlab && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-800 mb-2">
                            Installment Structure {calculatedInstallments.length > 0 ? "(With Concession)" : ""}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(calculatedInstallments.length > 0
                              ? calculatedInstallments
                              : selectedSlab.installments
                            ).map((installment, index) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="font-medium text-sm">
                                  Installment {installment.installmentNumber || index + 1}
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  ₹{installment.amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {installment.percentage
                                    ? `${installment.percentage}%`
                                    : `${((installment.amount / selectedSlab.totalAmount) * 100).toFixed(1)}%`}
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
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                        disabled={!formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                        disabled={!formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select Payment Method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(e) => handleInputChange("transactionId", e.target.value)}
                        disabled={!formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Transaction ID (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fees Paid (₹)</label>
                      <input
                        type="number"
                        value={formData.feesPaid}
                        onChange={(e) => handleInputChange("feesPaid", parseFloat(e.target.value) || 0)}
                        min="0"
                        disabled={!formData.feeStructure}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount (₹)</label>
                      <input
                        type="text"
                        value={(
                          (formData.feeSlabId?.totalAmount || 0) -
                          (formData.concessionAmount || 0) -
                          (formData.feesPaid || 0)
                        ).toLocaleString()}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Transport Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="transportRequired"
                      checked={formData.transportRequired}
                      onChange={(e) => handleInputChange("transportRequired", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="transportRequired" className="ml-2 text-sm font-medium text-gray-700">
                      Transport Required
                    </label>
                  </div>

                  {formData.transportRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Point</label>
                        <input
                          type="text"
                          value={formData.pickupPoint}
                          onChange={(e) => handleInputChange("pickupPoint", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Drop Point</label>
                        <input
                          type="text"
                          value={formData.dropPoint}
                          onChange={(e) => handleInputChange("dropPoint", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Remarks</h3>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional remarks about the student..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudentEditModal;
