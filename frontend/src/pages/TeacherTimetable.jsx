import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import apiService from '../services/apiService';

const TeacherTimetable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useTeacherAuth();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '8:00 AM - 8:45 AM',
    '8:45 AM - 9:30 AM',
    '9:30 AM - 10:15 AM',
    '10:15 AM - 11:00 AM',
    '11:00 AM - 11:45 AM',
    '11:45 AM - 12:30 PM',
    '12:30 PM - 1:15 PM',
    '1:15 PM - 2:00 PM',
    '2:00 PM - 2:45 PM',
    '2:45 PM - 3:30 PM',
  ];

  useEffect(() => {
    loadTeacherTimetable();
  }, [currentWeek]);

  const loadTeacherTimetable = async () => {
    try {
      setLoading(true);
      const response = await apiService.timetable.getTeacherTimetable();
      
      if (response.success) {
        setTimetable(response.data);
      } else {
        console.error('Failed to load timetable:', response.message);
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 6; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  const getTimetableForDay = (dayName) => {
    return timetable.filter(item => item.day === dayName);
  };

  const getTimetableForTimeSlot = (dayName, timeSlot) => {
    const dayTimetable = getTimetableForDay(dayName);
    return dayTimetable.find(item => item.timeSlot === timeSlot);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    const slotTimes = [
      { start: 8 * 60, end: 8 * 60 + 45 }, // 8:00-8:45
      { start: 8 * 60 + 45, end: 9 * 60 + 30 }, // 8:45-9:30
      { start: 9 * 60 + 30, end: 10 * 60 + 15 }, // 9:30-10:15
      { start: 10 * 60 + 15, end: 11 * 60 }, // 10:15-11:00
      { start: 11 * 60, end: 11 * 60 + 45 }, // 11:00-11:45
      { start: 11 * 60 + 45, end: 12 * 60 + 30 }, // 11:45-12:30
      { start: 12 * 60 + 30, end: 13 * 60 + 15 }, // 12:30-1:15
      { start: 13 * 60 + 15, end: 14 * 60 }, // 1:15-2:00
      { start: 14 * 60, end: 14 * 60 + 45 }, // 2:00-2:45
      { start: 14 * 60 + 45, end: 15 * 60 + 30 }, // 2:45-3:30
    ];
    
    for (let i = 0; i < slotTimes.length; i++) {
      if (timeInMinutes >= slotTimes[i].start && timeInMinutes < slotTimes[i].end) {
        return i;
      }
    }
    return -1;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates(currentWeek);
  const currentTimeSlot = getCurrentTimeSlot();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">My Teaching Schedule</h1>
            <p className="text-blue-100">Weekly timetable and class schedule</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Week Navigation */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentWeek.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <p className="text-sm text-gray-600">Week of {formatDate(weekDates[0])}</p>
              </div>
              
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Timetable */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">
                      Time
                    </th>
                    {daysOfWeek.map((day, index) => (
                      <th key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-48">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">{day}</span>
                          <span className={`text-xs mt-1 px-2 py-1 rounded-full ${
                            isToday(weekDates[index]) 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {formatDate(weekDates[index])}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <tr 
                      key={timeSlot}
                      className={`${
                        currentTimeSlot === timeIndex && isToday(new Date())
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>{timeSlot}</span>
                        </div>
                      </td>
                      {daysOfWeek.map((day) => {
                        const classData = getTimetableForTimeSlot(day, timeSlot);
                        return (
                          <td key={day} className="px-4 py-3">
                            {classData ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-3 rounded-lg border-l-4 ${
                                  classData.subject?.name === 'Break' || classData.subject?.name === 'Lunch'
                                    ? 'bg-yellow-50 border-yellow-400'
                                    : 'bg-blue-50 border-blue-400'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <AcademicCapIcon className="w-4 h-4 text-gray-600" />
                                    <span className="font-medium text-gray-900">
                                      {classData.subject?.name || 'No Subject'}
                                    </span>
                                  </div>
                                  
                                  {classData.class && (
                                    <div className="flex items-center space-x-2">
                                      <MapPinIcon className="w-3 h-3 text-gray-500" />
                                      <span className="text-sm text-gray-600">
                                        {classData.class.grade}{classData.class.grade === 1 ? 'st' : 
                                         classData.class.grade === 2 ? 'nd' : 
                                         classData.class.grade === 3 ? 'rd' : 'th'} - {classData.class.division}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {classData.classroom && (
                                    <div className="text-xs text-gray-500">
                                      Room: {classData.classroom}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ) : (
                              <div className="p-3 text-center text-gray-400 text-sm">
                                Free
                              </div>
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

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {timetable.filter(item => item.subject?.name !== 'Break' && item.subject?.name !== 'Lunch').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Classes Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {timetable.filter(item => 
                      item.day === daysOfWeek[new Date().getDay() - 1] && 
                      item.subject?.name !== 'Break' && 
                      item.subject?.name !== 'Lunch'
                    ).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teaching Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(timetable.filter(item => 
                      item.subject?.name !== 'Break' && item.subject?.name !== 'Lunch'
                    ).length * 0.75)} hrs/week
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {timetable.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Timetable Available</h3>
              <p className="text-gray-600">
                Your teaching schedule hasn't been set up yet. Please contact the administration.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherTimetable; 