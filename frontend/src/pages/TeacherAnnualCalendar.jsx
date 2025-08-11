import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const TeacherAnnualCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const { user } = useTeacherAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAnnualCalendar();
  }, [currentMonth]);

  const loadAnnualCalendar = async () => {
    try {
      setLoading(true);
      const response = await apiService.annualCalendar.getTeacherCalendar();

      if (response.success) {
        setEvents(response.data);
      } else {
        console.error("Failed to load calendar:", response.message);
      }
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];

    const dateString = date.toISOString().split("T")[0];
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      const eventDateString = eventDate.toISOString().split("T")[0];
      return eventDateString === dateString;
    });
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case "exam":
        return "bg-red-100 text-red-800 border-red-200";
      case "holiday":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "event":
        return "bg-green-100 text-green-800 border-green-200";
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "deadline":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case "exam":
        return ExclamationTriangleIcon;
      case "holiday":
        return CalendarIcon;
      case "event":
        return InformationCircleIcon;
      case "meeting":
        return AcademicCapIcon;
      case "deadline":
        return ClockIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleBack = () => {
    navigate("/teacher/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading annual calendar...</p>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-0">
      {/* Header */}
      <div className="w-full bg-blue-600 rounded-b-3xl pb-6 pt-8 text-white shadow relative">
        <button
          className="absolute left-4 top-8 p-2 rounded-full hover:bg-blue-700 focus:outline-none"
          onClick={() => navigate("/teacher/dashboard")}
          aria-label="Back"
        >
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-bold mb-1 text-center">Annual Calendar</h1>
        <p className="text-blue-100 text-base text-center">Academic events, holidays, and important dates</p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md px-2 py-4">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRightIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-1 text-center text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
            {/* Calendar Days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2"></div>;
              }
              const dayEvents = getEventsForDate(day);
              const isCurrentDay = isToday(day);
              const isSelectedDay = isSelected(day);
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`p-2 min-h-[56px] flex flex-col items-center justify-start border border-gray-200 cursor-pointer transition-colors rounded-lg select-none
                    ${
                      isCurrentDay
                        ? "bg-blue-50 border-blue-300"
                        : isSelectedDay
                        ? "bg-blue-100 border-blue-400"
                        : "hover:bg-gray-50"
                    }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? "text-blue-600" : "text-gray-900"}`}>
                    {day.getDate()}
                  </div>
                  {/* Event Dots */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full mt-0.5 ${
                          event.eventType === "holiday"
                            ? "bg-blue-500"
                            : event.eventType === "exam"
                            ? "bg-red-500"
                            : event.eventType === "event"
                            ? "bg-green-500"
                            : event.eventType === "meeting"
                            ? "bg-purple-500"
                            : event.eventType === "deadline"
                            ? "bg-orange-500"
                            : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  {dayEvents.length > 3 && <span className="text-[10px] text-gray-400">+{dayEvents.length - 3}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 text-center">{formatDate(selectedDate)}</h3>
          {selectedDateEvents.length === 0 ? (
            <div className="text-center text-gray-400 py-6">No events for this day.</div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event, index) => {
                const EventIcon = getEventTypeIcon(event.eventType);
                return (
                  <div
                    key={event._id}
                    onClick={() => handleEventClick(event)}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <span className="p-2 rounded-lg bg-white border border-gray-200">
                      <EventIcon className="w-5 h-5" />
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500">{event.eventType}</div>
                    </div>
                    <span className="text-xs text-gray-400">{event.time ? formatTime(event.time) : ""}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Upcoming Events</h3>
          <div className="space-y-2">
            {events
              .filter((event) => new Date(event.date) > new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map((event, index) => {
                const EventIcon = getEventTypeIcon(event.eventType);
                return (
                  <div
                    key={event._id}
                    onClick={() => handleEventClick(event)}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <span className="p-2 rounded-lg bg-white border border-gray-200">
                      <EventIcon className="w-5 h-5" />
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500">{event.eventType}</div>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(new Date(event.date))}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-7 w-full max-w-md mx-4 shadow-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(new Date(selectedEvent.date))}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatTime(selectedEvent.time)}</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(selectedEvent.eventType)}`}>
                    {selectedEvent.eventType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherAnnualCalendar;
