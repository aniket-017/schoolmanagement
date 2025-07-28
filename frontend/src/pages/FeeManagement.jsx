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
    installments: [{ amount: 0, dueDate: "", description: "" }],
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
    { id: "reports", name: "Reports", icon: FileText },
  ];

  useEffect(() => {
    if (activeTab === "slabs") {
      fetchFeeSlabs();
    }
  }, [activeTab]);

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
      </div>
    </Layout>
  );
};

export default FeeManagement;
