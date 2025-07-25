import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper for day names
const daysOfWeek = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
];

// Card-based, teacher-style timetable for students
const StudentTimetableMobile = ({ classId, classData }) => {
  const [timetable, setTimetable] = useState({});
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0].full);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:1704/api/timetables/class/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success && data.data && data.data.weeklyTimetable) {
          setTimetable(data.data.weeklyTimetable);
        } else {
          setTimetable({});
        }
      } catch (e) {
        setTimetable({});
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchTimetable();
  }, [classId]);

  // Get periods for selected day
  const periods = timetable[selectedDay] || [];

  // Helper for period time (if available)
  const getPeriodTime = (period) => {
    if (period.startTime && period.endTime) {
      return `${period.startTime} - ${period.endTime}`;
    }
    return "";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Day Tabs */}
      <div className="flex overflow-x-auto mb-4 no-scrollbar">
        {daysOfWeek.map((day) => (
          <button
            key={day.full}
            className={`flex-1 px-3 py-2 rounded-lg mx-1 whitespace-nowrap font-medium text-sm transition-all duration-150 ${selectedDay === day.full ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setSelectedDay(day.full)}
          >
            {day.short}
            <span className="block text-xs font-normal">{day.full}</span>
          </button>
        ))}
      </div>
      {/* Period Cards */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading timetable...</div>
      ) : periods.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No periods scheduled for this day.</div>
      ) : (
        <div className="space-y-4">
          {periods.map((period, idx) => (
            <div
              key={period._id || idx}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700 text-sm">Period {period.periodNumber || idx + 1}</span>
                <span className="text-xs text-gray-500">{getPeriodTime(period)}</span>
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                  {period.type || "theory"}
                </span>
              </div>
              <div className="flex items-center mb-1">
                <span className="mr-2 text-lg">📘</span>
                <span className="font-medium text-gray-900 text-base">
                  {typeof period.subject === 'object'
                    ? period.subject.name || "Subject"
                    : period.subject || "Subject"}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2 text-base">👤</span>
                <span>
                  {typeof period.teacher === 'object'
                    ? period.teacher.name || "Unknown Teacher"
                    : period.teacher || "Unknown Teacher"}
                </span>
              </div>
              {period.room && (
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span className="mr-1">🏫</span>
                  <span>{period.room}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Extra spacing at bottom for mobile */}
      <div className="h-8" />
      {/* Hide scrollbars for day tabs */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const StudentTimetable = () => {
  const [classId, setClassId] = useState(null);
  const [classData, setClassData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.class) {
      setClassId(user.class._id || user.class);
      setClassData(user.class);
    } else {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  if (!classId) {
    return <div className="p-8 text-center text-gray-500">Loading timetable...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Class Timetable</h2>
      <div className="relative">
        <StudentTimetableMobile classId={classId} classData={classData} />
      </div>
    </div>
  );
};

export default StudentTimetable; 