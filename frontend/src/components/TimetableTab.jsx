import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  User,
  BookOpen,
  MapPin,
  Plus,
  Save,
  AlertTriangle,
  CheckCircle,
  X,
  Edit3,
  Trash2,
  Calendar,
  Users,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";
import appConfig from "../config/environment";

const TimetableTab = ({ classId, classData }) => {
  const [timetable, setTimetable] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const timeSlots = [
    { period: 1, startTime: "08:00", endTime: "08:45" },
    { period: 2, startTime: "08:45", endTime: "09:30" },
    { period: 3, startTime: "09:30", endTime: "10:15" },
    { period: 4, startTime: "10:15", endTime: "11:00" },
    { period: 5, startTime: "11:15", endTime: "12:00" },
    { period: 6, startTime: "12:00", endTime: "12:45" },
    { period: 7, startTime: "12:45", endTime: "01:30" },
    { period: 8, startTime: "01:30", endTime: "02:15" },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    fetchTimetableData();
  }, [classId, academicYear]);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [timetableRes, subjectsRes, teachersRes] = await Promise.all([
        fetch(`${appConfig.API_BASE_URL}/timetables/class/${classId}?academicYear=${academicYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${appConfig.API_BASE_URL}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${appConfig.API_BASE_URL}/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const timetableData = await timetableRes.json();
      const subjectsData = await subjectsRes.json();
      const teachersData = await teachersRes.json();

      if (timetableData.success) {
        setTimetable(timetableData.data.weeklyTimetable);
      }
      if (subjectsData.success) {
        setSubjects(subjectsData.data || []);
      }
      if (teachersData.success) {
        setTeachers(teachersData.data || []);
      }
    } catch (error) {
      console.error("Error fetching timetable data:", error);
      toast.error("Error loading timetable data");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (day, period) => {
    setSelectedSlot({ day, period });
    setShowAddPeriodModal(true);
  };

  const fetchAvailableTeachers = async (subjectId, day, period) => {
    if (!subjectId) {
      setAvailableTeachers([]);
      return;
    }

    try {
      setLoadingTeachers(true);
      const token = localStorage.getItem("token");
      const timeSlot = timeSlots[period - 1];

      const response = await fetch(
        `${appConfig.API_BASE_URL}/teachers/availability/subject?subjectId=${subjectId}&day=${day}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}&excludeClassId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (data.success) {
        setAvailableTeachers(data.data || []);
      } else {
        setAvailableTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching available teachers:", error);
      setAvailableTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAddPeriod = async (periodData) => {
    try {
      const { day, period, subjectId, teacherId, room, type } = periodData;

      // Check for conflicts
      const conflicts = await checkConflicts(day, period, teacherId, room);
      if (conflicts.length > 0) {
        setConflicts(conflicts);
        toast.error("Conflicts detected! Please resolve them.");
        return;
      }

      const newPeriod = {
        periodNumber: period,
        subject: subjectId,
        teacher: teacherId,
        startTime: timeSlots[period - 1].startTime,
        endTime: timeSlots[period - 1].endTime,
        room: room || "",
        type: type || "theory",
      };

      setTimetable((prev) => ({
        ...prev,
        [day]: [...(prev[day] || []), newPeriod].sort((a, b) => a.periodNumber - b.periodNumber),
      }));

      setShowAddPeriodModal(false);
      setSelectedSlot(null);
      setConflicts([]);
      toast.success("Period added successfully!");
    } catch (error) {
      console.error("Error adding period:", error);
      toast.error("Error adding period");
    }
  };

  const handleRemovePeriod = (day, periodNumber) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: prev[day].filter((p) => p.periodNumber !== periodNumber),
    }));
    toast.success("Period removed successfully!");
  };

  const checkConflicts = async (day, period, teacherId, room) => {
    try {
      const token = localStorage.getItem("token");
      const timeSlot = timeSlots[period - 1];

      const response = await fetch(
        `${appConfig.API_BASE_URL}/teachers/availability/check?day=${day}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}&teacherId=${teacherId}&excludeClassId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      return data.success && !data.data.isAvailable ? data.data.conflicts : [];
    } catch (error) {
      console.error("Error checking conflicts:", error);
      return [];
    }
  };

  const handleSaveTimetable = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${appConfig.API_BASE_URL}/timetables/class/${classId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weeklyTimetable: timetable,
          academicYear,
          semester: "1",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Timetable saved successfully!");
      } else {
        toast.error(data.message || "Error saving timetable");
      }
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast.error("Error saving timetable");
    } finally {
      setSaving(false);
    }
  };

  const getPeriodData = (day, periodNumber) => {
    return timetable[day]?.find((p) => p.periodNumber === periodNumber);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s._id === subjectId);
    return subject ? subject.name : "Unknown";
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher ? teacher.name : "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Class Timetable</h3>
          <p className="text-sm text-gray-600">
            Manage the weekly schedule for {classData?.grade}
            {getOrdinalSuffix(classData?.grade)} Class - {classData?.division}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
              <option key={year} value={year.toString()}>
                {year}-{year + 1}
              </option>
            ))}
          </select>
          <button
            onClick={handleSaveTimetable}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Timetable"}
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot, index) => (
                <tr key={slot.period} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{slot.startTime}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{slot.endTime}</div>
                  </td>
                  {days.map((day) => {
                    const periodData = getPeriodData(day, slot.period);
                    return (
                      <td key={`${day}-${slot.period}`} className="px-4 py-3">
                        {periodData ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 relative group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">
                                    {getSubjectName(periodData.subject)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <User className="w-3 h-3 text-gray-500" />
                                  <span className="text-sm text-gray-700">{getTeacherName(periodData.teacher)}</span>
                                </div>
                                {periodData.room && (
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-3 h-3 text-gray-500" />
                                    <span className="text-sm text-gray-600">{periodData.room}</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {periodData.type}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemovePeriod(day, slot.period)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => handleSlotClick(day, slot.period)}
                            className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center group"
                          >
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Period Modal */}
      <AnimatePresence>
        {showAddPeriodModal && (
          <AddPeriodModal
            selectedSlot={selectedSlot}
            subjects={subjects}
            teachers={teachers}
            timeSlots={timeSlots}
            onAdd={handleAddPeriod}
            onClose={() => {
              setShowAddPeriodModal(false);
              setSelectedSlot(null);
              setConflicts([]);
              setAvailableTeachers([]);
            }}
            conflicts={conflicts}
            availableTeachers={availableTeachers}
            loadingTeachers={loadingTeachers}
            onSubjectChange={fetchAvailableTeachers}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function for ordinal suffixes
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

// Add Period Modal Component
const AddPeriodModal = ({
  selectedSlot,
  subjects,
  teachers,
  timeSlots,
  onAdd,
  onClose,
  conflicts,
  availableTeachers,
  loadingTeachers,
  onSubjectChange,
}) => {
  const [formData, setFormData] = useState({
    subjectId: "",
    teacherId: "",
    room: "",
    type: "theory",
  });

  const timeSlot = timeSlots[selectedSlot?.period - 1];

  const handleSubjectChange = (subjectId) => {
    setFormData({ ...formData, subjectId, teacherId: "" });
    onSubjectChange(subjectId, selectedSlot.day, selectedSlot.period);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.teacherId) {
      toast.error("Please select both subject and teacher");
      return;
    }
    onAdd({
      day: selectedSlot.day,
      period: selectedSlot.period,
      ...formData,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Period</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{selectedSlot?.day}</span>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>
                {timeSlot?.startTime} - {timeSlot?.endTime}
              </span>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-800">Conflicts Detected</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict.message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
              {loadingTeachers ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading available teachers...
                </div>
              ) : (
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.subjectId}
                >
                  <option value="">{formData.subjectId ? "Select Teacher" : "Select a subject first"}</option>
                  {availableTeachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} - {teacher.availability === "available" ? "✅ Available" : "❌ Conflict"}
                      {teacher.experienceLevel && ` (${teacher.experienceLevel})`}
                      {teacher.isSpecialized && " ⭐ Specialized"}
                    </option>
                  ))}
                </select>
              )}

              {formData.subjectId && availableTeachers.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {availableTeachers.filter((t) => t.availability === "available").length} available,{" "}
                  {availableTeachers.filter((t) => t.availability === "conflict").length} with conflicts
                </div>
              )}
            </div>

            {/* Teacher Details Section */}
            {formData.teacherId && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Teacher Details</h4>
                {(() => {
                  const selectedTeacher = availableTeachers.find((t) => t._id === formData.teacherId);
                  if (!selectedTeacher) return null;

                  return (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{selectedTeacher.experienceLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Periods:</span>
                        <span className="font-medium">
                          {selectedTeacher.workloadStats?.totalCurrentPeriods || 0}/week
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Periods/Day:</span>
                        <span className="font-medium">{selectedTeacher.maxPeriodsPerDay || 8}</span>
                      </div>
                      {selectedTeacher.currentAssignments && selectedTeacher.currentAssignments.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-600 block mb-1">Current Classes:</span>
                          <div className="space-y-1">
                            {selectedTeacher.currentAssignments.slice(0, 3).map((assignment, idx) => (
                              <div key={idx} className="text-xs bg-white px-2 py-1 rounded border">
                                {assignment.className} ({assignment.day})
                              </div>
                            ))}
                            {selectedTeacher.currentAssignments.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{selectedTeacher.currentAssignments.length - 3} more classes
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room (Optional)</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., Room 101, Lab 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="lab">Lab</option>
                <option value="sports">Sports</option>
                <option value="library">Library</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Period
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimetableTab;
