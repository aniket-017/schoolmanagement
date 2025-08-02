import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
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
  CheckSquare,
  Square,
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
import apiService from "../services/apiService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Fee Overview states
  const [overviewData, setOverviewData] = useState({
    summaryCards: {
      totalCollection: { value: "₹0", change: "0%", changeType: "increase" },
      pendingFees: { value: "₹0", change: "0%", changeType: "decrease" },
      studentsPaid: { value: "0", change: "0", changeType: "increase" },
      overduePayments: { value: "0", change: "0", changeType: "decrease" }
    },
    monthlyData: [],
    paymentMethods: []
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Report Generation States
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("");
  const [pdfExporting, setPdfExporting] = useState(false);

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

  // Students states
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentEditModal, setShowStudentEditModal] = useState(false);
  const [showStudentViewModal, setShowStudentViewModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    paymentStatus: "pending",
    remarks: "",
  });
  const [feeEditData, setFeeEditData] = useState({
    paymentStatus: "pending",
    paymentDate: "",
    paymentMethod: "",
    paymentType: "full",
    transactionId: "",
    feesPaid: 0,
    remarks: "",
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

  // Fee Reminder Modal States
  const [showFeeReminderModal, setShowFeeReminderModal] = useState(false);
  const [selectedStudentForReminder, setSelectedStudentForReminder] = useState(null);
  const [feeReminderData, setFeeReminderData] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [sendingReminder, setSendingReminder] = useState(false);

  // Remove sortBy/sortOrder and add filter states
  const [feeSlabFilter, setFeeSlabFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Compute unique options for dropdowns
  const feeSlabOptions = useMemo(() => {
    const setVals = new Set(filteredStudents.map(s => s.feeSlabId?.slabName || s.feeStructure || "N/A"));
    return Array.from(setVals);
  }, [filteredStudents]);
  const classOptions = useMemo(() => {
    const setVals = new Set(filteredStudents.map(s => s.class?.name || s.class?.grade || "N/A"));
    return Array.from(setVals);
  }, [filteredStudents]);
  const statusOptions = useMemo(() => {
    const setVals = new Set(filteredStudents.map(s => s.paymentStatus || "pending"));
    return Array.from(setVals);
  }, [filteredStudents]);

  // Filtering logic for students
  const filteredAndSortedStudents = useMemo(() => {
    return filteredStudents.filter(student => {
      const feeSlab = student.feeSlabId?.slabName || student.feeStructure || "N/A";
      const className = student.class?.name || student.class?.grade || "N/A";
      const status = student.paymentStatus || "pending";
      return (
        (feeSlabFilter === "" || feeSlab === feeSlabFilter) &&
        (classFilter === "" || className === classFilter) &&
        (statusFilter === "" || status === statusFilter)
      );
    });
  }, [filteredStudents, feeSlabFilter, classFilter, statusFilter]);

  // Sample data
  const feeStats = [
    {
      name: "Total Collection",
      value: overviewData.summaryCards.totalCollection.value,
      change: overviewData.summaryCards.totalCollection.change,
      changeType: overviewData.summaryCards.totalCollection.changeType,
      icon: CreditCard,
      color: "success",
    },
    {
      name: "Pending Fees",
      value: overviewData.summaryCards.pendingFees.value,
      change: overviewData.summaryCards.pendingFees.change,
      changeType: overviewData.summaryCards.pendingFees.changeType,
      icon: Clock,
      color: "warning",
    },
    {
      name: "Students Paid",
      value: overviewData.summaryCards.studentsPaid.value,
      change: overviewData.summaryCards.studentsPaid.change,
      changeType: overviewData.summaryCards.studentsPaid.changeType,
      icon: CheckCircle,
      color: "primary",
    },
    {
      name: "Overdue Payments",
      value: overviewData.summaryCards.overduePayments.value,
      change: overviewData.summaryCards.overduePayments.change,
      changeType: overviewData.summaryCards.overduePayments.changeType,
      icon: XCircle,
      color: "error",
    },
  ];

  const monthlyData = overviewData.monthlyData;

  const paymentMethods = overviewData.paymentMethods;
  
  // If no payment methods data, use sample data for testing
  const samplePaymentMethods = [
    { name: "Cash", value: 40, color: "#10B981" },
    { name: "Online", value: 35, color: "#3B82F6" },
    { name: "Card", value: 25, color: "#F59E0B" }
  ];
  
  // Check if payment methods data is valid (not just "No Payments")
  const hasValidPaymentMethods = paymentMethods && 
    paymentMethods.length > 0 && 
    !(paymentMethods.length === 1 && paymentMethods[0].name === "No Payments");
  
  const displayPaymentMethods = hasValidPaymentMethods ? paymentMethods : samplePaymentMethods;
  
  // Debug logging for payment methods
  console.log('Payment Methods Data:', paymentMethods);
  console.log('Has Valid Payment Methods:', hasValidPaymentMethods);
  console.log('Display Payment Methods:', displayPaymentMethods);

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

  const fetchFeeOverview = async () => {
    setOverviewLoading(true);
    try {
      const response = await apiService.fees.getFeeOverview();
      if (response.success) {
        console.log('Frontend received overview data:', response.data);
        console.log('Monthly data:', response.data.monthlyData);
        console.log('Payment methods:', response.data.paymentMethods);
        setOverviewData(response.data);
      } else {
        toast.error("Failed to fetch fee overview data");
      }
    } catch (error) {
      console.error("Error fetching fee overview:", error);
      toast.error("Error fetching fee overview data");
    } finally {
      setOverviewLoading(false);
    }
  };

  // Report Generation Functions
  const generateMonthlyReport = async () => {
    setReportLoading(true);
    setReportType("monthly");
    try {
      const response = await apiService.fees.getFeeOverview();
      if (response.success) {
        const monthlyData = response.data.monthlyData;
        const summaryCards = response.data.summaryCards;
        
        const reportData = {
          type: "Monthly Fee Collection Report",
          generatedDate: new Date().toLocaleDateString(),
          summary: {
            totalCollection: summaryCards.totalCollection.value,
            pendingFees: summaryCards.pendingFees.value,
            studentsPaid: summaryCards.studentsPaid.value,
            overduePayments: summaryCards.overduePayments.value
          },
          monthlyBreakdown: monthlyData,
          charts: {
            monthlyCollection: monthlyData,
            paymentMethods: response.data.paymentMethods
          }
        };
        
        setReportData(reportData);
        setShowReportModal(true);
      } else {
        toast.error("Failed to generate monthly report");
      }
    } catch (error) {
      console.error("Error generating monthly report:", error);
      toast.error("Error generating monthly report");
    } finally {
      setReportLoading(false);
    }
  };

  const generateClassWiseReport = async () => {
    setReportLoading(true);
    setReportType("classwise");
    try {
      // Ensure students are loaded
      if (allStudents.length === 0) {
        await fetchAllStudents();
      }
      
      const response = await apiService.fees.getFeeOverview();
      if (response.success) {
        console.log('All Students Data:', allStudents);
        console.log('Number of students:', allStudents.length);
        
        // Group students by class for class-wise report
        const classWiseData = {};
        
        // Process students with async support
        for (const student of allStudents) {
          console.log('Processing student:', {
            name: `${student.firstName} ${student.lastName}`,
            class: student.class,
            className: student.class?.name,
            classGrade: student.class?.grade,
            feeSlab: student.feeSlabId,
            feesPaid: student.feesPaid
          });
          
          // Try different ways to get class name
          let className = "Unknown Class";
          if (student.class?.name) {
            className = student.class.name;
          } else if (student.class?.grade) {
            className = student.class.grade;
          } else if (student.class) {
            className = typeof student.class === 'string' ? student.class : 'Unknown Class';
          }
          
          console.log('Final className:', className);
          
          if (!classWiseData[className]) {
            classWiseData[className] = {
              className,
              totalStudents: 0,
              paidStudents: 0,
              pendingStudents: 0,
              overdueStudents: 0,
              totalAmount: 0,
              collectedAmount: 0,
              pendingAmount: 0
            };
          }
          
          classWiseData[className].totalStudents++;
          classWiseData[className].totalAmount += student.feeSlabId?.totalAmount || 0;
          classWiseData[className].collectedAmount += student.feesPaid || 0;
          
          // Use simple status calculation for frontend
          const studentTotalAmount = student.feeSlabId?.totalAmount || 0;
          const studentPaidAmount = student.feesPaid || 0;
          const balance = studentTotalAmount - studentPaidAmount;
          
          let status = "pending";
          if (balance <= 0 && studentPaidAmount > 0) {
            status = "paid";
          } else if (studentPaidAmount === 0) {
            status = "pending";
          } else if (studentPaidAmount > 0 && balance > 0) {
            // Check if overdue based on payment date
            const lastPaymentDate = student.paymentDate || new Date();
            const daysSinceLastPayment = Math.floor((new Date() - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24));
            if (daysSinceLastPayment > 30) {
              status = "overdue";
            }
          }
          
          console.log('Student status:', {
            name: `${student.firstName} ${student.lastName}`,
            totalAmount: studentTotalAmount,
            paidAmount: studentPaidAmount,
            balance,
            status
          });
          
          if (status === "paid") {
            classWiseData[className].paidStudents++;
          } else if (status === "pending") {
            classWiseData[className].pendingStudents++;
            classWiseData[className].pendingAmount += balance;
          } else if (status === "overdue") {
            classWiseData[className].overdueStudents++;
            classWiseData[className].pendingAmount += balance;
          }
        }
        
        console.log('Class-wise data:', classWiseData);
        
        const reportData = {
          type: "Class-wise Fee Collection Report",
          generatedDate: new Date().toLocaleDateString(),
          classData: Object.values(classWiseData),
          summary: {
            totalClasses: Object.keys(classWiseData).length,
            totalStudents: allStudents.length,
            totalCollection: response.data.summaryCards.totalCollection.value,
            totalPending: response.data.summaryCards.pendingFees.value
          }
        };
        
        console.log('Final report data:', reportData);
        
        setReportData(reportData);
        setShowReportModal(true);
      } else {
        toast.error("Failed to generate class-wise report");
      }
    } catch (error) {
      console.error("Error generating class-wise report:", error);
      toast.error("Error generating class-wise report");
    } finally {
      setReportLoading(false);
    }
  };

  const generateYearlyReport = async () => {
    setReportLoading(true);
    setReportType("yearly");
    try {
      // Ensure students are loaded
      if (allStudents.length === 0) {
        await fetchAllStudents();
      }
      
      const response = await apiService.fees.getFeeOverview();
      if (response.success) {
        // Calculate yearly totals
        const currentYear = new Date().getFullYear();
        const yearlyData = {
          totalStudents: allStudents.length,
          totalCollection: 0,
          totalPending: 0,
          totalOverdue: 0,
          monthlyBreakdown: [],
          classBreakdown: {},
          paymentMethods: {}
        };
        
        // Process students for yearly data
        for (const student of allStudents) {
          const studentTotalAmount = student.feeSlabId?.totalAmount || 0;
          const studentPaidAmount = student.feesPaid || 0;
          const balance = studentTotalAmount - studentPaidAmount;
          
          yearlyData.totalCollection += studentPaidAmount;
          yearlyData.totalPending += balance;
          
          // Class breakdown
          const className = student.class?.name || student.class?.grade || "Unknown Class";
          if (!yearlyData.classBreakdown[className]) {
            yearlyData.classBreakdown[className] = {
              className,
              totalStudents: 0,
              totalCollection: 0,
              totalPending: 0
            };
          }
          yearlyData.classBreakdown[className].totalStudents++;
          yearlyData.classBreakdown[className].totalCollection += studentPaidAmount;
          yearlyData.classBreakdown[className].totalPending += balance;
          
          // Payment method breakdown
          if (student.paymentMethod) {
            yearlyData.paymentMethods[student.paymentMethod] = (yearlyData.paymentMethods[student.paymentMethod] || 0) + 1;
          }
        }
        
        // Calculate overdue based on payment dates
        for (const student of allStudents) {
          const studentTotalAmount = student.feeSlabId?.totalAmount || 0;
          const studentPaidAmount = student.feesPaid || 0;
          const balance = studentTotalAmount - studentPaidAmount;
          
          if (studentPaidAmount > 0 && balance > 0) {
            const lastPaymentDate = student.paymentDate || new Date();
            const daysSinceLastPayment = Math.floor((new Date() - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24));
            if (daysSinceLastPayment > 30) {
              yearlyData.totalOverdue += balance;
            }
          }
        }
        
        // Generate monthly breakdown for the year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
          const monthName = months[i];
          const monthDate = new Date(currentYear, i, 1);
          const nextMonthDate = new Date(currentYear, i + 1, 1);
          
          // Calculate monthly collection (simplified)
          let monthlyCollected = 0;
          for (const student of allStudents) {
            if (student.paymentDate) {
              const paymentDate = new Date(student.paymentDate);
              if (paymentDate >= monthDate && paymentDate < nextMonthDate) {
                monthlyCollected += student.feesPaid || 0;
              }
            }
          }
          
          yearlyData.monthlyBreakdown.push({
            month: monthName,
            collected: monthlyCollected,
            pending: yearlyData.totalPending / 12, // Distribute pending across months
            overdue: yearlyData.totalOverdue / 12 // Distribute overdue across months
          });
        }
        
        const reportData = {
          type: `Yearly Fee Collection Report - ${currentYear}`,
          generatedDate: new Date().toLocaleDateString(),
          yearlyData: yearlyData,
          summary: {
            totalStudents: yearlyData.totalStudents,
            totalCollection: `₹${yearlyData.totalCollection.toLocaleString()}`,
            totalPending: `₹${yearlyData.totalPending.toLocaleString()}`,
            totalOverdue: `₹${yearlyData.totalOverdue.toLocaleString()}`,
            totalClasses: Object.keys(yearlyData.classBreakdown).length
          }
        };
        
        setReportData(reportData);
        setShowReportModal(true);
        toast.success("Yearly report generated successfully!");
      } else {
        toast.error("Failed to generate yearly report");
      }
    } catch (error) {
      console.error("Error generating yearly report:", error);
      toast.error("Error generating yearly report");
    } finally {
      setReportLoading(false);
    }
  };

  // PDF Export Function
  const exportToPDF = async () => {
    try {
      setPdfExporting(true);
      toast.loading("Generating PDF...", { id: "pdf-export" });

      // Create a simplified version for PDF export
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        padding: 20px;
        z-index: -1;
      `;

      // Add report header
      const header = document.createElement('div');
      header.innerHTML = `
        <h1 style="font-size: 24px; margin-bottom: 10px; color: #000;">${reportData.type}</h1>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Generated on: ${reportData.generatedDate}</p>
        <hr style="border: 1px solid #ccc; margin: 20px 0;">
      `;
      pdfContent.appendChild(header);

      // Add report content based on type
      if (reportType === "monthly") {
        const summary = document.createElement('div');
        summary.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Collection</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalCollection}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Pending Fees</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.pendingFees}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Students Paid</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.studentsPaid}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Overdue Payments</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.overduePayments}</p>
            </div>
          </div>
        `;
        pdfContent.appendChild(summary);

        // Add monthly breakdown table
        const table = document.createElement('div');
        table.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Monthly Collection Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-weight: bold;">Month</th>
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-weight: bold;">Collected</th>
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-weight: bold;">Pending</th>
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-weight: bold;">Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.monthlyBreakdown.map(month => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 10px;">${month.month}</td>
                  <td style="border: 1px solid #ccc; padding: 10px; color: #000;">₹${month.collected.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 10px; color: #000;">₹${month.pending.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 10px; color: #000;">₹${month.overdue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        pdfContent.appendChild(table);
      }

      if (reportType === "classwise") {
        const summary = document.createElement('div');
        summary.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Classes</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalClasses}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Students</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalStudents}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Collection</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalCollection}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Pending</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalPending}</p>
            </div>
          </div>
        `;
        pdfContent.appendChild(summary);

        // Add class-wise table
        const table = document.createElement('div');
        table.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Class-wise Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Class</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Total Students</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Paid</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Pending</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Overdue</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Total Amount</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Collected</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;">Pending Amount</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.classData.map(classData => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">${classData.className}</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">${classData.totalStudents}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #000;">${classData.paidStudents}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #000;">${classData.pendingStudents}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #000;">${classData.overdueStudents}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #000;">₹${classData.totalAmount.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #000;">₹${classData.collectedAmount.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 8px; color: #000;">₹${classData.pendingAmount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        pdfContent.appendChild(table);
      }

      if (reportType === "yearly") {
        const summary = document.createElement('div');
        summary.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Students</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalStudents}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Collection</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalCollection}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Pending</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalPending}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; text-align: center;">
              <h3 style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Classes</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000;">${reportData.summary.totalClasses}</p>
            </div>
          </div>
        `;
        pdfContent.appendChild(summary);

        // Add monthly breakdown table
        const monthlyTable = document.createElement('div');
        monthlyTable.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Monthly Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Month</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Collected</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Pending</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.yearlyData.monthlyBreakdown.map(month => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 6px;">${month.month}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; color: #000;">₹${month.collected.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; color: #000;">₹${month.pending.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; color: #000;">₹${month.overdue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        pdfContent.appendChild(monthlyTable);

        // Add class breakdown table
        const classTable = document.createElement('div');
        classTable.innerHTML = `
          <h2 style="font-size: 18px; margin: 20px 0; color: #000;">Class-wise Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Class</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Total Students</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Total Collection</th>
                <th style="border: 1px solid #ccc; padding: 6px; text-align: left; font-weight: bold;">Total Pending</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(reportData.yearlyData.classBreakdown).map(classData => `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 6px;">${classData.className}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; color: #000;">${classData.totalStudents}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; color: #000;">₹${classData.totalCollection.toLocaleString()}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; color: #000;">₹${classData.totalPending.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        pdfContent.appendChild(classTable);
      }

      // Add to document temporarily
      document.body.appendChild(pdfContent);

      const canvas = await html2canvas(pdfContent, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false
      });

      // Remove from document
      document.body.removeChild(pdfContent);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${reportData.type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF exported successfully!", { id: "pdf-export" });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF", { id: "pdf-export" });
    } finally {
      setPdfExporting(false);
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
    if (activeTab === "overview") {
      fetchFeeOverview();
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
      paymentType: student.paymentType || "full",
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

  // Handle update status
  const handleUpdateStatus = (student) => {
    setSelectedStudent(student);
    setStatusUpdateData({
      paymentStatus: student.paymentStatus || "pending",
      remarks: "",
    });
    setShowUpdateStatusModal(true);
  };

  // Handle update status submit
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/students/${selectedStudent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentStatus: statusUpdateData.paymentStatus,
          remarks: statusUpdateData.remarks,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Payment status updated successfully");
        setShowUpdateStatusModal(false);
        fetchAllStudents(); // Refresh the student list
      } else {
        toast.error(data.message || "Error updating payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error updating payment status");
    }
  };

  // Handle mark all as paid - DISABLED (individual messaging only)
  const handleMarkAllAsPaid = async () => {
    toast.error("Bulk operations are disabled. Please use individual actions for each student.");
  };





  // Handle fee edit
  const handleFeeEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Calculate the new total fees paid by adding current payment to existing fees paid
      const newFeesPaid = (selectedStudent.feesPaid || 0) + (feeEditData.feesPaid || 0);
      
      const response = await fetch(`${appConfig.API_BASE_URL}/students/${selectedStudent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...feeEditData,
          feesPaid: newFeesPaid, // Update the total fees paid
          paymentDate: feeEditData.paymentDate || new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Fee payment updated successfully");
        setShowStudentEditModal(false);
        fetchAllStudents(); // Refresh the student list
      } else {
        toast.error(data.message || "Error updating fee payment");
      }
    } catch (error) {
      console.error("Error updating fee payment:", error);
      toast.error("Error updating fee payment");
    }
  };

  // Fee Reminder Functions
  const handleSendFeeReminder = (student) => {
    setSelectedStudentForReminder(student);
    const remainingAmount = ((student.feeSlabId?.totalAmount || 0)) - (student.feesPaid || 0);
    
    setFeeReminderData({
      subject: `Fee Reminder - ₹${remainingAmount.toLocaleString()} Remaining`,
      message: `Dear ${student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()},\n\nThis is a reminder that you have ₹${remainingAmount.toLocaleString()} remaining in your fee payment.\n\nPlease ensure timely payment to avoid any inconvenience.\n\nBest regards,\nSchool Administration`,
      priority: "medium",
    });
    setShowFeeReminderModal(true);
  };

  const handleSendFeeReminderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentForReminder) return;

    try {
      setSendingReminder(true);
      const remainingAmount = ((selectedStudentForReminder.feeSlabId?.totalAmount || 0)) - (selectedStudentForReminder.feesPaid || 0);
      
      const messageData = {
        studentId: selectedStudentForReminder._id,
        subject: feeReminderData.subject,
        message: feeReminderData.message,
        feeAmount: selectedStudentForReminder.feeSlabId?.totalAmount || 0,
        feeType: selectedStudentForReminder.feeSlabId?.slabName || "General",
        remainingAmount: remainingAmount,
        priority: feeReminderData.priority,
      };

      await apiService.messages.sendFeeReminder(messageData);
      
      toast.success("Fee reminder sent successfully!");
      setShowFeeReminderModal(false);
      setSelectedStudentForReminder(null);
      setFeeReminderData({
        subject: "",
        message: "",
        priority: "medium",
      });
    } catch (error) {
      console.error("Error sending fee reminder:", error);
      toast.error("Failed to send fee reminder");
    } finally {
      setSendingReminder(false);
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
                <button 
                  onClick={generateYearlyReport}
                  disabled={reportLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {reportLoading ? "Generating..." : "Export Yearly Report"}
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
                <>
                  {overviewLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading fee overview data...</p>
                      </div>
                    </div>
                  ) : (
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
                          {monthlyData && monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                          <Legend />
                          <Line type="monotone" dataKey="collected" stroke="#3B82F6" strokeWidth={2} name="Collected" />
                          <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
                          <Line type="monotone" dataKey="overdue" stroke="#EF4444" strokeWidth={2} name="Overdue" />
                        </LineChart>
                      </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                              <p>No monthly data available</p>
                            </div>
                          )}
                    </div>

                    {/* Payment Methods Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                      <div>
                        <div className="text-xs text-gray-500 mb-2">
                          Debug: {displayPaymentMethods.length} payment methods found
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={displayPaymentMethods}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {displayPaymentMethods.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    </div>
                    </motion.div>
                  )}
                </>
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
                      {/* Separate Filter Dropdowns */}
                      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Fee Slab</label>
                          <select
                            value={feeSlabFilter}
                            onChange={e => setFeeSlabFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                          >
                            <option value="">All</option>
                            {feeSlabOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                          <select
                            value={classFilter}
                            onChange={e => setClassFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                          >
                            <option value="">All</option>
                            {classOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                          >
                            <option value="">All</option>
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Students List */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Students ({filteredAndSortedStudents.length})
                      </h3>
                      <div className="flex space-x-2">
                        <span className="text-sm text-gray-600">
                          Individual messaging enabled
                        </span>
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
                                Student
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
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedStudents.map((student) => (
                              <tr key={student._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.name || `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim()}
                                    </div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.feeSlabId?.slabName || 
                                   student.feeStructure || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(student.feeSlabId?.totalAmount || 
                                     0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{student.feesPaid?.toLocaleString() || "0"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(((student.feeSlabId?.totalAmount || 
                                       0)) - (student.feesPaid || 0)).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.paymentDate ? new Date(student.paymentDate).toLocaleDateString() : "N/A"}
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
                                      onClick={() => handleUpdateStatus(student)}
                                    className="text-purple-600 hover:text-purple-900 mr-3"
                                    title="Update Status"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleSendFeeReminder(student)}
                                      className="text-orange-600 hover:text-orange-900 mr-3"
                                      title="Send Fee Reminder"
                                    >
                                      <Bell className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>


                </div>
              )}

              {activeTab === "reports" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={generateMonthlyReport}
                        disabled={reportLoading}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reportLoading && reportType === "monthly" ? (
                          <div className="w-5 h-5 mr-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                        <FileText className="w-5 h-5 mr-3 text-blue-600" />
                        )}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Monthly Report</div>
                          <div className="text-sm text-gray-500">Generate monthly fee collection report</div>
                        </div>
                      </button>
                      <button 
                        onClick={generateClassWiseReport}
                        disabled={reportLoading}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reportLoading && reportType === "classwise" ? (
                          <div className="w-5 h-5 mr-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                        <FileText className="w-5 h-5 mr-3 text-green-600" />
                        )}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Class-wise Report</div>
                          <div className="text-sm text-gray-500">Fee collection by class</div>
                        </div>
                      </button>
                      <button 
                        onClick={generateYearlyReport}
                        disabled={reportLoading}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reportLoading && reportType === "yearly" ? (
                          <div className="w-5 h-5 mr-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                        <FileText className="w-5 h-5 mr-3 text-green-600" />
                        )}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Yearly Report</div>
                          <div className="text-sm text-gray-500">Annual fee collection summary</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && reportData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 border w-4/5 max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">{reportData.type}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    disabled={pdfExporting}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pdfExporting ? (
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {pdfExporting ? "Generating PDF..." : "Export PDF"}
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
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
              </div>

              <div id="report-content" className="space-y-6">
                {/* Report Header */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{reportData.type}</h4>
                      <p className="text-sm text-gray-600">Generated on: {reportData.generatedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">School Admin Portal</p>
                      <p className="text-sm text-gray-600">Fee Management System</p>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                {reportType === "monthly" && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-500">Total Collection</h5>
                        <p className="text-2xl font-bold text-green-600">{reportData.summary.totalCollection}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-500">Pending Fees</h5>
                        <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pendingFees}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-500">Students Paid</h5>
                        <p className="text-2xl font-bold text-blue-600">{reportData.summary.studentsPaid}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-500">Overdue Payments</h5>
                        <p className="text-2xl font-bold text-red-600">{reportData.summary.overduePayments}</p>
                      </div>
                    </div>

                    {/* Monthly Breakdown Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <h5 className="text-lg font-semibold text-gray-900 p-4 border-b">Monthly Collection Breakdown</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.monthlyBreakdown.map((month, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{month.collected.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">₹{month.pending.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{month.overdue.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {reportType === "classwise" && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Summary</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Classes</p>
                          <p className="text-xl font-bold text-blue-600">{reportData.summary.totalClasses}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Students</p>
                          <p className="text-xl font-bold text-green-600">{reportData.summary.totalStudents}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Collection</p>
                          <p className="text-xl font-bold text-green-600">{reportData.summary.totalCollection}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Pending</p>
                          <p className="text-xl font-bold text-yellow-600">{reportData.summary.totalPending}</p>
                        </div>
                      </div>
                    </div>

                    {/* Class-wise Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <h5 className="text-lg font-semibold text-gray-900 p-4 border-b">Class-wise Breakdown</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Amount</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.classData.map((classData, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classData.className}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classData.totalStudents}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{classData.paidStudents}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{classData.pendingStudents}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{classData.overdueStudents}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{classData.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{classData.collectedAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">₹{classData.pendingAmount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {reportType === "yearly" && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Summary</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Students</p>
                          <p className="text-xl font-bold text-blue-600">{reportData.summary.totalStudents}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Collection</p>
                          <p className="text-xl font-bold text-green-600">{reportData.summary.totalCollection}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Pending</p>
                          <p className="text-xl font-bold text-yellow-600">{reportData.summary.totalPending}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Classes</p>
                          <p className="text-xl font-bold text-purple-600">{reportData.summary.totalClasses}</p>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <h5 className="text-lg font-semibold text-gray-900 p-4 border-b">Monthly Breakdown</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.yearlyData.monthlyBreakdown.map((month, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{month.collected.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">₹{month.pending.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{month.overdue.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Class Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <h5 className="text-lg font-semibold text-gray-900 p-4 border-b">Class-wise Breakdown</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Collection</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pending</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.values(reportData.yearlyData.classBreakdown).map((classData, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classData.className}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classData.totalStudents}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{classData.totalCollection.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">₹{classData.totalPending.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                      selectedStudent.feeStructure || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> ₹{(selectedStudent.feeSlabId?.totalAmount || 
                      0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Remaining Fees:</strong> ₹{(((selectedStudent.feeSlabId?.totalAmount || 0)) - (selectedStudent.feesPaid || 0)).toLocaleString()}
                  </p>
                  {selectedStudent.feeSlabId?.installments && selectedStudent.feeSlabId.installments.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Installment Schedule</h4>
                      <div className="space-y-2">
                        {selectedStudent.feeSlabId.installments.map((installment, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Installment {installment.installmentNumber}: ₹{installment.amount.toLocaleString()}
                            </span>
                            <span className="text-gray-500">
                              Due: {new Date(installment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleFeeEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                    <select
                      value={feeEditData.paymentType || "full"}
                      onChange={(e) => setFeeEditData({ ...feeEditData, paymentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="full">Full Payment</option>
                      <option value="installment">Installment Payment</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previously Paid Fees (₹)</label>
                    <input
                      type="number"
                      value={selectedStudent.feesPaid || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                      readOnly
                      placeholder="Previously paid amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Payment (₹)</label>
                    <input
                      type="number"
                      value={feeEditData.feesPaid}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const maxAmount = ((selectedStudent.feeSlabId?.totalAmount || 0) - (selectedStudent.feesPaid || 0));
                        if (value <= maxAmount) {
                          setFeeEditData({ ...feeEditData, feesPaid: value });
                        }
                      }}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current payment amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Fees (₹)</label>
                    <input
                      type="text"
                      value={(
                        (selectedStudent.feeSlabId?.totalAmount || 0)
                        - (selectedStudent.feesPaid || 0)
                        - (feeEditData.feesPaid || 0)
                      ).toLocaleString()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                      readOnly
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
                        selectedStudent.feeStructure || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium ml-2">₹{(selectedStudent.feeSlabId?.totalAmount || 
                        0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fees Paid:</span>
                      <span className="font-medium ml-2">₹{selectedStudent.feesPaid?.toLocaleString() || "0"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining Amount:</span>
                      <span className="font-medium ml-2">₹{(((selectedStudent.feeSlabId?.totalAmount || 
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

                {/* Installment Information */}
                {selectedStudent.feeSlabId?.installments && selectedStudent.feeSlabId.installments.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Installment Schedule</h4>
                    <div className="space-y-3">
                      {selectedStudent.feeSlabId.installments.map((installment, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              Installment {installment.installmentNumber}
                            </div>
                            <div className="text-sm text-gray-600">
                              Due: {new Date(installment.dueDate).toLocaleDateString()}
                            </div>
                            {installment.description && (
                              <div className="text-sm text-gray-500">
                                {installment.description}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₹{installment.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {installment.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* Update Status Modal */}
        {showUpdateStatusModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
                <button
                  onClick={() => setShowUpdateStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Student:</strong> {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.middleName || ''} ${selectedStudent.lastName || ''}`.trim()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Total Amount:</strong> ₹{(selectedStudent.feeSlabId?.totalAmount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Fees Paid:</strong> ₹{(selectedStudent.feesPaid || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Remaining Fees:</strong> ₹{(((selectedStudent.feeSlabId?.totalAmount || 0)) - (selectedStudent.feesPaid || 0)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Status:</strong> 
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                    selectedStudent.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedStudent.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedStudent.paymentStatus || 'pending'}
                  </span>
                </p>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    value={statusUpdateData.paymentStatus}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={statusUpdateData.remarks}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any remarks about the status change..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateStatusModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fee Reminder Modal */}
        {showFeeReminderModal && selectedStudentForReminder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Fee Reminder</h3>
                <button
                  onClick={() => setShowFeeReminderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedStudentForReminder.name || `${selectedStudentForReminder.firstName || ''} ${selectedStudentForReminder.lastName || ''}`.trim()}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedStudentForReminder.email}
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span> ₹{(selectedStudentForReminder.feeSlabId?.totalAmount || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Fees Paid:</span> ₹{(selectedStudentForReminder.feesPaid || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Remaining Amount:</span> ₹{(((selectedStudentForReminder.feeSlabId?.totalAmount || 0)) - (selectedStudentForReminder.feesPaid || 0)).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                      selectedStudentForReminder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedStudentForReminder.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedStudentForReminder.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendFeeReminderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={feeReminderData.subject}
                    onChange={(e) => setFeeReminderData({ ...feeReminderData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter message subject..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={feeReminderData.message}
                    onChange={(e) => setFeeReminderData({ ...feeReminderData, message: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={feeReminderData.priority}
                    onChange={(e) => setFeeReminderData({ ...feeReminderData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFeeReminderModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={sendingReminder}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={sendingReminder}
                  >
                    {sendingReminder ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Send Reminder
                      </div>
                    )}
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
