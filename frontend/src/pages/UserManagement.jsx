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
    subjectsSpecializedIn: [],
    mediumOfInstruction: "",
    // Training Details
    inServiceTraining: false,
    ictTraining: false,
    flnTraining: false,
    inclusiveEducationTraining: false,
    // Posting & Work Details
    classesTaught: "",
    subjectsTaught: [],
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
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${appConfig.API_BASE_URL}/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

 

      const data = await response.json();
      console.log(data);
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/users/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
   

      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Error fetching subjects");
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
            <p className="text-gray-600">Manage teachers efficiently</p>
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
                        placeholder="Search users..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">All Roles</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                      <option value="student">Student</option>
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
                            User
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
                                  <div className="text-sm font-medium text-gray-900">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Specialized In</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {subjects.map((subject) => (
                            <label
                              key={subject._id}
                              className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(teacherForm.subjectsSpecializedIn || []).includes(subject._id)}
                                onChange={() => {
                                  setTeacherForm((prev) => {
                                    const current = prev.subjectsSpecializedIn || [];
                                    const updated = current.includes(subject._id)
                                      ? current.filter((id) => id !== subject._id)
                                      : [...current, subject._id];
                                    return {
                                      ...prev,
                                      subjectsSpecializedIn: updated,
                                      subjectsTaught: updated, // keep in sync
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {teacherForm.subjectsTaught?.map((subjectId) => (
                            <label
                              key={subjectId}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={teacherForm.subjectsTaught.includes(subjectId)}
                                onChange={() => {
                                  setTeacherForm((prev) => ({
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
                        <div className="mt-4">
                          {addingSubject ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Subject Name"
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
                      {uploadResults.success && uploadResults.data && uploadResults.data.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-md font-medium text-gray-900 mb-2">Created Teachers:</h5>
                          <ul className="list-disc list-inside text-gray-700">
                            {uploadResults.data.map((teacher, index) => (
                              <li key={index}>
                                {teacher.name} (ID: {teacher.employeeId})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {uploadResults.success && uploadResults.data && uploadResults.data.length === 0 && (
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
    </Layout>
  );
};

export default UserManagement;
