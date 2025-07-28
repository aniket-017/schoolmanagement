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
  const [outlines, setOutlines] = useState([]);
  const [selectedOutlineId, setSelectedOutlineId] = useState("");
  const [customTimeSlots, setCustomTimeSlots] = useState(null);
  const [fetchedOutlineId, setFetchedOutlineId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const timeSlots = customTimeSlots || [
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
    fetchOutlines();
  }, [classId, academicYear]);

  // After both outlines and fetchedOutlineId are available, set selectedOutlineId and customTimeSlots
  useEffect(() => {
    if (outlines.length > 0 && fetchedOutlineId) {
      setSelectedOutlineId(fetchedOutlineId);
      const outline = outlines.find((o) => o._id === fetchedOutlineId);
      if (outline) {
        setCustomTimeSlots(
          outline.periods.map((p, idx) => ({
            period: idx + 1,
            startTime: p.startTime,
            endTime: p.endTime,
            name: p.name,
            type: p.type,
            duration: p.duration,
          }))
        );
      }
    }
  }, [outlines, fetchedOutlineId]);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Debug: Log the token and user info
      console.log("Token exists:", !!token);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Current user:", user);

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

      // Debug: Log response statuses
      console.log("Teachers response status:", teachersRes.status);
      console.log("Teachers response headers:", teachersRes.headers);

      const timetableData = await timetableRes.json();
      const subjectsData = await subjectsRes.json();
      const teachersData = await teachersRes.json();

      // Debug: Log teachers response
      console.log("Teachers response data:", teachersData);

      if (timetableData.success) {
        setTimetable(timetableData.data.weeklyTimetable);
        if (timetableData.data.outlineId) {
          setFetchedOutlineId(timetableData.data.outlineId);
        }
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

  const fetchOutlines = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${appConfig.API_BASE_URL}/timetables/outlines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOutlines(data.data);
    } catch (e) {
      // ignore
    }
  };

  // When outline is selected, update timeSlots
  const handleOutlineChange = (e) => {
    const outlineId = e.target.value;
    setSelectedOutlineId(outlineId);
    const outline = outlines.find((o) => o._id === outlineId);
    if (outline) {
      setCustomTimeSlots(
        outline.periods.map((p, idx) => ({
          period: idx + 1,
          startTime: p.startTime,
          endTime: p.endTime,
          name: p.name,
          type: p.type,
          duration: p.duration,
        }))
      );
    } else {
      setCustomTimeSlots(null);
    }
  };

  // Prevent changing outline if timetable already has periods
  const timetableHasPeriods = Object.values(timetable).some((arr) => arr && arr.length > 0);

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
      const { day, period, subjectId, teacherId, room, type, applyAllDays } = periodData;

      // Check for room conflicts only (teachers can teach multiple classes)
      const conflicts = await checkConflicts(day, period, teacherId, room);
      if (conflicts.length > 0) {
        setConflicts(conflicts);
        toast.warning("Room conflicts detected! You can continue anyway or resolve them.");
        // Don't return - allow the user to proceed
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

      if (applyAllDays) {
        // Assign to all days
        setTimetable((prev) => {
          const updated = { ...prev };
          days.forEach((d) => {
            // Only add if not a break
            if (!(timeSlots[period - 1].type === "break")) {
              updated[d] = [...(prev[d] || []).filter((p) => p.periodNumber !== period), { ...newPeriod }].sort(
                (a, b) => a.periodNumber - b.periodNumber
              );
            }
          });
          return updated;
        });
      } else {
        setTimetable((prev) => ({
          ...prev,
          [day]: [...(prev[day] || []), newPeriod].sort((a, b) => a.periodNumber - b.periodNumber),
        }));
      }

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

      // Only check for room conflicts, not teacher conflicts
      // Teachers can be assigned to multiple classes/subjects
      if (!room) {
        return []; // No room specified, no conflicts
      }

      const response = await fetch(
        `${appConfig.API_BASE_URL}/timetables/teacher/availability?day=${day}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}&teacherId=${teacherId}&excludeClassId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      // Only return room conflicts, ignore teacher conflicts
      return data.success && data.data.conflicts ? 
        data.data.conflicts.filter(conflict => conflict.type === 'room_conflict') : [];
    } catch (error) {
      console.error("Error checking conflicts:", error);
      return [];
    }
  };

  const handleSaveTimetable = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      console.log("Saving timetable with data:", {
        classId,
        weeklyTimetable: timetable,
        academicYear,
        semester: "1",
      });

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
          outlineId: selectedOutlineId || null,
          overrideConflicts: true, // Always allow override for now
        }),
      });

      console.log("Save response status:", response.status);
      const data = await response.json();
      console.log("Save response data:", data);

      if (data.success) {
        toast.success("Timetable saved successfully!");
        // Refresh the timetable data to get the populated information
        await fetchTimetableData();
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

  // Clear timetable and outline
  const handleClearTimetable = async () => {
    setShowClearConfirm(false);
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      // Backend: delete all timetable entries for this class and year
      await fetch(`${appConfig.API_BASE_URL}/timetables/class/${classId}?academicYear=${academicYear}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetable({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
      });
      setSelectedOutlineId("");
      setCustomTimeSlots(null);
      setFetchedOutlineId(null);
      toast.success("Timetable and outline cleared.");
    } catch (error) {
      toast.error("Failed to clear timetable.");
    } finally {
      setSaving(false);
    }
  };

  const getPeriodData = (day, periodNumber) => {
    return timetable[day]?.find((p) => p.periodNumber === periodNumber);
  };

  const getSubjectName = (subjectId) => {
    // First check in the original subjects array
    const subject = subjects.find((s) => s._id === subjectId);
    if (subject) return subject.name;

    // If subjectId is an object with name property (populated data)
    if (subjectId && typeof subjectId === "object" && subjectId.name) {
      return subjectId.name;
    }

    return "Unknown";
  };

  const getTeacherName = (teacherId) => {
    // First check in the original teachers array
    const teacher = teachers.find((t) => t._id === teacherId);
    if (teacher) {
      return (
        teacher.name ||
        teacher.fullName ||
        [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ") ||
        teacher.email
      );
    }

    // Then check in the available teachers array (for recently added periods)
    const availableTeacher = availableTeachers.find((t) => t._id === teacherId);
    if (availableTeacher) {
      return (
        availableTeacher.name ||
        availableTeacher.fullName ||
        [availableTeacher.firstName, availableTeacher.middleName, availableTeacher.lastName]
          .filter(Boolean)
          .join(" ") ||
        availableTeacher.email
      );
    }

    // If teacherId is an object with name property (populated data)
    if (teacherId && typeof teacherId === "object") {
      return (
        teacherId.name ||
        teacherId.fullName ||
        [teacherId.firstName, teacherId.middleName, teacherId.lastName].filter(Boolean).join(" ") ||
        teacherId.email ||
        "Unknown"
      );
    }

    return "Unknown";
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
          {/* Outline selection */}
          <select
            value={selectedOutlineId}
            onChange={handleOutlineChange}
            className="px-3 py-2 border border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={timetableHasPeriods}
            style={{ minWidth: 180 }}
          >
            <option value="">
              {timetableHasPeriods ? "Outline locked (periods exist)" : "Select Timetable Outline"}
            </option>
            {outlines.map((outline) => (
              <option key={outline._id} value={outline._id}>
                {outline.name} ({outline.periods.length} periods)
              </option>
            ))}
          </select>
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
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 border border-red-300"
            disabled={saving}
          >
            Clear Timetable & Outline
          </button>
        </div>
      </div>
      {/* Confirm Clear Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4 text-red-700">Clear Timetable & Outline?</h2>
            <p className="mb-6 text-gray-700">
              This will remove all assigned periods and the selected outline for this class and year. You can select a
              new outline and build a new timetable after clearing.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClearTimetable}
                className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                disabled={saving}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden timetable-table-container">
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
                    // If this slot is a break, show a break cell
                    if (slot.type === "break") {
                      return (
                        <td
                          key={`${day}-${slot.period}`}
                          className="px-4 py-3 bg-yellow-50 text-center text-yellow-700 font-semibold"
                          colSpan={1}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-sm">{slot.name || "Break"}</span>
                          </div>
                        </td>
                      );
                    }
                    const periodData = getPeriodData(day, slot.period);
                    return (
                      <td key={`${day}-${slot.period}`} className="px-4 py-3">
                        {periodData ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 relative group timetable-period-card"
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
            setConflicts={setConflicts}
            availableTeachers={availableTeachers}
            loadingTeachers={loadingTeachers}
            onSubjectChange={fetchAvailableTeachers}
          />
        )}
      </AnimatePresence>
      <style>{`
  @media (max-width: 600px) {
    .timetable-table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .timetable-table-container table {
      min-width: 500px;
    }
    .timetable-table-container th, .timetable-table-container td {
      padding: 4px 6px !important;
      font-size: 0.75rem !important;
    }
    .timetable-period-card {
      padding: 6px !important;
      font-size: 0.8rem !important;
      min-height: 48px !important;
    }
    .timetable-period-card .text-blue-900 {
      font-size: 0.95rem !important;
    }
    .timetable-period-card .text-sm {
      font-size: 0.75rem !important;
    }
    .timetable-period-card .text-xs {
      font-size: 0.65rem !important;
    }
    .timetable-period-card .p-3 {
      padding: 0.25rem !important;
    }
    .timetable-period-card .rounded-lg {
      border-radius: 0.35rem !important;
    }
    .timetable-table-container h3, .timetable-table-container p, .timetable-table-container span {
      font-size: 0.8rem !important;
    }
    .timetable-table-container .w-4, .timetable-table-container .h-4 {
      width: 14px !important;
      height: 14px !important;
    }
  }
`}</style>
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
  setConflicts,
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
  const [applyAllDays, setApplyAllDays] = useState(false);

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
      applyAllDays,
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
              <X className="w-4 h-4" />
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
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-orange-800">Room Conflicts Detected</span>
              </div>
              <ul className="text-sm text-orange-700 space-y-1 mb-3">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict.message}</li>
                ))}
              </ul>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setConflicts([]);
                    toast.info("Room conflicts ignored. You can proceed with the lecture.");
                  }}
                  className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Continue Anyway
                </button>
                <span className="text-xs text-orange-600">Click to ignore room conflicts and continue</span>
              </div>
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
                      {teacher.name} - ✅ Available
                      {teacher.experienceLevel && ` (${teacher.experienceLevel})`}
                      {teacher.isSpecialized && " ⭐ Specialized"}
                    </option>
                  ))}
                </select>
              )}

              {formData.subjectId && availableTeachers.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {availableTeachers.length} teachers available for this subject
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

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="applyAllDays"
                checked={applyAllDays}
                onChange={(e) => setApplyAllDays(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="applyAllDays" className="text-sm text-gray-700">
                Apply to all days
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  conflicts.length > 0
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {conflicts.length > 0 ? "Add Period Anyway" : "Add Period"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimetableTab;
