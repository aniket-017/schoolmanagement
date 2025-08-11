import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const StudentAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("month"); // week, month, year
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);
  const [periodAttendanceData, setPeriodAttendanceData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    attendanceRate: "NaN%",
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, logout } = useTeacherAuth();

  // Helper function to create consistent local dates
  const createLocalDate = (year, month, day) => {
    // Create date at noon local time to avoid timezone edge cases
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateAsString = (date) => {
    return date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
  };

  // Helper function to get current week period
  const getCurrentWeekPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const weekNum = getISOWeekNumber(now); // Use ISO week calculation
    return `${year}-W${weekNum.toString().padStart(2, "0")}`;
  };

  // Helper function to get current week info for debugging
  const getCurrentWeekInfo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const weekNum = getISOWeekNumber(now); // Use ISO week calculation
    const weekStart = getWeekStartDate(year, weekNum);
    const weekEnd = getWeekEndDate(year, weekNum);

    return {
      currentDate: formatDateAsString(now),
      year,
      weekNum,
      weekStart,
      weekEnd,
      period: `${year}-W${weekNum.toString().padStart(2, "0")}`,
      // Add comparison with old method
      oldWeekNum: getWeekNumber(now),
      oldPeriod: `${year}-W${getWeekNumber(now).toString().padStart(2, "0")}`,
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Set default current period based on view type
    const now = new Date();
    if (viewType === "week") {
      const weekInfo = getCurrentWeekInfo();
      console.log("Setting initial week period:", weekInfo);
      setCurrentPeriod(weekInfo.period);
    } else if (viewType === "month") {
      setCurrentPeriod(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`);
    } else if (viewType === "year") {
      setCurrentPeriod(now.getFullYear().toString());
    }
  }, [viewType]);

  useEffect(() => {
    if (user) {
      loadAttendanceData();
    }
    // eslint-disable-next-line
  }, [user, selectedDate, currentPeriod, viewType]);

  const getWeekNumber = (date) => {
    // Use local dates instead of UTC to avoid week offset issues
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNum = d.getDay() || 7; // Sunday = 0, but we want Monday = 1
    d.setDate(d.getDate() + 4 - dayNum); // Move to Thursday of the same week
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  // Alternative week calculation using ISO 8601 standard
  const getISOWeekNumber = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    target.setDate(target.getDate() - dayNr + 3); // Thursday
    const firstThursday = target.valueOf();
    target.setMonth(0, 1); // January 1st
    if (target.getDay() !== 4) {
      // Not Thursday
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7)); // First Thursday
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000); // 604800000 = 7 * 24 * 60 * 60 * 1000
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        // Fetch today's attendance
        try {
          const dateStr = formatDateAsString(selectedDate); // Use helper function
          const attendanceResponse = await apiService.attendance.getStudentAttendance(user.id, {
            startDate: dateStr,
            endDate: dateStr,
          });
          if (attendanceResponse.success && attendanceResponse.data?.attendance?.length > 0) {
            setAttendanceData(attendanceResponse.data.attendance[0]);
          } else {
            setAttendanceData(null);
          }
        } catch (error) {
          setAttendanceData(null);
        }

        // Fetch period attendance data
        try {
          let queryParams = {};
          if (viewType === "week") {
            const [year, weekStr] = currentPeriod.split("-W");
            queryParams = {
              startDate: getWeekStartDate(parseInt(year), parseInt(weekStr)),
              endDate: getWeekEndDate(parseInt(year), parseInt(weekStr)),
            };
          } else if (viewType === "month") {
            const [year, month] = currentPeriod.split("-");
            queryParams = {
              month: parseInt(month),
              year: parseInt(year),
            };
          } else if (viewType === "year") {
            queryParams = {
              year: parseInt(currentPeriod),
            };
          }

          console.log("Fetching period attendance with params:", queryParams);
          const periodResponse = await apiService.attendance.getStudentAttendance(user.id, queryParams);
          console.log("Period attendance response:", periodResponse);

          if (periodResponse.success && periodResponse.data?.attendance) {
            setPeriodAttendanceData(periodResponse.data.attendance);
            console.log("Set period attendance data:", periodResponse.data.attendance);
          } else {
            setPeriodAttendanceData([]);
            console.log("No period attendance data found");
          }
        } catch (error) {
          console.error("Error fetching period attendance:", error);
          setPeriodAttendanceData([]);
        }

        // Fetch this month's stats
        try {
          const today = new Date();
          const monthlyResponse = await apiService.attendance.getStudentAttendance(user.id, {
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          });
          if (monthlyResponse.success && monthlyResponse.data?.statistics) {
            setMonthlyStats({
              attendanceRate: (monthlyResponse.data.statistics.attendancePercentage || 0) + "%",
              presentDays: monthlyResponse.data.statistics.presentDays || 0,
              absentDays: monthlyResponse.data.statistics.absentDays || 0,
              lateDays: monthlyResponse.data.statistics.lateDays || 0,
              totalDays: monthlyResponse.data.statistics.totalDays || 0,
            });
          } else {
            setMonthlyStats({
              attendanceRate: "0%",
              presentDays: 0,
              absentDays: 0,
              lateDays: 0,
              totalDays: 0,
            });
          }
        } catch (error) {
          setMonthlyStats({
            attendanceRate: "0%",
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            totalDays: 0,
          });
        }
      }
    } catch (error) {
      setAttendanceData(null);
      setPeriodAttendanceData([]);
      setMonthlyStats({
        attendanceRate: "0%",
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalDays: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeekStartDate = (year, weekNum) => {
    // ISO-8601: Week 1 is the week with Jan 4th (or first Thursday). Weeks start on Monday.
    const thursdayOfWeek = new Date(year, 0, 4 + (weekNum - 1) * 7);
    const dayNr = (thursdayOfWeek.getDay() + 6) % 7; // Monday=0..Sunday=6
    const monday = new Date(thursdayOfWeek);
    monday.setDate(thursdayOfWeek.getDate() - dayNr); // Go back to Monday

    const result = formatDateAsString(monday);
    console.log("Week start date calculation (ISO):", {
      year,
      weekNum,
      thursdayOfWeek: formatDateAsString(thursdayOfWeek),
      monday: result,
    });
    return result;
  };

  const getWeekEndDate = (year, weekNum) => {
    const weekStartLocal = getWeekStartDate(year, weekNum);
    const start = new Date(weekStartLocal);
    const sunday = new Date(start);
    sunday.setDate(start.getDate() + 6);

    const result = formatDateAsString(sunday);
    console.log("Week end date calculation (ISO):", {
      year,
      weekNum,
      weekStart: weekStartLocal,
      sunday: result,
    });
    return result;
  };

  const getISOWeeksInYear = (year) => {
    // The ISO week-numbering year has the last week that contains Dec 28th
    // So the week number of Dec 28th is the number of weeks in that year
    return getISOWeekNumber(new Date(year, 11, 28));
  };

  const navigatePeriod = (direction) => {
    if (viewType === "week") {
      const [year, weekStr] = currentPeriod.split("-W");
      const weekNum = parseInt(weekStr);
      const maxWeeks = getISOWeeksInYear(parseInt(year));
      const newWeek = direction === "prev" ? weekNum - 1 : weekNum + 1;

      if (newWeek < 1) {
        const prevYear = parseInt(year) - 1;
        const prevYearWeeks = getISOWeeksInYear(prevYear);
        setCurrentPeriod(`${prevYear}-W${prevYearWeeks.toString().padStart(2, "0")}`);
      } else if (newWeek > maxWeeks) {
        const nextYear = parseInt(year) + 1;
        setCurrentPeriod(`${nextYear}-W01`);
      } else {
        setCurrentPeriod(`${year}-W${newWeek.toString().padStart(2, "0")}`);
      }
    } else if (viewType === "month") {
      const [year, month] = currentPeriod.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      date.setMonth(date.getMonth() + (direction === "prev" ? -1 : 1));
      setCurrentPeriod(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`);
    } else if (viewType === "year") {
      const year = parseInt(currentPeriod);
      setCurrentPeriod((year + (direction === "prev" ? -1 : 1)).toString());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      case "leave":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "🟢";
      case "absent":
        return "🔴";
      case "late":
        return "🟡";
      case "leave":
        return "🔵";
      default:
        return "⚪";
    }
  };

  const formatPeriodDisplay = () => {
    if (viewType === "week") {
      const [year, weekStr] = currentPeriod.split("-W");
      return `Week ${weekStr}, ${year}`;
    } else if (viewType === "month") {
      const [year, month] = currentPeriod.split("-");
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } else if (viewType === "year") {
      return currentPeriod;
    }
    return "";
  };

  // Calendar helper functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday to be 0, Tuesday to be 1, etc.
    const day = new Date(year, month - 1, 1).getDay();
    // Convert: Sunday(0) -> 6, Monday(1) -> 0, Tuesday(2) -> 1, etc.
    return day === 0 ? 6 : day - 1;
  };

  const getAttendanceForDate = (date) => {
    if (!periodAttendanceData || periodAttendanceData.length === 0) return null;

    // Validate the input date
    if (isNaN(date.getTime())) {
      console.error("Invalid date passed to getAttendanceForDate:", date);
      return null;
    }

    // Convert the input date to a consistent format for comparison using local date
    const inputDateStr = formatDateAsString(date); // Use helper function

    // Find matching attendance record
    const attendance = periodAttendanceData.find((record) => {
      // Handle different date formats that might come from the API
      if (record.date) {
        let recordDateStr;

        // Try different date parsing approaches
        if (typeof record.date === "string") {
          // If it's already a string in YYYY-MM-DD format
          if (record.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            recordDateStr = record.date;
          } else {
            // Try parsing as a date string
            const recordDate = new Date(record.date);
            if (!isNaN(recordDate.getTime())) {
              recordDateStr = formatDateAsString(recordDate); // Use helper function
            }
          }
        } else if (record.date instanceof Date) {
          recordDateStr = formatDateAsString(record.date); // Use helper function
        } else if (record.date && typeof record.date === "object" && record.date.$date) {
          // MongoDB date format
          const recordDate = new Date(record.date.$date);
          recordDateStr = formatDateAsString(recordDate); // Use helper function
        }

        if (recordDateStr) {
          // Debug logging
          if (inputDateStr === recordDateStr) {
            console.log("Found attendance match:", {
              inputDate: inputDateStr,
              recordDate: recordDateStr,
              record: record,
            });
          }

          return recordDateStr === inputDateStr;
        }
      }
      return false;
    });

    // Debug logging
    if (!attendance) {
      console.log("No attendance found for date:", {
        inputDate: inputDateStr,
        availableDates: periodAttendanceData.map((r) => r.date),
        totalRecords: periodAttendanceData.length,
      });
    }

    return attendance;
  };

  const renderMonthCalendar = () => {
    const [year, month] = currentPeriod.split("-");
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    const daysInMonth = getDaysInMonth(yearNum, monthNum);
    const firstDayOfMonth = getFirstDayOfMonth(yearNum, monthNum);

    const calendar = [];

    // Calculate previous month info
    let prevMonth = monthNum - 1;
    let prevYear = yearNum;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = yearNum - 1;
    }
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    // Previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      // Create date in local timezone to avoid UTC conversion issues
      const date = createLocalDate(prevYear, prevMonth, day);
      calendar.push({
        day: day,
        isCurrentMonth: false,
        date: date,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      // Create date in local timezone to avoid UTC conversion issues
      const date = createLocalDate(yearNum, monthNum, i);
      calendar.push({
        day: i,
        isCurrentMonth: true,
        date: date,
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - calendar.length; // 6 rows * 7 days
    let nextMonth = monthNum + 1;
    let nextYear = yearNum;
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear = yearNum + 1;
    }

    for (let i = 1; i <= remainingDays; i++) {
      // Create date in local timezone to avoid UTC conversion issues
      const date = createLocalDate(nextYear, nextMonth, i);
      calendar.push({
        day: i,
        isCurrentMonth: false,
        date: date,
      });
    }

    console.log("Generated calendar for month:", {
      year: yearNum,
      month: monthNum,
      daysInMonth,
      firstDayOfMonth,
      calendarLength: calendar.length,
      prevMonth: { year: prevYear, month: prevMonth },
      nextMonth: { year: nextYear, month: nextMonth },
      sampleDates: calendar.slice(0, 5).map((d) => {
        const isValid = !isNaN(d.date.getTime());
        return {
          day: d.day,
          date: isValid ? formatDateAsString(d.date) : "INVALID", // Use helper function
          isValid: isValid,
        };
      }),
    });

    // Validate all dates before returning
    const invalidDates = calendar.filter((d) => isNaN(d.date.getTime()));
    if (invalidDates.length > 0) {
      console.error("Invalid dates found in calendar:", invalidDates);
    }

    return calendar;
  };

  const renderYearCalendar = () => {
    const year = parseInt(currentPeriod);
    const months = [];

    for (let month = 1; month <= 12; month++) {
      // Calculate attendance stats for each month
      const monthAttendance = periodAttendanceData.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1;
      });

      const present = monthAttendance.filter((r) => r.status === "present").length;
      const absent = monthAttendance.filter((r) => r.status === "absent").length;
      const late = monthAttendance.filter((r) => r.status === "late").length;
      const leave = monthAttendance.filter((r) => r.status === "leave").length;
      const total = monthAttendance.length;

      months.push({
        month,
        present,
        absent,
        late,
        leave,
        total,
      });
    }

    return months;
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Add a ref for the recent section
  const recentSectionRef = React.useRef(null);

  // Helper to scroll to recent section
  const handleViewDetails = () => {
    if (recentSectionRef.current) {
      recentSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header - Matching screenshots */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center p-4">
            <Link to="/student/dashboard" className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold text-center flex-1">Attendance</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6 pb-24">
          {/* View Type Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              {["week", "month", "year"].map((type) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                    viewType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Period Navigator */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigatePeriod("prev")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium text-gray-900 text-center">{formatPeriodDisplay()}</div>
              <div className="flex items-center gap-2">
                {viewType === "week" && (
                  <button
                    onClick={() => setCurrentPeriod(getCurrentWeekPeriod())}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Go to current week"
                  >
                    Current Week
                  </button>
                )}
                <button
                  onClick={() => navigatePeriod("next")}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Views */}
          {viewType === "month" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{formatPeriodDisplay()}</h3>
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>

              {/* Month Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {renderMonthCalendar().map((dayData, index) => {
                  // Skip invalid dates
                  if (isNaN(dayData.date.getTime())) {
                    console.warn("Skipping invalid date in calendar:", dayData);
                    return (
                      <div key={index} className="p-2 text-center rounded-lg text-sm bg-red-50 text-red-400">
                        <div className="font-medium">?</div>
                        <div className="text-xs mt-1 font-medium">Invalid</div>
                      </div>
                    );
                  }

                  const attendance = getAttendanceForDate(dayData.date);
                  let statusClass = "bg-gray-100 text-gray-900";
                  let statusText = "";

                  if (attendance) {
                    switch (attendance.status) {
                      case "present":
                        statusClass = "bg-green-100 text-green-900";
                        statusText = "Present";
                        break;
                      case "absent":
                        statusClass = "bg-red-500 text-white";
                        statusText = "Absent";
                        break;
                      case "late":
                        statusClass = "bg-yellow-100 text-yellow-900";
                        statusText = "Late";
                        break;
                      case "leave":
                        statusClass = "bg-blue-100 text-blue-900";
                        statusText = "Leave";
                        break;
                    }
                  }

                  // Debug logging for current month days
                  if (dayData.isCurrentMonth && index < 10) {
                    console.log("Calendar day:", {
                      day: dayData.day,
                      date: formatDateAsString(dayData.date), // Use helper function
                      attendance: attendance,
                      status: attendance?.status,
                    });
                  }

                  return (
                    <div
                      key={index}
                      className={`p-2 text-center rounded-lg text-sm ${
                        dayData.isCurrentMonth ? statusClass : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      <div className="font-medium">{dayData.day}</div>
                      {attendance && <div className="text-xs mt-1 font-medium">{statusText}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewType === "year" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.name || "Student"} - Year {currentPeriod}
                </h3>
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>

              {/* Year Calendar Grid */}
              <div className="grid grid-cols-3 gap-4">
                {renderYearCalendar().map((monthData) => (
                  <div key={monthData.month} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {new Date(2025, monthData.month - 1).toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">P: {monthData.present}</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">A: {monthData.absent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">L: {monthData.late}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Lv: {monthData.leave}</span>
                      </div>
                      <div className="text-center mt-2">
                        <span className="font-medium">Total: {monthData.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                onClick={handleViewDetails}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>

            {attendanceData ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    attendanceData.status === "present"
                      ? "bg-green-500"
                      : attendanceData.status === "absent"
                      ? "bg-red-500"
                      : attendanceData.status === "late"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-semibold capitalize ${
                      attendanceData.status === "present"
                        ? "text-green-600"
                        : attendanceData.status === "absent"
                        ? "text-red-600"
                        : attendanceData.status === "late"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {attendanceData.status}
                  </p>
                  <p className="text-gray-600 text-sm">Time In: {attendanceData.timeIn || "N/A"}</p>
                  {attendanceData.remarks && <p className="text-gray-500 text-xs">Remarks: {attendanceData.remarks}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No attendance record found</p>
                <p className="text-gray-400 text-sm">Attendance may not have been marked for this date</p>
              </div>
            )}
          </motion.div>

          {/* Period Attendance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{formatPeriodDisplay()} Attendance</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : periodAttendanceData.length > 0 ? (
              <div className="space-y-3">
                {periodAttendanceData.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(record.status)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {record.timeIn ? `Time In: ${record.timeIn}` : "No time recorded"}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance records found for {formatPeriodDisplay()}.
              </div>
            )}
          </motion.div>

          {/* This Month's Attendance - Exact match to screenshots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">This Month's Attendance</h3>

            {/* Attendance Rate - Large display like in screenshots */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">{monthlyStats.attendanceRate}</div>
              <p className="text-gray-600 text-lg">Attendance Rate</p>
            </div>

            {/* Stats Grid - Exactly like screenshots */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.presentDays}</p>
                <p className="text-gray-600 text-sm font-medium">PRESENT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.absentDays}</p>
                <p className="text-gray-600 text-sm font-medium">ABSENT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.lateDays}</p>
                <p className="text-gray-600 text-sm font-medium">LATE</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.totalDays}</p>
                <p className="text-gray-600 text-sm font-medium">TOTAL DAYS</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/student/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        </div>

        {/* View Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Attendance View</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* View Type Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {["week", "month", "year"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setViewType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                      viewType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Period Navigator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigatePeriod("prev")}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  disabled={loading}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <div className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                  {formatPeriodDisplay()}
                </div>
                <div className="flex items-center gap-2">
                  {viewType === "week" && (
                    <button
                      onClick={() => setCurrentPeriod(getCurrentWeekPeriod())}
                      className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded-lg"
                      title="Go to current week"
                    >
                      Current Week
                    </button>
                  )}
                  <button
                    onClick={() => navigatePeriod("next")}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                    disabled={loading}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        {viewType === "month" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{formatPeriodDisplay()}</h3>
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>

            {/* Month Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-3">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {renderMonthCalendar().map((dayData, index) => {
                // Skip invalid dates
                if (isNaN(dayData.date.getTime())) {
                  console.warn("Skipping invalid date in desktop calendar:", dayData);
                  return (
                    <div
                      key={index}
                      className="p-3 text-center rounded-lg text-sm min-h-[80px] flex flex-col justify-center bg-red-50 text-red-400"
                    >
                      <div className="font-medium text-lg">?</div>
                      <div className="text-xs mt-1 font-medium">Invalid</div>
                    </div>
                  );
                }

                const attendance = getAttendanceForDate(dayData.date);
                let statusClass = "bg-gray-100 text-gray-900";
                let statusText = "";

                if (attendance) {
                  switch (attendance.status) {
                    case "present":
                      statusClass = "bg-green-100 text-green-900";
                      statusText = "Present";
                      break;
                    case "absent":
                      statusClass = "bg-red-500 text-white";
                      statusText = "Absent";
                      break;
                    case "late":
                      statusClass = "bg-yellow-100 text-yellow-900";
                      statusText = "Late";
                      break;
                    case "leave":
                      statusClass = "bg-blue-100 text-blue-900";
                      statusText = "Leave";
                      break;
                  }
                }

                // Debug logging for current month days
                if (dayData.isCurrentMonth && index < 10) {
                  console.log("Desktop Calendar day:", {
                    day: dayData.day,
                    date: formatDateAsString(dayData.date), // Use helper function
                    attendance: attendance,
                    status: attendance?.status,
                  });
                }

                return (
                  <div
                    key={index}
                    className={`p-3 text-center rounded-lg text-sm min-h-[80px] flex flex-col justify-center ${
                      dayData.isCurrentMonth ? statusClass : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <div className="font-medium text-lg">{dayData.day}</div>
                    {attendance && <div className="text-xs mt-1 font-medium">{statusText}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewType === "year" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.name || "Student"} - Year {currentPeriod}
              </h3>
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>

            {/* Year Calendar Grid */}
            <div className="grid grid-cols-4 gap-6">
              {renderYearCalendar().map((monthData) => (
                <div key={monthData.month} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-medium text-gray-900 mb-3 text-center">
                    {new Date(2025, monthData.month - 1).toLocaleDateString("en-US", { month: "long" })}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                        P: {monthData.present}
                      </span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">A: {monthData.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                        L: {monthData.late}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">Lv: {monthData.leave}</span>
                    </div>
                    <div className="text-center mt-3 pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total: {monthData.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Attendance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                onClick={handleViewDetails}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
            {attendanceData ? (
              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    attendanceData.status === "present"
                      ? "bg-green-500"
                      : attendanceData.status === "absent"
                      ? "bg-red-500"
                      : attendanceData.status === "late"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-semibold capitalize ${
                      attendanceData.status === "present"
                        ? "text-green-600"
                        : attendanceData.status === "absent"
                        ? "text-red-600"
                        : attendanceData.status === "late"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {attendanceData.status}
                  </p>
                  <p className="text-gray-600 text-sm">Time In: {attendanceData.timeIn || "N/A"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No attendance record found</p>
              </div>
            )}
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">This Month's Attendance</h3>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600">{monthlyStats.attendanceRate}</div>
              <p className="text-gray-600">Attendance Rate</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.presentDays}</p>
                <p className="text-gray-600 text-sm">PRESENT</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.absentDays}</p>
                <p className="text-gray-600 text-sm">ABSENT</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.lateDays}</p>
                <p className="text-gray-600 text-sm">LATE</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.totalDays}</p>
                <p className="text-gray-600 text-sm">TOTAL DAYS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Period Attendance Details */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{formatPeriodDisplay()} Attendance Details</h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading attendance data...</span>
            </div>
          ) : periodAttendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {periodAttendanceData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {record.timeIn || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found for {formatPeriodDisplay()}.</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <ArrowLeftOnRectangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-center mb-6">Are you sure you want to logout from your account?</p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
