import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Settings,
  Percent,
  MessageSquare,
  CheckSquare,
  Square,
  Send,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";
import { appConfig } from "../config/environment";

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("slabs");
  const [searchTerm, setSearchTerm] = useState("");

  // Fee Slab Management
  const [feeSlabs, setFeeSlabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlab, setEditingSlab] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    slabName: "",
    totalAmount: 0,
    academicYear: "2024-25",
    classGrades: [],
    installments: [{ amount: 0, dueDate: "", description: "" }],
  });

  // Students states
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentEditModal, setShowStudentEditModal] = useState(false);
  const [showStudentViewModal, setShowStudentViewModal] = useState(false);
  const [feeEditData, setFeeEditData] = useState({
    paymentStatus: "pending",
    paymentDate: "",
    paymentMethod: "",
    transactionId: "",
    feesPaid: 0,
    remarks: "",
  });
  const [messageData, setMessageData] = useState({
    subject: "",
    message: "",
    selectedTemplate: "",
    createFees: false,
    feeAmount: 0,
    feeType: "tuition",
    dueDate: "",
  });
  const [loadingStudents, setLoadingStudents] = useState(false);


  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [markPaidData, setMarkPaidData] = useState({
    status: "paid",
    paidAmount: 0,
    paymentMethod: "cash",
    transactionId: "",
    remarks: "",
  });

  // Sample data
  const feeStats = [
    {
      name: "Total Collection",
      value: "$124,850",
      change: "+12.5%",
      changeType: "increase",
      icon: DollarSign,
      color: "success",
    },
    {
      name: "Pending Fees",
      value: "$28,450",
      change: "-8.2%",
      changeType: "decrease",
      icon: Clock,
      color: "warning",
    },
    {
      name: "Students Paid",
      value: "1,156",
      change: "+95",
      changeType: "increase",
      icon: CheckCircle,
      color: "primary",
    },
    {
      name: "Overdue Payments",
      value: "89",
      change: "-12",
      changeType: "decrease",
      icon: XCircle,
      color: "error",
    },
  ];

  const monthlyData = [
    { month: "Jan", collected: 45000, pending: 12000, overdue: 5000 },
    { month: "Feb", collected: 52000, pending: 15000, overdue: 3000 },
    { month: "Mar", collected: 48000, pending: 18000, overdue: 7000 },
    { month: "Apr", collected: 61000, pending: 22000, overdue: 4000 },
    { month: "May", collected: 55000, pending: 25000, overdue: 6000 },
    { month: "Jun", collected: 67000, pending: 28000, overdue: 2000 },
  ];

  const paymentMethods = [
    { name: "Online", value: 45, color: "#3B82F6" },
    { name: "Cash", value: 30, color: "#10B981" },
    { name: "Card", value: 15, color: "#F59E0B" },
    { name: "Cheque", value: 10, color: "#EF4444" },
  ];

  const recentPayments = [
    {
      id: 1,
      studentName: "John Smith",
      studentId: "STU001",
      amount: 2500,
      feeType: "Tuition",
      paymentDate: "2024-01-15",
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 2,
      studentName: "Emma Johnson",
      studentId: "STU002",
      amount: 1800,
      feeType: "Lab Fee",
      paymentDate: "2024-01-14",
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: 3,
      studentName: "Michael Brown",
      studentId: "STU003",
      amount: 2500,
      feeType: "Tuition",
      paymentDate: "2024-01-13",
      status: "pending",
      method: "Check",
    },
    {
      id: 4,
      studentName: "Sarah Davis",
      studentId: "STU004",
      amount: 800,
      feeType: "Sports Fee",
      paymentDate: "2024-01-12",
      status: "overdue",
      method: "Cash",
    },
  ];

  // API Functions
  const fetchFeeSlabs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFeeSlabs(data.data);
      } else {
        toast.error("Failed to fetch fee slabs");
      }
    } catch (error) {
      console.error("Error fetching fee slabs:", error);
      toast.error("Error fetching fee slabs");
    } finally {
      setLoading(false);
    }
  };

  // Get fee slab for a specific class grade
  const getFeeSlabForClass = (classGrade) => {
    return feeSlabs.find(slab => slab.classGrade === classGrade);
  };

  const handleCreateSlab = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Fee slab created successfully");
        setShowCreateModal(false);
        resetForm();
        fetchFeeSlabs();
      } else {
        toast.error(data.message || "Failed to create fee slab");
      }
    } catch (error) {
      console.error("Error creating fee slab:", error);
      toast.error("Error creating fee slab");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlab = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs/${editingSlab._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Fee slab updated successfully");
        setShowEditModal(false);
        resetForm();
        fetchFeeSlabs();
      } else {
        toast.error(data.message || "Failed to update fee slab");
      }
    } catch (error) {
      console.error("Error updating fee slab:", error);
      toast.error("Error updating fee slab");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fee slab?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Fee slab deleted successfully");
        fetchFeeSlabs();
      } else {
        toast.error(data.message || "Failed to delete fee slab");
      }
    } catch (error) {
      console.error("Error deleting fee slab:", error);
      toast.error("Error deleting fee slab");
    }
  };

  const resetForm = () => {
    setFormData({
      slabName: "",
      totalAmount: 0,
      academicYear: "2024-25",
      classGrades: [],
      installments: [{ amount: 0, dueDate: "", description: "" }],
    });
    setEditingSlab(null);
  };

  const handleEdit = (slab) => {
    setEditingSlab(slab);
    setFormData({
      slabName: slab.slabName,
      totalAmount: slab.totalAmount,
      academicYear: slab.academicYear,
      classGrades: slab.classGrades || [],
      installments: slab.installments.map((inst) => ({
        amount: inst.amount,
        dueDate: inst.dueDate.split("T")[0], // Format date for input
        description: inst.description,
      })),
    });
    setShowEditModal(true);
  };

  const addInstallment = () => {
    setFormData({
      ...formData,
      installments: [...formData.installments, { amount: 0, dueDate: "", description: "" }],
    });
  };

  const removeInstallment = (index) => {
    if (formData.installments.length > 1) {
      const newInstallments = formData.installments.filter((_, i) => i !== index);
      setFormData({ ...formData, installments: newInstallments });
    }
  };

  const updateInstallment = (index, field, value) => {
    const newInstallments = [...formData.installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setFormData({ ...formData, installments: newInstallments });
  };

  const calculatePercentage = (amount) => {
    if (formData.totalAmount === 0) return 0;
    return ((amount / formData.totalAmount) * 100).toFixed(1);
  };

  const filteredPayments = recentPayments.filter(
    (payment) =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFeeSlabs = feeSlabs.filter((slab) => slab.slabName.toLowerCase().includes(searchTerm.toLowerCase()));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const tabConfig = [
    { id: "slabs", name: "Fee Slabs", icon: Settings },
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "students", name: "Students", icon: Users },
    { id: "reports", name: "Reports", icon: FileText },
  ];

  useEffect(() => {
    if (activeTab === "slabs") {
      fetchFeeSlabs();
    }
    if (activeTab === "students") {
      fetchAllStudents();
    }
  }, [activeTab]);

  // Fetch all students
  const fetchAllStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAllStudents(data.data || []);
        setFilteredStudents(data.data || []);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Search students
  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredStudents(allStudents);
      return;
    }
    
    const filtered = allStudents.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const studentName = student.name || 
                         (student.firstName && student.lastName ? `${student.firstName} ${student.lastName}`.trim() : '') ||
                         student.firstName || 
                         student.studentId || 
                         '';
      
      return studentName.toLowerCase().includes(searchLower) ||
             student.studentId?.toLowerCase().includes(searchLower) ||
             student.email?.toLowerCase().includes(searchLower);
    });
    
    setFilteredStudents(filtered);
  };



  // Handle student selection
  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all students
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student._id));
    }
  };

  // Send message to selected students
  const handleSendMessage = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    if (!messageData.subject || !messageData.message) {
      toast.error("Please fill in subject and message");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/communications/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients: selectedStudents,
          subject: messageData.subject,
          message: messageData.message,
          type: "fee_reminder",
          createFees: messageData.createFees,
          feeAmount: messageData.feeAmount,
          feeType: messageData.feeType,
          dueDate: messageData.dueDate,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Message sent successfully");
        setShowMessageModal(false);
        setMessageData({ subject: "", message: "", selectedTemplate: "", createFees: false, feeAmount: 0, feeType: "tuition", dueDate: "" });
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  // Message templates
  const messageTemplates = [
    {
      id: "pending_fees",
      subject: "Pending Fee Payment Reminder",
      message: "Dear Parent/Guardian,\n\nThis is a reminder that your child's fee payment is pending. Please ensure timely payment to avoid any inconvenience.\n\nBest regards,\nSchool Administration",
    },
    {
      id: "overdue_fees",
      subject: "Urgent: Overdue Fee Payment",
      message: "Dear Parent/Guardian,\n\nYour child's fee payment is overdue. Please make the payment immediately to avoid any penalties or restrictions.\n\nBest regards,\nSchool Administration",
    },
    {
      id: "partial_payment",
      subject: "Partial Payment Received",
      message: "Dear Parent/Guardian,\n\nWe have received your partial payment. Please complete the remaining amount at your earliest convenience.\n\nBest regards,\nSchool Administration",
    },
  ];

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessageData({
        subject: template.subject,
        message: template.message,
        selectedTemplate: templateId,
        createFees: messageData.createFees,
        feeAmount: messageData.feeAmount,
        feeType: messageData.feeType,
        dueDate: messageData.dueDate,
      });
    }
  };



  // Mark fee as paid
  const handleMarkFeePaid = async () => {
    if (!selectedFee) {
      toast.error("No fee selected");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fees/${selectedFee._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(markPaidData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Fee status updated successfully");
        setShowMarkPaidModal(false);
        setSelectedFee(null);
        // Refresh the class students to show updated fee status
        fetchClassStudents(selectedClass);
      } else {
        toast.error(data.message || "Failed to update fee status");
      }
    } catch (error) {
      console.error("Error updating fee status:", error);
      toast.error("Error updating fee status");
    }
  };

  // Handle mark as paid button click
  const handleMarkAsPaidClick = (student) => {
    if (student.feeStatus?.fees?.length > 0) {
      const fee = student.feeStatus.fees[0];
      setSelectedFee(fee);
      setMarkPaidData({
        status: "paid",
        paidAmount: fee.amount,
        paymentMethod: "cash",
        transactionId: "",
        remarks: "",
      });
      setShowMarkPaidModal(true);
    } else {
      toast.error("No fees found for this student");
    }
  };

  // Handle student edit
  const handleStudentEdit = (student) => {
    setSelectedStudent(student);
    setFeeEditData({
      paymentStatus: student.paymentStatus || "pending",
      paymentDate: student.paymentDate ? new Date(student.paymentDate).toISOString().split('T')[0] : "",
      paymentMethod: student.paymentMethod || "",
      transactionId: student.transactionId || "",
      feesPaid: student.feesPaid || 0,
      remarks: student.remarks || "",
    });
    setShowStudentEditModal(true);
  };

  // Handle student view
  const handleStudentView = (student) => {
    setSelectedStudent(student);
    setShowStudentViewModal(true);
  };

  // Handle fee edit
  const handleFeeEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/students/${selectedStudent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feeEditData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Fee information updated successfully");
        setShowStudentEditModal(false);
        fetchAllStudents(); // Refresh the student list
      } else {
        toast.error(data.message || "Error updating fee information");
      }
    } catch (error) {
      console.error("Error updating fee information:", error);
      toast.error("Error updating fee information");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                <p className="text-gray-600">Manage fee slabs, payments, and financial reports</p>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
                {activeTab === "slabs" && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Fee Slab
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "slabs" && (
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search fee slabs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fee Slabs Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slab Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Academic Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Installments
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-4 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              </td>
                            </tr>
                          ) : filteredFeeSlabs.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                No fee slabs found. Create your first fee slab to get started.
                              </td>
                            </tr>
                          ) : (
                            filteredFeeSlabs.map((slab) => (
                              <tr key={slab._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{slab.slabName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ₹{slab.totalAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {slab.academicYear}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {slab.installments.length} installments
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={cn(
                                      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                                      slab.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    )}
                                  >
                                    {slab.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleEdit(slab)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlab(slab._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "overview" && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {feeStats.map((stat, index) => (
                      <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            <div className="flex items-center mt-2">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                                )}
                              >
                                {stat.change}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">from last month</span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "p-3 rounded-full",
                              stat.color === "success" && "bg-green-100 text-green-600",
                              stat.color === "warning" && "bg-yellow-100 text-yellow-600",
                              stat.color === "primary" && "bg-blue-100 text-blue-600",
                              stat.color === "error" && "bg-red-100 text-red-600"
                            )}
                          >
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Collection Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Collection</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="collected" stroke="#3B82F6" strokeWidth={2} name="Collected" />
                          <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
                          <Line type="monotone" dataKey="overdue" stroke="#EF4444" strokeWidth={2} name="Overdue" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Payment Methods Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={paymentMethods}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {paymentMethods.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search payments..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </button>
                      <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fee Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                                  <div className="text-sm text-gray-500">{payment.studentId}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.feeType}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{payment.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.paymentDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={cn(
                                    "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                                    payment.status === "completed" && "bg-green-100 text-green-800",
                                    payment.status === "pending" && "bg-yellow-100 text-yellow-800",
                                    payment.status === "overdue" && "bg-red-100 text-red-800"
                                  )}
                                >
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900 mr-3">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "students" && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Students
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search by name, student ID, or email..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                      </div>
                      </div>

                    </div>
                  </div>

                  {/* Students List */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                        Students ({filteredStudents.length})
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                          {selectedStudents.length === filteredStudents.length ? (
                              <CheckSquare className="w-4 h-4 mr-2" />
                            ) : (
                              <Square className="w-4 h-4 mr-2" />
                            )}
                          {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
                          </button>
                          {selectedStudents.length > 0 && (
                            <button
                              onClick={() => setShowMessageModal(true)}
                              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message ({selectedStudents.length})
                            </button>
                          )}
                        </div>
                      </div>

                      {loadingStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Loading students...</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <input
                                    type="checkbox"
                                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Class
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fee Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fees Paid
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remaining
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(student._id)}
                                      onChange={() => handleStudentSelection(student._id)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {student.name || `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim()}
                                      </div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.studentId}
                                  </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.class?.name || student.class?.grade || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.mobileNumber || student.phone || "N/A"}
                                  </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.feeSlabId?.slabName || 
                                   (student.class?.grade ? getFeeSlabForClass(student.class.grade)?.slabName : null) || 
                                   student.feeStructure || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(student.feeSlabId?.totalAmount || 
                                     (student.class?.grade ? getFeeSlabForClass(student.class.grade)?.totalAmount : 0) || 
                                     0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{student.feesPaid?.toLocaleString() || "0"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(((student.feeSlabId?.totalAmount || 
                                       (student.class?.grade ? getFeeSlabForClass(student.class.grade)?.totalAmount : 0) || 
                                       0)) - (student.feesPaid || 0)).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.paymentDate ? new Date(student.paymentDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.paymentMethod || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    student.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    student.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {student.paymentStatus || 'pending'}
                                  </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button 
                                    onClick={() => handleStudentEdit(student)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                    title="Edit Student"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleStudentView(student)}
                                    className="text-green-600 hover:text-green-900 mr-3"
                                    title="View Details"
                                  >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleMarkAsPaidClick(student)}
                                    className="text-orange-600 hover:text-orange-900"
                                    title="Mark as Paid"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  {/* Quick Actions */}
                  {filteredStudents.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Mark All as Paid</div>
                            <div className="text-sm text-gray-500">Mark all selected students as paid</div>
                          </div>
                        </button>
                        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Send Bulk Reminder</div>
                            <div className="text-sm text-gray-500">Send reminder to all pending students</div>
                          </div>
                        </button>
                        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="w-5 h-5 mr-3 text-purple-600" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">Export Report</div>
                            <div className="text-sm text-gray-500">Generate fee collection report</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reports" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="w-5 h-5 mr-3 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Monthly Report</div>
                          <div className="text-sm text-gray-500">Generate monthly fee collection report</div>
                        </div>
                      </button>
                      <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="w-5 h-5 mr-3 text-green-600" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Class-wise Report</div>
                          <div className="text-sm text-gray-500">Fee collection by class</div>
                        </div>
                      </button>
                      <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="w-5 h-5 mr-3 text-purple-600" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Defaulters Report</div>
                          <div className="text-sm text-gray-500">List of fee defaulters</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Fee Slab Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Create Fee Slab</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSlab} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slab Name *</label>
                    <input
                      type="text"
                      value={formData.slabName}
                      onChange={(e) => setFormData({ ...formData, slabName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 1st Class New"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹) *</label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20000"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Class Grades & Divisions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Grades & Divisions *</label>
                  <div className="space-y-3">
                    {formData.classGrades.map((classGrade, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <select
                          value={classGrade.grade}
                          onChange={(e) => {
                            const newClassGrades = [...formData.classGrades];
                            newClassGrades[index].grade = parseInt(e.target.value);
                            setFormData({ ...formData, classGrades: newClassGrades });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Grade</option>
                          <option value="1">1st Class</option>
                          <option value="2">2nd Class</option>
                          <option value="3">3rd Class</option>
                          <option value="4">4th Class</option>
                          <option value="5">5th Class</option>
                          <option value="6">6th Class</option>
                          <option value="7">7th Class</option>
                          <option value="8">8th Class</option>
                          <option value="9">9th Class</option>
                          <option value="10">10th Class</option>
                          <option value="11">11th Class</option>
                          <option value="12">12th Class</option>
                        </select>
                        
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Divisions</label>
                          <div className="flex flex-wrap gap-1">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((division) => (
                              <label key={division} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={classGrade.divisions.includes(division)}
                                  onChange={(e) => {
                                    const newClassGrades = [...formData.classGrades];
                                    if (e.target.checked) {
                                      newClassGrades[index].divisions.push(division);
                                    } else {
                                      newClassGrades[index].divisions = newClassGrades[index].divisions.filter(d => d !== division);
                                    }
                                    setFormData({ ...formData, classGrades: newClassGrades });
                                  }}
                                  className="mr-1"
                                />
                                <span className="text-sm">{division}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const newClassGrades = formData.classGrades.filter((_, i) => i !== index);
                            setFormData({ ...formData, classGrades: newClassGrades });
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          classGrades: [...formData.classGrades, { grade: "", divisions: [] }]
                        });
                      }}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Add Class Grade
                    </button>
                  </div>
                </div>

                {/* Installments */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Installments</h4>
                    <button
                      type="button"
                      onClick={addInstallment}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Installment
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.installments.map((installment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-900">Installment {index + 1}</h5>
                          {formData.installments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInstallment(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              value={installment.amount}
                              onChange={(e) => updateInstallment(index, "amount", parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="10000"
                              min="0"
                            />
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Percent className="w-3 h-3 mr-1" />
                              {calculatePercentage(installment.amount)}%
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={installment.dueDate}
                              onChange={(e) => updateInstallment(index, "dueDate", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={installment.description}
                              onChange={(e) => updateInstallment(index, "description", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Installment ${index + 1}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Creating..." : "Create Fee Slab"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Fee Slab Modal */}
        {showEditModal && editingSlab && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Edit Fee Slab</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateSlab} className="space-y-6">
                {/* Same form fields as create modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slab Name *</label>
                    <input
                      type="text"
                      value={formData.slabName}
                      onChange={(e) => setFormData({ ...formData, slabName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹) *</label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Class Grades & Divisions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Grades & Divisions *</label>
                  <div className="space-y-3">
                    {formData.classGrades.map((classGrade, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <select
                          value={classGrade.grade}
                          onChange={(e) => {
                            const newClassGrades = [...formData.classGrades];
                            newClassGrades[index].grade = parseInt(e.target.value);
                            setFormData({ ...formData, classGrades: newClassGrades });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Grade</option>
                          <option value="1">1st Class</option>
                          <option value="2">2nd Class</option>
                          <option value="3">3rd Class</option>
                          <option value="4">4th Class</option>
                          <option value="5">5th Class</option>
                          <option value="6">6th Class</option>
                          <option value="7">7th Class</option>
                          <option value="8">8th Class</option>
                          <option value="9">9th Class</option>
                          <option value="10">10th Class</option>
                          <option value="11">11th Class</option>
                          <option value="12">12th Class</option>
                        </select>
                        
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Divisions</label>
                          <div className="flex flex-wrap gap-1">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((division) => (
                              <label key={division} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={classGrade.divisions.includes(division)}
                                  onChange={(e) => {
                                    const newClassGrades = [...formData.classGrades];
                                    if (e.target.checked) {
                                      newClassGrades[index].divisions.push(division);
                                    } else {
                                      newClassGrades[index].divisions = newClassGrades[index].divisions.filter(d => d !== division);
                                    }
                                    setFormData({ ...formData, classGrades: newClassGrades });
                                  }}
                                  className="mr-1"
                                />
                                <span className="text-sm">{division}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const newClassGrades = formData.classGrades.filter((_, i) => i !== index);
                            setFormData({ ...formData, classGrades: newClassGrades });
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18L6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          classGrades: [...formData.classGrades, { grade: "", divisions: [] }]
                        });
                      }}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + Add Class Grade
                    </button>
                  </div>
                </div>

                {/* Installments (same as create modal) */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Installments</h4>
                    <button
                      type="button"
                      onClick={addInstallment}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Installment
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.installments.map((installment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-900">Installment {index + 1}</h5>
                          {formData.installments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInstallment(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              value={installment.amount}
                              onChange={(e) => updateInstallment(index, "amount", parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                            />
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Percent className="w-3 h-3 mr-1" />
                              {calculatePercentage(installment.amount)}%
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={installment.dueDate}
                              onChange={(e) => updateInstallment(index, "dueDate", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={installment.description}
                              onChange={(e) => updateInstallment(index, "description", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Updating..." : "Update Fee Slab"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Send Message to Students</h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageData({ subject: "", message: "", selectedTemplate: "", createFees: false, feeAmount: 0, feeType: "tuition", dueDate: "" });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Template</label>
                  <select
                    value={messageData.selectedTemplate}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a template...</option>
                    {messageTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={messageData.subject}
                    onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter message subject"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={messageData.message}
                    onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message here..."
                    required
                  />
                </div>

                {/* Fee Creation Options */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="createFees"
                      checked={messageData.createFees}
                      onChange={(e) => setMessageData({ ...messageData, createFees: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label htmlFor="createFees" className="text-sm font-medium text-gray-700">
                      Create fee records for selected students
                    </label>
                  </div>
                  
                  {messageData.createFees && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (₹)</label>
                        <input
                          type="number"
                          value={messageData.feeAmount}
                          onChange={(e) => setMessageData({ ...messageData, feeAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="2500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                        <select
                          value={messageData.feeType}
                          onChange={(e) => setMessageData({ ...messageData, feeType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="tuition">Tuition</option>
                          <option value="library">Library</option>
                          <option value="sports">Sports</option>
                          <option value="transport">Transport</option>
                          <option value="examination">Examination</option>
                          <option value="miscellaneous">Miscellaneous</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={messageData.dueDate}
                          onChange={(e) => setMessageData({ ...messageData, dueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Recipients Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Sending to {selectedStudents.length} selected student(s)
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageData({ subject: "", message: "", selectedTemplate: "", createFees: false, feeAmount: 0, feeType: "tuition", dueDate: "" });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2 inline" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Mark as Paid Modal */}
        {showMarkPaidModal && selectedFee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mark Fee as Paid</h3>
                <button
                  onClick={() => setShowMarkPaidModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
                  <input
                    type="number"
                    value={markPaidData.paidAmount}
                    onChange={(e) => setMarkPaidData({ ...markPaidData, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={selectedFee.amount}
                    min="0"
                    max={selectedFee.amount}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={markPaidData.paymentMethod}
                    onChange={(e) => setMarkPaidData({ ...markPaidData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Optional)</label>
                  <input
                    type="text"
                    value={markPaidData.transactionId}
                    onChange={(e) => setMarkPaidData({ ...markPaidData, transactionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter transaction ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                  <textarea
                    value={markPaidData.remarks}
                    onChange={(e) => setMarkPaidData({ ...markPaidData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowMarkPaidModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkFeePaid}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Fee Edit Modal */}
        {showStudentEditModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Fee Information</h3>
                <button
                    onClick={() => setShowStudentEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Student:</strong> {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.middleName || ''} ${selectedStudent.lastName || ''}`.trim()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Class:</strong> {selectedStudent.class?.name || selectedStudent.class?.grade || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Fee Slab:</strong> {selectedStudent.feeSlabId?.slabName || 
                      (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.slabName : null) || 
                      selectedStudent.feeStructure || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> ₹{(selectedStudent.feeSlabId?.totalAmount || 
                      (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.totalAmount : 0) || 
                      0).toLocaleString()}
                  </p>
                </div>

                <form onSubmit={handleFeeEdit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={feeEditData.paymentStatus}
                      onChange={(e) => setFeeEditData({ ...feeEditData, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                      type="date"
                      value={feeEditData.paymentDate}
                      onChange={(e) => setFeeEditData({ ...feeEditData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                      value={feeEditData.paymentMethod}
                      onChange={(e) => setFeeEditData({ ...feeEditData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={feeEditData.transactionId}
                      onChange={(e) => setFeeEditData({ ...feeEditData, transactionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter transaction ID (optional)"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fees Paid (₹)</label>
                    <input
                      type="number"
                      value={feeEditData.feesPaid}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const maxAmount = (selectedStudent.feeSlabId?.totalAmount || 
                                          (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.totalAmount : 0) || 
                                          0);
                        if (value <= maxAmount) {
                          setFeeEditData({ ...feeEditData, feesPaid: value });
                        }
                      }}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount paid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount (₹)</label>
                    <input
                      type="text"
                      value={(((selectedStudent.feeSlabId?.totalAmount || 
                                (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.totalAmount : 0) || 
                                0)) - (feeEditData.feesPaid || 0)).toLocaleString()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                      value={feeEditData.remarks}
                      onChange={(e) => setFeeEditData({ ...feeEditData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                      type="button"
                      onClick={() => setShowStudentEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                      Update Fee
                </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Student Fee View Modal */}
        {showStudentViewModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Fee Information</h3>
                <button
                  onClick={() => setShowStudentViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium ml-2">
                        {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.middleName || ''} ${selectedStudent.lastName || ''}`.trim()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-medium ml-2">{selectedStudent.studentId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Class:</span>
                      <span className="font-medium ml-2">{selectedStudent.class?.name || selectedStudent.class?.grade || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium ml-2">{selectedStudent.mobileNumber || selectedStudent.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Fee Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Fee Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fee Structure:</span>
                      <span className="font-medium ml-2 capitalize">{selectedStudent.feeStructure || 'regular'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fee Slab:</span>
                      <span className="font-medium ml-2">{selectedStudent.feeSlabId?.slabName || 
                        (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.slabName : null) || 
                        selectedStudent.feeStructure || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium ml-2">₹{(selectedStudent.feeSlabId?.totalAmount || 
                        (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.totalAmount : 0) || 
                        0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fees Paid:</span>
                      <span className="font-medium ml-2">₹{selectedStudent.feesPaid?.toLocaleString() || "0"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining Amount:</span>
                      <span className="font-medium ml-2">₹{(((selectedStudent.feeSlabId?.totalAmount || 
                        (selectedStudent.class?.grade ? getFeeSlabForClass(selectedStudent.class.grade)?.totalAmount : 0) || 
                        0)) - (selectedStudent.feesPaid || 0)).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                        selectedStudent.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedStudent.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedStudent.paymentStatus || 'pending'}
                      </span>
                    </div>
                    {selectedStudent.concessionAmount > 0 && (
                      <div>
                        <span className="text-gray-600">Concession Amount:</span>
                        <span className="font-medium ml-2">₹{selectedStudent.concessionAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedStudent.lateFees > 0 && (
                      <div>
                        <span className="text-gray-600">Late Fees:</span>
                        <span className="font-medium ml-2 text-red-600">₹{selectedStudent.lateFees.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedStudent.paymentDate && (
                      <div>
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="font-medium ml-2">{new Date(selectedStudent.paymentDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedStudent.paymentMethod && (
                      <div>
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium ml-2 capitalize">{selectedStudent.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    )}
                    {selectedStudent.transactionId && (
                      <div>
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium ml-2">{selectedStudent.transactionId}</span>
                      </div>
                    )}
                    {selectedStudent.scholarshipDetails && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Scholarship Details:</span>
                        <span className="font-medium ml-2">{selectedStudent.scholarshipDetails}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowStudentViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FeeManagement;
