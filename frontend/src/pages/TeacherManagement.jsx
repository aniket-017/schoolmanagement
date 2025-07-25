import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  BookOpen,
  Building,
  Search,
  Filter,
  Eye,
  Edit3,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import appConfig from "../config/environment";
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, filterStatus]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (filterStatus !== "all") {
        queryParams.append("status", filterStatus);
      }

      const response = await fetch(`${appConfig.API_BASE_URL}/teachers?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setTeachers(data.data || []);
        setTotalPages(data.pagination?.total || 1);
      } else {
        toast.error("Error fetching teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Error loading teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherClick = async (teacher) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/teachers/${teacher._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTeacher(data.data);
        setShowTeacherModal(true);
      } else {
        toast.error("Error fetching teacher details");
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      toast.error("Error loading teacher details");
    }
  };

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  const filteredTeachers = teachers.filter(
    (teacher) => {
      const teacherName = teacher.name || teacher.fullName || [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ") || teacher.email;
      return (
        teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.subjects &&
          teacher.subjects.some((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
  );

  const getWorkloadColor = (utilization) => {
    if (utilization >= 80) return "text-red-600";
    if (utilization >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getAvailabilityStatus = (teacher) => {
    const availability = teacher.availability;
    if (!availability) return { status: "Unknown", color: "text-gray-500" };

    const availableDays = Object.values(availability).filter((day) => day.available).length;
    if (availableDays === 6) return { status: "Full Time", color: "text-green-600" };
    if (availableDays >= 4) return { status: "Part Time", color: "text-blue-600" };
    return { status: "Limited", color: "text-orange-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="sm:hidden">
              <button onClick={handleBack} className="text-gray-600 hover:text-gray-900">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-gray-600 mt-2">Manage teacher lecture schedules and availability</p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{teachers.length} Teachers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search teachers by name, email, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => {
              const availabilityStatus = getAvailabilityStatus(teacher);
              const workloadStats = teacher.workloadStats || {};

              return (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTeacherClick(teacher)}
                >
                  <div className="p-6">
                    {/* Teacher Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                      {teacher.name || teacher.fullName || [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ") || teacher.email}
                    </h3>
                          <p className="text-sm text-gray-500">{teacher.email}</p>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${availabilityStatus.color} bg-opacity-10`}>
                        {availabilityStatus.status}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {teacher.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{teacher.email}</span>
                      </div>
                    </div>

                    {/* Experience and Qualifications */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{teacher.experience || 0} years</span>
                      </div>
                      {teacher.qualification && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>{teacher.qualification}</span>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Subjects</h4>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects &&
                          teacher.subjects.slice(0, 3).map((subject) => (
                            <span key={subject._id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {subject.name}
                            </span>
                          ))}
                        {teacher.subjects && teacher.subjects.length > 3 && (
                          <span className="text-xs text-gray-500">+{teacher.subjects.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Workload Stats */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Current Workload</span>
                        <span
                          className={`text-sm font-semibold ${getWorkloadColor(
                            workloadStats.utilizationPercentage || 0
                          )}`}
                        >
                          {workloadStats.totalCurrentPeriods || 0} periods/week
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (workloadStats.utilizationPercentage || 0) >= 80
                              ? "bg-red-500"
                              : (workloadStats.utilizationPercentage || 0) >= 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(workloadStats.utilizationPercentage || 0, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Utilization: {workloadStats.utilizationPercentage || 0}%</span>
                        <span>Max: {teacher.maxPeriodsPerDay || 8}/day</span>
                      </div>
                    </div>

                    {/* Specializations */}
                    {teacher.teachingSpecializations && teacher.teachingSpecializations.length > 0 && (
                      <div className="mt-3 flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-600">
                          Specialized in {teacher.teachingSpecializations.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Details Modal */}
      {showTeacherModal && selectedTeacher && (
        <TeacherDetailsModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowTeacherModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}
    </div>
  );
};

// Teacher Details Modal Component
const TeacherDetailsModal = ({ teacher, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "workload", label: "Workload", icon: TrendingUp },
    { id: "assignments", label: "Assignments", icon: BookOpen },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {teacher.teacher.name || teacher.teacher.fullName || [teacher.teacher.firstName, teacher.teacher.middleName, teacher.teacher.lastName].filter(Boolean).join(" ") || teacher.teacher.email}
                </h2>
                <p className="text-gray-600">{teacher.teacher.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && <OverviewTab teacher={teacher} />}
            {activeTab === "schedule" && <ScheduleTab teacher={teacher} />}
            {activeTab === "workload" && <WorkloadTab teacher={teacher} />}
            {activeTab === "assignments" && <AssignmentsTab teacher={teacher} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ teacher }) => {
  const t = teacher.teacher;
  const stats = teacher.workloadStats;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span>{t.phone || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span>{t.experience || 0} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualification:</span>
              <span>{t.qualification || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joining Date:</span>
              <span>{new Date(t.joiningDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Workload Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Periods:</span>
              <span className="font-semibold">{stats?.totalCurrentPeriods || 0}/week</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Periods/Day:</span>
              <span>{t.maxPeriodsPerDay || 8}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilization:</span>
              <span
                className={`font-semibold ${
                  stats?.utilizationPercentage >= 80
                    ? "text-red-600"
                    : stats?.utilizationPercentage >= 60
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {stats?.utilizationPercentage || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Classes Teaching:</span>
              <span>{stats?.classesTaught?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Subjects & Specializations</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {t.subjects &&
                t.subjects.map((subject) => (
                  <span key={subject._id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {subject.name} ({subject.code})
                  </span>
                ))}
            </div>
          </div>
          {t.preferredSubjects && t.preferredSubjects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {t.preferredSubjects.map((subject) => (
                  <span key={subject._id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {subject.name} ({subject.code})
                  </span>
                ))}
              </div>
            </div>
          )}
          {t.teachingSpecializations && t.teachingSpecializations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {t.teachingSpecializations.map((spec, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Schedule Tab
const ScheduleTab = ({ teacher }) => {
  const availability = teacher.teacher.availability;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Availability</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {days.map((day) => {
            const dayAvailability = availability?.[day];
            return (
              <div key={day} className="bg-white p-3 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">{day}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    {dayAvailability?.available ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={dayAvailability?.available ? "text-green-600" : "text-red-600"}>
                      {dayAvailability?.available ? "Available" : "Not Available"}
                    </span>
                  </div>
                  {dayAvailability?.available && (
                    <div className="text-gray-600">Max: {dayAvailability.maxPeriods || 8} periods</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Workload Tab
const WorkloadTab = ({ teacher }) => {
  const stats = teacher.workloadStats;
  const workloadByDay = stats?.workloadByDay || {};

  return (
    <div className="space-y-6">
      {/* Weekly Workload Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Workload Distribution</h3>
        <div className="space-y-3">
          {Object.entries(workloadByDay).map(([day, periods]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-700">{day}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{
                    width: `${Math.min((periods / (teacher.teacher.maxPeriodsPerDay || 8)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="w-12 text-sm text-gray-600 text-right">{periods} periods</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Total Periods</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats?.totalCurrentPeriods || 0}</div>
          <div className="text-sm text-blue-700">per week</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Utilization</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats?.utilizationPercentage || 0}%</div>
          <div className="text-sm text-green-700">of capacity</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Building className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Classes</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats?.classesTaught?.length || 0}</div>
          <div className="text-sm text-purple-700">teaching</div>
        </div>
      </div>
    </div>
  );
};

// Assignments Tab
const AssignmentsTab = ({ teacher }) => {
  const currentTimetable = teacher.currentTimetable || [];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Current Class Assignments</h3>
        {currentTimetable.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No current class assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentTimetable.map((timetable) => (
              <div key={timetable._id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {timetable.classId?.grade}
                    {timetable.classId?.division}
                  </h4>
                  <span className="text-sm text-gray-500">{timetable.day}</span>
                </div>
                <div className="space-y-1">
                  {timetable.periods
                    .filter((period) => period.teacher && period.teacher.toString() === teacher.teacher._id.toString())
                    .map((period, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Period {period.periodNumber}: {period.subject?.name}
                        </span>
                        <span className="text-gray-500">
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;
