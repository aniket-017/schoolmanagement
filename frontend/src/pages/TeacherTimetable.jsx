import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, BookOpenIcon, ChevronLeftIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";
import { useNavigate } from "react-router-dom";

const daysOfWeek = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
];

const TeacherTimetable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState({});
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0].full);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const { user } = useTeacherAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user && user._id) {
      loadTeacherTimetable(user._id);
    }
    // eslint-disable-next-line
  }, [user]);

  const loadTeacherTimetable = async (teacherId) => {
    try {
      setLoading(true);
      const response = await apiService.timetable.getTeacherTimetable(teacherId);
      if (response.success) {
        setTimetable(response.data?.weeklyTimetable || {});
      } else {
        setTimetable({});
        console.error("Failed to load timetable:", response.message);
      }
    } catch (error) {
      setTimetable({});
      console.error("Error loading timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const periods = timetable[selectedDay] || [];

  // Back navigation handler
  const handleBack = () => {
    navigate("/teacher/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Back Button */}
          {mobileView && (
            <div className="flex items-center mb-2">
              <button
                onClick={handleBack}
                className="flex items-center text-white hover:text-blue-100 transition-colors p-2"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-2xl font-bold mb-1">Teaching Schedule</h1>
            <p className="text-blue-100 text-sm">
              {user?.name || ""} &bull;{" "}
              {user?.subjects?.length ? user.subjects.map((s) => s.name).join(", ") : "All Subjects"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Day Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
          {daysOfWeek.map((d) => (
            <button
              key={d.full}
              onClick={() => setSelectedDay(d.full)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[60px] shadow-sm transition-all duration-150 border-2 focus:outline-none ${
                selectedDay === d.full
                  ? "bg-blue-500 border-blue-500 text-white shadow-md"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <span className="font-semibold text-base">{d.short}</span>
              <span className="text-xs mt-0.5">{d.full}</span>
            </button>
          ))}
        </div>

        {/* Periods List */}
        <div className="w-full max-w-md mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-gray-500">Loading timetable...</div>
            </div>
          ) : periods.length === 0 ? (
            <motion.div
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CalendarIcon className="w-10 h-10 text-gray-300 mb-2" />
              <div className="font-semibold text-gray-700 text-lg mb-1">No Classes Today</div>
              <div className="text-gray-400 text-sm text-center">
                Enjoy your free time! No classes scheduled for {selectedDay}.
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 mt-2">
              {periods.map((period, idx) => (
                <motion.div
                  key={period._id || idx}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-gray-900 text-base">Period {period.periodNumber || idx + 1}</div>
                    <div className="flex space-x-2">
                      {period.classId && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold text-xs">
                          Class {period.classId.grade}
                          {period.classId.division}
                        </span>
                      )}
                      {period.type && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold text-xs">
                          {period.type.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm mb-2">
                    {period.startTime && period.endTime
                      ? `${period.startTime} - ${period.endTime}`
                      : period.timeSlot || "Time not specified"}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <BookOpenIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-800 font-medium text-base">{period.subject?.name || "No Subject"}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetable;
