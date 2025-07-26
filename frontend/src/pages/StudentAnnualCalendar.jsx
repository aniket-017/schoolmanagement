import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const StudentAnnualCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const { user } = useTeacherAuth();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadAnnualCalendar();
  }, [currentMonth]);

  const loadAnnualCalendar = async () => {
    try {
      setLoading(true);
      const response = await apiService.annualCalendar.getStudentCalendar();
      
      if (response.success) {
        setEvents(response.data || []);
      } else {
        console.error('Failed to load calendar:', response.message);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case 'exam':
        return ExclamationTriangleIcon;
      case 'holiday':
        return CalendarIcon;
      case 'event':
        return InformationCircleIcon;
      case 'meeting':
        return AcademicCapIcon;
      case 'deadline':
        return ClockIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
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

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center p-4">
            <Link to="/student/dashboard" className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold text-center flex-1">Annual Calendar</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Calendar Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square p-1 ${
                    !day ? 'bg-transparent' : 
                    isToday(day) ? 'bg-blue-100' : 
                    isSelected(day) ? 'bg-blue-50' : 
                    'bg-gray-50 hover:bg-gray-100'
                  } rounded-lg cursor-pointer transition-colors`}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <span className={`text-sm font-medium ${
                        isToday(day) ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </span>
                      {getEventsForDate(day).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getEventsForDate(day).slice(0, 2).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="w-2 h-2 bg-orange-400 rounded-full"
                              title={event.title}
                            />
                          ))}
                          {getEventsForDate(day).length > 2 && (
                            <span className="text-xs text-gray-500">+{getEventsForDate(day).length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {formatDate(selectedDate)}
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No events for this day</p>
                <p className="text-gray-400 text-sm">Check other dates for upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event, index) => {
                  const EventIcon = getEventTypeIcon(event.type);
                  return (
                    <motion.div
                      key={event._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <EventIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{event.type || "Event"}</span>
                          {event.time && <span>{formatTime(event.time)}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {selectedEvent.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {selectedEvent.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(new Date(selectedEvent.date))}</span>
                  </div>
                  {selectedEvent.time && (
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatTime(selectedEvent.time)}</span>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-full mt-6 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/student/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Annual Calendar</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square p-2 ${
                    !day ? 'bg-transparent' : 
                    isToday(day) ? 'bg-blue-100' : 
                    isSelected(day) ? 'bg-blue-50' : 
                    'bg-gray-50 hover:bg-gray-100'
                  } rounded-lg cursor-pointer transition-colors`}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <span className={`text-sm font-medium ${
                        isToday(day) ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </span>
                      {getEventsForDate(day).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getEventsForDate(day).slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="w-2 h-2 bg-orange-400 rounded-full"
                              title={event.title}
                            />
                          ))}
                          {getEventsForDate(day).length > 3 && (
                            <span className="text-xs text-gray-500">+{getEventsForDate(day).length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {formatDate(selectedDate)}
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No events for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map((event, index) => {
                  const EventIcon = getEventTypeIcon(event.type);
                  return (
                    <div
                      key={event._id || index}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <EventIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {event.title}
                          </h4>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{event.type || "Event"}</span>
                            {event.time && <span>{formatTime(event.time)}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {selectedEvent.title}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {selectedEvent.description}
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(new Date(selectedEvent.date))}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatTime(selectedEvent.time)}</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="w-full mt-6 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnualCalendar; 