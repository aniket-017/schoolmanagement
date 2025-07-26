import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import appConfig from "../config/environment";

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${appConfig.API_BASE_URL}/timetables/class/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (data.success && data.data && data.data.weeklyTimetable) {
          setTimetable(data.data.weeklyTimetable);
        } else {
          setTimetable({});
          setError("No timetable data available for this class.");
        }
      } catch (e) {
        console.error("Error fetching timetable:", e);
        setTimetable({});
        setError("Failed to load timetable. Please try again later.");
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
      
      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Period Cards */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading timetable...</p>
        </div>
      ) : !error && periods.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No periods scheduled for {selectedDay}.</p>
          <p className="text-xs text-gray-300 mt-1">Check back later or contact your administrator.</p>
        </div>
      ) : !error && (
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
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.class) {
      setClassId(user.class._id || user.class);
      setClassData(user.class);
    } else {
      // Show error message before redirecting
      alert("No class information found. Please contact your administrator.");
      navigate("/student/dashboard");
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Unable to load timetable</p>
          <button 
            onClick={() => navigate("/student/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center p-4">
            <Link to="/student/dashboard" className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold text-center flex-1">Timetable</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6">
          <StudentTimetableMobile classId={classId} classData={classData} />
        </div>
      </div>
    );
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