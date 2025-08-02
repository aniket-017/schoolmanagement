import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import { cn } from "../utils/cn";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  DocumentArrowUpIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Layout from "../components/Layout";
import TeacherCredentials from "../components/TeacherCredentials";
import { appConfig } from "../config/environment";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showCredentials, setShowCredentials] = useState(false);
  const [newTeacher, setNewTeacher] = useState(null);

  // Edit functionality state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // View details state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "",
    status: "",
    search: "",
  });

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    socialCategory: "",
    disabilityStatus: "",
    aadhaarNumber: "",
    // Professional Information
    teacherType: "",
    natureOfAppointment: "",
    appointedUnder: "",
    dateOfJoiningService: "",
    dateOfJoiningPresentSchool: "",
    udiseCodePreviousSchool: "",
    // Educational Qualification
    highestAcademicQualification: "",
    highestProfessionalQualification: "",
    subjects: [],
    mediumOfInstruction: "",
    // Training Details
    inServiceTraining: false,
    ictTraining: false,
    flnTraining: false,
    inclusiveEducationTraining: false,
    // Posting & Work Details
    classesTaught: "",
    periodsPerWeek: "",
    multipleSubjectsOrGrades: false,
    nonTeachingDuties: false,
    nonTeachingDutiesDetails: "",
    // Salary & Employment
    salaryBand: "",
    salaryPaymentMode: "",
    workingStatus: "",
    // Contact
    phone: "",
    email: "",
    // Address
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    socialCategory: "",
    disabilityStatus: "",
    aadhaarNumber: "",
    // Professional Information
    teacherType: "",
    natureOfAppointment: "",
    appointedUnder: "",
    dateOfJoiningService: "",
    dateOfJoiningPresentSchool: "",
    udiseCodePreviousSchool: "",
    // Educational Qualification
    highestAcademicQualification: "",
    highestProfessionalQualification: "",
    subjects: [],
    mediumOfInstruction: "",
    // Training Details
    inServiceTraining: false,
    ictTraining: false,
    flnTraining: false,
    inclusiveEducationTraining: false,
    // Posting & Work Details
    classesTaught: "",
    periodsPerWeek: "",
    multipleSubjectsOrGrades: false,
    nonTeachingDuties: false,
    nonTeachingDutiesDetails: "",
    // Salary & Employment
    salaryBand: "",
    salaryPaymentMode: "",
    workingStatus: "",
    // Contact
    phone: "",
    email: "",
    // Teaching Specializations
    teachingSpecializations: [],
    // Address
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Remove localSubjects and newSubjectName, add newSubject state for name/code
  const [newSubject, setNewSubject] = useState({ name: "" });
  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Bulk upload state
  const [uploadResults, setUploadResults] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeTab === "list") {
      fetchUsers();
    }
    if (activeTab === "add") {
      fetchSubjects();
    }
  }, [activeTab, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
      });

      if (filters.role) queryParams.append("role", filters.role);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(`${appConfig.API_BASE_URL}/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setPagination({
          current: data.pagination?.current || 1,
          total: data.pagination?.total || 1,
          totalUsers: data.pagination?.totalUsers || 0,
        });
      } else {
        toast.error("Error fetching users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/users/teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teacherForm),
      });

      const data = await response.json();
      if (data.success) {
        setNewTeacher(data.teacher);
        setShowCredentials(true);
        toast.success("Teacher created successfully!");

        // Reset form
        setTeacherForm({
          name: "",
          email: "",
          phone: "",
          qualification: "",
          experience: "",
          dateOfBirth: "",
          salary: "",
          subjects: [],
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
        });
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast.error("Error creating teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (user, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setEditingUser(data.user);
        // Fetch subjects for the edit form
        await fetchSubjects();
        // Debug: Log the subjects data
        console.log("User subjects data:", data.user.subjects);
        // Populate the edit form with user data
        setEditForm({
          firstName: data.user.firstName || "",
          middleName: data.user.middleName || "",
          lastName: data.user.lastName || "",
          gender: data.user.gender || "",
          dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split("T")[0] : "",
          socialCategory: data.user.socialCategory || "",
          disabilityStatus: data.user.disabilityStatus || "",
          aadhaarNumber: data.user.aadhaarNumber || "",
          teacherType: data.user.teacherType || "",
          natureOfAppointment: data.user.natureOfAppointment || "",
          appointedUnder: data.user.appointedUnder || "",
          dateOfJoiningService: data.user.dateOfJoiningService ? data.user.dateOfJoiningService.split("T")[0] : "",
          dateOfJoiningPresentSchool: data.user.dateOfJoiningPresentSchool
            ? data.user.dateOfJoiningPresentSchool.split("T")[0]
            : "",
          udiseCodePreviousSchool: data.user.udiseCodePreviousSchool || "",
          highestAcademicQualification: data.user.highestAcademicQualification || "",
          highestProfessionalQualification: data.user.highestProfessionalQualification || "",
          subjects: (data.user.subjects || []).map((subject) => (typeof subject === "string" ? subject : subject._id)),
          mediumOfInstruction: data.user.mediumOfInstruction || "",
          inServiceTraining: data.user.inServiceTraining || false,
          ictTraining: data.user.ictTraining || false,
          flnTraining: data.user.flnTraining || false,
          inclusiveEducationTraining: data.user.inclusiveEducationTraining || false,
          classesTaught: data.user.classesTaught || "",
          periodsPerWeek: data.user.periodsPerWeek || "",
          multipleSubjectsOrGrades: data.user.multipleSubjectsOrGrades || false,
          nonTeachingDuties: data.user.nonTeachingDuties || false,
          nonTeachingDutiesDetails: data.user.nonTeachingDutiesDetails || "",
          salaryBand: data.user.salaryBand || "",
          salaryPaymentMode: data.user.salaryPaymentMode || "",
          workingStatus: data.user.workingStatus || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          teachingSpecializations: data.user.teachingSpecializations || [],
          address: {
            street: data.user.address?.street || "",
            city: data.user.address?.city || "",
            state: data.user.address?.state || "",
            zipCode: data.user.address?.zipCode || "",
            country: data.user.address?.country || "",
          },
        });
        setShowEditModal(true);
      } else {
        toast.error("Error fetching user details for editing");
      }
    } catch (error) {
      console.error("Error fetching user details for editing:", error);
      toast.error("Error loading user details for editing");
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("User updated successfully!");
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/users/excel-template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "teachers_template.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Template downloaded successfully!");
      } else {
        toast.error("Error downloading template");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error downloading template");
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await fetch(`${appConfig.API_BASE_URL}/users/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setUploadResults(data);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResults({
        success: false,
        message: "Error uploading file",
      });
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setTeacherForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setTeacherForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubjectChange = (subjectId) => {
    setTeacherForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "approved" ? "suspended" : "approved";

      const response = await fetch(`${appConfig.API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        toast.success(`User status updated to ${newStatus}`);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user status");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${userName}"?\n\nThis action will permanently remove the user from the system and cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        toast.success(`User "${userName}" deleted successfully`);
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  const downloadPasswords = () => {
    if (!uploadResults?.results?.successful || uploadResults.results.successful.length === 0) {
      toast.error("No successful uploads to download passwords");
      return;
    }

    // Create CSV content
    const csvContent = [
      "Employee ID,Email,Temporary Password",
      ...uploadResults.results.successful.map(
        (item) => `${item.teacher.employeeId},"${item.teacher.email}","${item.teacher.tempPassword}"`
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher_passwords_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Password file downloaded successfully! (${uploadResults.results.successful.length} teachers)`);
  };

  const copyAllPasswords = () => {
    if (!uploadResults?.results?.successful || uploadResults.results.successful.length === 0) {
      toast.error("No successful uploads to copy passwords");
      return;
    }

    // Create formatted text
    const passwordText = uploadResults.results.successful
      .map(
        (item) =>
          `Employee ID: ${item.teacher.employeeId}\nEmail: ${item.teacher.email}\nPassword: ${item.teacher.tempPassword}\n`
      )
      .join("\n---\n");

    // Copy to clipboard
    navigator.clipboard
      .writeText(passwordText)
      .then(() => {
        toast.success(`All passwords copied to clipboard! (${uploadResults.results.successful.length} teachers)`);
      })
      .catch(() => {
        toast.error("Failed to copy passwords");
      });
  };

  // Add this function to create a new subject globally
  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) return;
    setSubjectLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${appConfig.API_BASE_URL}/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSubject.name }),
      });
      const data = await res.json();
      if (data.success) {
        setNewSubject({ name: "" });
        setAddingSubject(false);
        fetchSubjects(); // Refresh global subject list
        toast.success("Subject added!");
      } else {
        toast.error(data.message || "Error adding subject");
      }
    } catch (err) {
      toast.error("Error adding subject");
    } finally {
      setSubjectLoading(false);
    }
  };

  const tabConfig = [
    { id: "list", name: "Teacher List", icon: UsersIcon, color: "indigo" },
    { id: "add", name: "Add Teacher", icon: UserPlusIcon, color: "emerald" },
    { id: "bulk", name: "Bulk Upload", icon: DocumentArrowUpIcon, color: "purple" },
  ];

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Management</h1>
            <p className="text-gray-600">Manage teachers and administrative staff. Students are managed separately in the Student Management section.</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200",
                      activeTab === tab.id
                        ? tab.color === "indigo"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : tab.color === "emerald"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-purple-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mr-2", activeTab === tab.id ? "text-white" : "text-gray-500")} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm">
            {/* User List Tab */}
            {activeTab === "list" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="search"
                        placeholder="Search teachers by name, email, phone, or employee ID..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        title="Search across: First Name, Middle Name, Last Name, Email, Phone Number, Employee ID"
                      />
                    </div>

                    <select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">All Teacher Roles</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                      <option value="principal">Principal</option>
                    </select>

                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <select
                      name="limit"
                      value={filters.limit}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>
                  </div>

                  {/* Search Results Indicator */}
                  {filters.search && (
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
                        <span>
                          Showing results for: <span className="font-medium text-gray-900">"{filters.search}"</span>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, search: "" }));
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* User Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teacher/Staff
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subjects
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Password Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-indigo-700">
                                      {(
                                        user.name?.charAt(0) ||
                                        user.firstName?.charAt(0) ||
                                        user.fullName?.charAt(0) ||
                                        user.email?.charAt(0) ||
                                        "?"
                                      ).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div
                                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => handleViewDetails(user)}
                                    title="Click to view details"
                                  >
                                    {user.name ||
                                      user.fullName ||
                                      [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") ||
                                      user.email}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === "teacher"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : user.role === "principal"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.role === "teacher" && user.subjects && user.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.subjects.slice(0, 3).map((subject, index) => (
                                    <span
                                      key={subject._id || index}
                                      className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                    >
                                      {subject.name}
                                    </span>
                                  ))}
                                  {user.subjects.length > 3 && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                      +{user.subjects.length - 3} more
                                    </span>
                                  )}
                                </div>
                              ) : user.role === "teacher" ? (
                                <span className="text-xs text-gray-400 italic">No subjects assigned</span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.isFirstLogin ? (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
                                  First Login
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                  Changed
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => toggleUserStatus(user._id, user.status)}
                                  className={`${
                                    user.status === "approved"
                                      ? "text-red-600 hover:text-red-900"
                                      : "text-green-600 hover:text-green-900"
                                  } transition-colors`}
                                >
                                  {user.status === "approved" ? "Suspend" : "Activate"}
                                </button>
                                {user.role === "teacher" && (
                                  <button
                                    onClick={(e) => handleEditClick(user, e)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit Teacher"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user._id, user.name || user.firstName || user.email)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete User"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(pagination.current - 1) * filters.limit + 1} to{" "}
                      {Math.min(pagination.current * filters.limit, pagination.totalUsers)} of {pagination.totalUsers}{" "}
                      users
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.current === 1}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                        Page {pagination.current} of {pagination.total}
                      </span>
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.current === pagination.total}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Teacher Tab */}
            {activeTab === "add" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Add New Teacher</h2>
                  <p className="text-gray-600">Fill in the details to create a new teacher account</p>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={teacherForm.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                        <input
                          type="text"
                          name="middleName"
                          value={teacherForm.middleName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={teacherForm.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={teacherForm.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={teacherForm.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Social Category</label>
                        <select
                          name="socialCategory"
                          value={teacherForm.socialCategory}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="General">General</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="OBC">OBC</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Disability Status</label>
                        <input
                          type="text"
                          name="disabilityStatus"
                          value={teacherForm.disabilityStatus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={teacherForm.aadhaarNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Professional Information */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Type</label>
                        <select
                          name="teacherType"
                          value={teacherForm.teacherType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="Head Teacher">Head Teacher</option>
                          <option value="Assistant Teacher">Assistant Teacher</option>
                          <option value="Principal">Principal</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nature of Appointment</label>
                        <select
                          name="natureOfAppointment"
                          value={teacherForm.natureOfAppointment}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="Regular">Regular</option>
                          <option value="Contractual">Contractual</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Appointed Under</label>
                        <select
                          name="appointedUnder"
                          value={teacherForm.appointedUnder}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="State Govt">State Govt</option>
                          <option value="Central Govt">Central Govt</option>
                          <option value="SSA">SSA</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining Service</label>
                        <input
                          type="date"
                          name="dateOfJoiningService"
                          value={teacherForm.dateOfJoiningService}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Joining Present School
                        </label>
                        <input
                          type="date"
                          name="dateOfJoiningPresentSchool"
                          value={teacherForm.dateOfJoiningPresentSchool}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UDISE Code of Previous School
                        </label>
                        <input
                          type="text"
                          name="udiseCodePreviousSchool"
                          value={teacherForm.udiseCodePreviousSchool}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Educational Qualification */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Educational Qualification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Highest Academic Qualification
                        </label>
                        <input
                          type="text"
                          name="highestAcademicQualification"
                          value={teacherForm.highestAcademicQualification}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Highest Professional Qualification
                        </label>
                        <input
                          type="text"
                          name="highestProfessionalQualification"
                          value={teacherForm.highestProfessionalQualification}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {subjects.map((subject) => (
                            <label
                              key={subject._id}
                              className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(teacherForm.subjects || []).some((subjectId) =>
                                  typeof subjectId === "string"
                                    ? subjectId === subject._id
                                    : subjectId._id === subject._id
                                )}
                                onChange={() => {
                                  setTeacherForm((prev) => {
                                    const current = prev.subjects || [];
                                    const isSelected = current.some((subjectId) =>
                                      typeof subjectId === "string"
                                        ? subjectId === subject._id
                                        : subjectId._id === subject._id
                                    );
                                    const updated = isSelected
                                      ? current.filter((id) =>
                                          typeof id === "string" ? id !== subject._id : id._id !== subject._id
                                        )
                                      : [...current, subject._id];
                                    return {
                                      ...prev,
                                      subjects: updated,
                                    };
                                  });
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                              <span>{subject.name}</span>
                            </label>
                          ))}
                        </div>
                        {addingSubject ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Add New Subject"
                              value={newSubject.name}
                              onChange={(e) => setNewSubject((s) => ({ ...s, name: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={handleAddSubject}
                              disabled={subjectLoading}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                              {subjectLoading ? "Adding..." : "Add"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingSubject(false)}
                              className="px-2 py-2 text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingSubject(true)}
                            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          >
                            + Add New Subject
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medium of Instruction Known
                        </label>
                        <input
                          type="text"
                          name="mediumOfInstruction"
                          value={teacherForm.mediumOfInstruction}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Training Details */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Training Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="inServiceTraining"
                          checked={teacherForm.inServiceTraining}
                          onChange={(e) => setTeacherForm((prev) => ({ ...prev, inServiceTraining: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        In-service Training Received
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="ictTraining"
                          checked={teacherForm.ictTraining}
                          onChange={(e) => setTeacherForm((prev) => ({ ...prev, ictTraining: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        ICT Training Received
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="flnTraining"
                          checked={teacherForm.flnTraining}
                          onChange={(e) => setTeacherForm((prev) => ({ ...prev, flnTraining: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        Foundational Literacy and Numeracy (FLN) Training
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="inclusiveEducationTraining"
                          checked={teacherForm.inclusiveEducationTraining}
                          onChange={(e) =>
                            setTeacherForm((prev) => ({ ...prev, inclusiveEducationTraining: e.target.checked }))
                          }
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        Inclusive Education Training
                      </label>
                    </div>
                  </div>
                  {/* Posting & Work Details */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Posting & Work Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Class or Classes Taught</label>
                        <input
                          type="text"
                          name="classesTaught"
                          value={teacherForm.classesTaught}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of periods per week
                        </label>
                        <input
                          type="number"
                          name="periodsPerWeek"
                          value={teacherForm.periodsPerWeek}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="multipleSubjectsOrGrades"
                          checked={teacherForm.multipleSubjectsOrGrades}
                          onChange={(e) =>
                            setTeacherForm((prev) => ({ ...prev, multipleSubjectsOrGrades: e.target.checked }))
                          }
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        Handling multiple subjects or grades
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="nonTeachingDuties"
                          checked={teacherForm.nonTeachingDuties}
                          onChange={(e) => setTeacherForm((prev) => ({ ...prev, nonTeachingDuties: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        Involved in non-teaching duties
                      </label>
                      {teacherForm.nonTeachingDuties && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Non-teaching Duties Details
                          </label>
                          <input
                            type="text"
                            name="nonTeachingDutiesDetails"
                            value={teacherForm.nonTeachingDutiesDetails}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Salary & Employment */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Salary & Employment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Salary Band</label>
                        <input
                          type="text"
                          name="salaryBand"
                          value={teacherForm.salaryBand}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Salary Payment</label>
                        <select
                          name="salaryPaymentMode"
                          value={teacherForm.salaryPaymentMode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash">Cash</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Status</label>
                        <select
                          name="workingStatus"
                          value={teacherForm.workingStatus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select</option>
                          <option value="Active">Active</option>
                          <option value="Transferred">Transferred</option>
                          <option value="Retired">Retired</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={teacherForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                        <input
                          type="email"
                          name="email"
                          value={teacherForm.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Address Information (keep as is) */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          name="address.street"
                          placeholder="123 Main Street"
                          value={teacherForm.address.street}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="address.city"
                          placeholder="City"
                          value={teacherForm.address.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          name="address.state"
                          placeholder="State"
                          value={teacherForm.address.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          placeholder="12345"
                          value={teacherForm.address.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="address.country"
                          placeholder="Country"
                          value={teacherForm.address.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Creating Teacher..." : "Create Teacher"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bulk Upload Tab */}
            {activeTab === "bulk" && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Bulk Upload Teachers</h2>
                  <p className="text-gray-600">Upload multiple teachers at once using an Excel file</p>
                </div>

                {/* Download Template */}
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Step 1: Download Template</h3>
                  <p className="text-blue-700 mb-4">
                    Download the Excel template with the required format for teacher information.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download Excel Template
                  </button>
                </div>

                {/* Upload Area */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Step 2: Upload Filled Template</h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <DocumentArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    {isDragActive ? (
                      <p className="text-purple-600 font-medium">Drop the Excel file here...</p>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium mb-2">
                          Drag and drop an Excel file here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">Supports .xlsx and .xls files only</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Upload Status */}
                {isUploading && (
                  <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                      <span className="text-yellow-800 font-medium">Processing Excel file...</span>
                    </div>
                  </div>
                )}

                {/* Upload Results */}
                {uploadResults && (
                  <div className="space-y-6">
                    <div
                      className={`p-6 rounded-lg ${
                        uploadResults.success
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Results</h4>
                      <p className="text-gray-700">{uploadResults.message}</p>

                      {/* Successful Teachers */}
                      {uploadResults.results?.successful && uploadResults.results.successful.length > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-md font-medium text-green-700">
                              ✅ Successfully Created ({uploadResults.results.successful.length}):
                            </h5>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">
                                {uploadResults.results.successful.length} teacher
                                {uploadResults.results.successful.length !== 1 ? "s" : ""} with passwords
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={downloadPasswords}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  title="Download all passwords as CSV"
                                >
                                  📥 Download CSV
                                </button>
                                <button
                                  onClick={copyAllPasswords}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                  title="Copy all passwords to clipboard"
                                >
                                  📋 Copy All
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {uploadResults.results.successful.map((item, index) => (
                              <div key={index} className="bg-green-50 p-3 rounded border border-green-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900">{item.teacher.name}</p>
                                    <p className="text-sm text-gray-600">Employee ID: {item.teacher.employeeId}</p>
                                    <p className="text-sm text-gray-600">Email: {item.teacher.email}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">Temporary Password:</p>
                                    <p className="text-sm bg-yellow-100 px-2 py-1 rounded font-mono text-gray-800">
                                      {item.teacher.tempPassword}
                                    </p>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(item.teacher.tempPassword)}
                                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                    >
                                      Copy Password
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Failed Entries */}
                      {uploadResults.results?.failed && uploadResults.results.failed.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-md font-medium text-red-700 mb-2">
                            ❌ Failed Entries ({uploadResults.results.failed.length}):
                          </h5>
                          <div className="space-y-2">
                            {uploadResults.results.failed.map((item, index) => (
                              <div key={index} className="bg-red-50 p-3 rounded border border-red-200">
                                <p className="text-sm font-medium text-gray-900">Row {item.row}:</p>
                                <p className="text-sm text-red-600">{item.error}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Duplicate Entries */}
                      {uploadResults.results?.duplicates && uploadResults.results.duplicates.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-md font-medium text-yellow-700 mb-2">
                            ⚠️ Duplicate Entries ({uploadResults.results.duplicates.length}):
                          </h5>
                          <div className="space-y-2">
                            {uploadResults.results.duplicates.map((item, index) => (
                              <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                <p className="text-sm font-medium text-gray-900">Row {item.row}:</p>
                                <p className="text-sm text-yellow-600">{item.error}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {uploadResults.success &&
                        (!uploadResults.results?.successful || uploadResults.results.successful.length === 0) && (
                          <p className="text-gray-700">No new teachers were created from the uploaded file.</p>
                        )}
                      {!uploadResults.success && <p className="text-red-700">{uploadResults.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showCredentials && newTeacher && (
        <TeacherCredentials
          teacher={newTeacher}
          onClose={() => {
            setShowCredentials(false);
            setNewTeacher(null);
          }}
        />
      )}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 border w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
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
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={editForm.middleName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Category</label>
                  <input
                    type="text"
                    name="socialCategory"
                    value={editForm.socialCategory}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disability Status</label>
                  <input
                    type="text"
                    name="disabilityStatus"
                    value={editForm.disabilityStatus}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={editForm.aadhaarNumber}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Type</label>
                  <select
                    name="teacherType"
                    value={editForm.teacherType}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="Head Teacher">Head Teacher</option>
                    <option value="Assistant Teacher">Assistant Teacher</option>
                    <option value="Principal">Principal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nature of Appointment</label>
                  <select
                    name="natureOfAppointment"
                    value={editForm.natureOfAppointment}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="Regular">Regular</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointed Under</label>
                  <select
                    name="appointedUnder"
                    value={editForm.appointedUnder}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="State Govt">State Govt</option>
                    <option value="Central Govt">Central Govt</option>
                    <option value="SSA">SSA</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining Service</label>
                  <input
                    type="date"
                    name="dateOfJoiningService"
                    value={editForm.dateOfJoiningService}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining Present School</label>
                  <input
                    type="date"
                    name="dateOfJoiningPresentSchool"
                    value={editForm.dateOfJoiningPresentSchool}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UDISE Code of Previous School</label>
                  <input
                    type="text"
                    name="udiseCodePreviousSchool"
                    value={editForm.udiseCodePreviousSchool}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              {/* Educational Qualification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Highest Academic Qualification</label>
                  <input
                    type="text"
                    name="highestAcademicQualification"
                    value={editForm.highestAcademicQualification}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Professional Qualification
                  </label>
                  <input
                    type="text"
                    name="highestProfessionalQualification"
                    value={editForm.highestProfessionalQualification}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {subjects.map((subject) => (
                      <label
                        key={subject._id}
                        className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(editForm.subjects || []).some((subjectId) =>
                            typeof subjectId === "string" ? subjectId === subject._id : subjectId._id === subject._id
                          )}
                          onChange={() => {
                            setEditForm((prev) => {
                              const current = prev.subjects || [];
                              const isSelected = current.some((subjectId) =>
                                typeof subjectId === "string"
                                  ? subjectId === subject._id
                                  : subjectId._id === subject._id
                              );
                              const updated = isSelected
                                ? current.filter((id) =>
                                    typeof id === "string" ? id !== subject._id : id._id !== subject._id
                                  )
                                : [...current, subject._id];
                              return {
                                ...prev,
                                subjects: updated,
                              };
                            });
                          }}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span>{subject.name}</span>
                      </label>
                    ))}
                  </div>
                  {addingSubject ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Add New Subject"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject((s) => ({ ...s, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        disabled={subjectLoading}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        {subjectLoading ? "Adding..." : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingSubject(false)}
                        className="px-2 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingSubject(true)}
                      className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      + Add New Subject
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medium of Instruction Known</label>
                  <input
                    type="text"
                    name="mediumOfInstruction"
                    value={editForm.mediumOfInstruction}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              {/* Training Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="inServiceTraining"
                    checked={editForm.inServiceTraining}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, inServiceTraining: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  In-service Training Received
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="ictTraining"
                    checked={editForm.ictTraining}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, ictTraining: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  ICT Training Received
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="flnTraining"
                    checked={editForm.flnTraining}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, flnTraining: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  Foundational Literacy and Numeracy (FLN) Training
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="inclusiveEducationTraining"
                    checked={editForm.inclusiveEducationTraining}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, inclusiveEducationTraining: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  Inclusive Education Training
                </label>
              </div>
              {/* Posting & Work Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class or Classes Taught</label>
                  <input
                    type="text"
                    name="classesTaught"
                    value={editForm.classesTaught}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of periods per week</label>
                  <input
                    type="number"
                    name="periodsPerWeek"
                    value={editForm.periodsPerWeek}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="multipleSubjectsOrGrades"
                    checked={editForm.multipleSubjectsOrGrades}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, multipleSubjectsOrGrades: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  Handling multiple subjects or grades
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="nonTeachingDuties"
                    checked={editForm.nonTeachingDuties}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, nonTeachingDuties: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  Involved in non-teaching duties
                </label>
                {editForm.nonTeachingDuties && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Non-teaching Duties Details</label>
                    <input
                      type="text"
                      name="nonTeachingDutiesDetails"
                      value={editForm.nonTeachingDutiesDetails}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
              {/* Salary & Employment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Band</label>
                  <input
                    type="text"
                    name="salaryBand"
                    value={editForm.salaryBand}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Salary Payment</label>
                  <select
                    name="salaryPaymentMode"
                    value={editForm.salaryPaymentMode}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Status</label>
                  <select
                    name="workingStatus"
                    value={editForm.workingStatus}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              {/* Address Information (keep as is) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      placeholder="123 Main Street"
                      value={editForm.address.street}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="address.city"
                      placeholder="City"
                      value={editForm.address.city}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="address.state"
                      placeholder="State"
                      value={editForm.address.state}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      placeholder="12345"
                      value={editForm.address.zipCode}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      placeholder="Country"
                      value={editForm.address.country}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editLoading ? "Updating User..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Credentials Modal */}
      {showCredentials && newTeacher && (
        <TeacherCredentials
          teacher={newTeacher}
          onClose={() => {
            setShowCredentials(false);
            setNewTeacher(null);
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserPlusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Teacher</h2>
                    <p className="text-gray-600">Update teacher details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        value={editForm.middleName}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editForm.dateOfBirth}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Category</label>
                      <select
                        name="socialCategory"
                        value={editForm.socialCategory}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="General">General</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Disability Status</label>
                      <input
                        type="text"
                        name="disabilityStatus"
                        value={editForm.disabilityStatus}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={editForm.aadhaarNumber}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Type</label>
                      <select
                        name="teacherType"
                        value={editForm.teacherType}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="Head Teacher">Head Teacher</option>
                        <option value="Assistant Teacher">Assistant Teacher</option>
                        <option value="Principal">Principal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nature of Appointment</label>
                      <select
                        name="natureOfAppointment"
                        value={editForm.natureOfAppointment}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="Regular">Regular</option>
                        <option value="Contractual">Contractual</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Appointed Under</label>
                      <select
                        name="appointedUnder"
                        value={editForm.appointedUnder}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="State Govt">State Govt</option>
                        <option value="Central Govt">Central Govt</option>
                        <option value="SSA">SSA</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining Service</label>
                      <input
                        type="date"
                        name="dateOfJoiningService"
                        value={editForm.dateOfJoiningService}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Joining Present School
                      </label>
                      <input
                        type="date"
                        name="dateOfJoiningPresentSchool"
                        value={editForm.dateOfJoiningPresentSchool}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UDISE Code of Previous School
                      </label>
                      <input
                        type="text"
                        name="udiseCodePreviousSchool"
                        value={editForm.udiseCodePreviousSchool}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Educational Qualification */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Educational Qualification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Academic Qualification
                      </label>
                      <input
                        type="text"
                        name="highestAcademicQualification"
                        value={editForm.highestAcademicQualification}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Professional Qualification
                      </label>
                      <input
                        type="text"
                        name="highestProfessionalQualification"
                        value={editForm.highestProfessionalQualification}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {subjects.map((subject) => (
                          <label
                            key={subject._id}
                            className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(editForm.subjects || []).includes(subject._id)}
                              onChange={() => {
                                setEditForm((prev) => {
                                  const current = prev.subjects || [];
                                  const updated = current.includes(subject._id)
                                    ? current.filter((id) => id !== subject._id)
                                    : [...current, subject._id];
                                  return {
                                    ...prev,
                                    subjects: updated,
                                  };
                                });
                              }}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <span>{subject.name}</span>
                          </label>
                        ))}
                      </div>
                      {addingSubject ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Add New Subject"
                            value={newSubject.name}
                            onChange={(e) => setNewSubject((s) => ({ ...s, name: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleAddSubject}
                            disabled={subjectLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            {subjectLoading ? "Adding..." : "Add"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingSubject(false)}
                            className="px-2 py-2 text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingSubject(true)}
                          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          + Add New Subject
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medium of Instruction Known
                      </label>
                      <input
                        type="text"
                        name="mediumOfInstruction"
                        value={editForm.mediumOfInstruction}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Training Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Training Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="inServiceTraining"
                        checked={editForm.inServiceTraining}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, inServiceTraining: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      In-service Training Received
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="ictTraining"
                        checked={editForm.ictTraining}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, ictTraining: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      ICT Training Received
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="flnTraining"
                        checked={editForm.flnTraining}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, flnTraining: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      Foundational Literacy and Numeracy (FLN) Training
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="inclusiveEducationTraining"
                        checked={editForm.inclusiveEducationTraining}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, inclusiveEducationTraining: e.target.checked }))
                        }
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      Inclusive Education Training
                    </label>
                  </div>
                </div>

                {/* Posting & Work Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Posting & Work Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class or Classes Taught</label>
                      <input
                        type="text"
                        name="classesTaught"
                        value={editForm.classesTaught}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {editForm.subjectsTaught?.map((subjectId) => (
                          <label
                            key={subjectId}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={editForm.subjectsTaught.includes(subjectId)}
                              onChange={() => {
                                setEditForm((prev) => ({
                                  ...prev,
                                  subjectsTaught: prev.subjectsTaught.includes(subjectId)
                                    ? prev.subjectsTaught.filter((id) => id !== subjectId)
                                    : [...prev.subjectsTaught, subjectId],
                                }));
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {subjects.find((s) => s._id === subjectId)?.name}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of periods per week</label>
                      <input
                        type="number"
                        name="periodsPerWeek"
                        value={editForm.periodsPerWeek}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="multipleSubjectsOrGrades"
                        checked={editForm.multipleSubjectsOrGrades}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, multipleSubjectsOrGrades: e.target.checked }))
                        }
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      Handling multiple subjects or grades
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="nonTeachingDuties"
                        checked={editForm.nonTeachingDuties}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, nonTeachingDuties: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      Involved in non-teaching duties
                    </label>
                    {editForm.nonTeachingDuties && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Non-teaching Duties Details
                        </label>
                        <input
                          type="text"
                          name="nonTeachingDutiesDetails"
                          value={editForm.nonTeachingDutiesDetails}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Salary & Employment */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Salary & Employment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salary Band</label>
                      <input
                        type="text"
                        name="salaryBand"
                        value={editForm.salaryBand}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Salary Payment</label>
                      <select
                        name="salaryPaymentMode"
                        value={editForm.salaryPaymentMode}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Working Status</label>
                      <select
                        name="workingStatus"
                        value={editForm.workingStatus}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        <option value="Active">Active</option>
                        <option value="Transferred">Transferred</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address.street"
                        placeholder="123 Main Street"
                        value={editForm.address.street}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="address.city"
                        placeholder="City"
                        value={editForm.address.city}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        name="address.state"
                        placeholder="State"
                        value={editForm.address.state}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                      <input
                        type="text"
                        name="address.zipCode"
                        placeholder="12345"
                        value={editForm.address.zipCode}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="address.country"
                        placeholder="Country"
                        value={editForm.address.country}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editLoading ? "Updating User..." : "Update User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">User Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
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
              {/* User Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-700">
                    {(
                      selectedUser.name?.charAt(0) ||
                      selectedUser.firstName?.charAt(0) ||
                      selectedUser.email?.charAt(0) ||
                      "?"
                    ).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedUser.name ||
                      selectedUser.fullName ||
                      [selectedUser.firstName, selectedUser.middleName, selectedUser.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      selectedUser.email}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.role === "teacher"
                          ? "bg-blue-100 text-blue-800"
                          : selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : selectedUser.role === "principal"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedUser.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.employeeId || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.gender || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedUser.dateOfBirth
                        ? new Date(selectedUser.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Social Category</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.socialCategory || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Disability Status</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.disabilityStatus || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.aadhaarNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information (for teachers) */}
              {selectedUser.role === "teacher" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teacher Type</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.teacherType || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nature of Appointment</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.natureOfAppointment || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Appointed Under</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.appointedUnder || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Joining Service</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedUser.dateOfJoiningService
                          ? new Date(selectedUser.dateOfJoiningService).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Joining Present School</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedUser.dateOfJoiningPresentSchool
                          ? new Date(selectedUser.dateOfJoiningPresentSchool).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UDISE Code Previous School</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedUser.udiseCodePreviousSchool || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Qualification (for teachers) */}
              {selectedUser.role === "teacher" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Educational Qualification</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Highest Academic Qualification</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedUser.highestAcademicQualification || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Highest Professional Qualification
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedUser.highestProfessionalQualification || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medium of Instruction</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.mediumOfInstruction || "Not provided"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Subjects</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedUser.subjects && selectedUser.subjects.length > 0 ? (
                          selectedUser.subjects.map((subject, index) => (
                            <span
                              key={subject._id || index}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {subject.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No subjects assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Training Details (for teachers) */}
              {selectedUser.role === "teacher" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Training Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded ${
                          selectedUser.inServiceTraining ? "bg-green-500" : "bg-gray-300"
                        } mr-2`}
                      ></span>
                      <span className="text-sm text-gray-900">In-Service Training</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded ${selectedUser.ictTraining ? "bg-green-500" : "bg-gray-300"} mr-2`}
                      ></span>
                      <span className="text-sm text-gray-900">ICT Training</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded ${selectedUser.flnTraining ? "bg-green-500" : "bg-gray-300"} mr-2`}
                      ></span>
                      <span className="text-sm text-gray-900">FLN Training</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded ${
                          selectedUser.inclusiveEducationTraining ? "bg-green-500" : "bg-gray-300"
                        } mr-2`}
                      ></span>
                      <span className="text-sm text-gray-900">Inclusive Education Training</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Details (for teachers) */}
              {selectedUser.role === "teacher" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Work Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Classes Taught</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.classesTaught || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Periods Per Week</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.periodsPerWeek || "Not provided"}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded ${
                          selectedUser.multipleSubjectsOrGrades ? "bg-green-500" : "bg-gray-300"
                        } mr-2`}
                      ></span>
                      <span className="text-sm text-gray-900">Multiple Subjects/Grades</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-4 h-4 rounded ${
                          selectedUser.nonTeachingDuties ? "bg-green-500" : "bg-gray-300"
                        } mr-2`}
                      ></span>
                      <span className="text-sm text-gray-900">Non-Teaching Duties</span>
                    </div>
                    {selectedUser.nonTeachingDuties && selectedUser.nonTeachingDutiesDetails && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Non-Teaching Duties Details</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedUser.nonTeachingDutiesDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Salary Information (for teachers) */}
              {selectedUser.role === "teacher" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Salary Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary Band</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.salaryBand || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary Payment Mode</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.salaryPaymentMode || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Working Status</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.workingStatus || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">Address Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.address?.street || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.address?.city || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.address?.state || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.address?.zipCode || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.address?.country || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">Account Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedUser.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password Status</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedUser.isFirstLogin ? "First Login Required" : "Password Changed"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedUser.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;
