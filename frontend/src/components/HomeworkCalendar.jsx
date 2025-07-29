import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import HomeworkCard from './HomeworkCard';

const HomeworkCalendar = ({ homework, isTeacher = false, onEdit, onDelete, onProgressUpdate, onViewDetails }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [selectedDate, setSelectedDate] = useState(null);



  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getHomeworkForDate = (date) => {
    if (!homework || !Array.isArray(homework)) {
      return [];
    }
    
    const dateString = date.toISOString().split('T')[0];
    return homework.filter(hw => {
      if (!hw.dueDate) return false;
      
      try {
        const dueDate = new Date(hw.dueDate);
        if (isNaN(dueDate.getTime())) return false;
        
        const dueDateString = dueDate.toISOString().split('T')[0];
        return dueDateString === dateString;
      } catch (error) {
        console.error('Error processing homework date:', error, hw);
        return false;
      }
    });
  };

  const getDateStatus = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (checkDate.getTime() === today.getTime()) {
      return 'today';
    } else if (checkDate < today) {
      return 'past';
    } else if (checkDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return 'tomorrow';
    } else {
      return 'future';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const dates = viewMode === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {viewMode === 'week' ? formatDate(currentDate) : formatMonth(currentDate)}
          </h2>
          <button
            onClick={() => navigateDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit mx-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'week' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'month' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {dates.map((date, index) => {
              const dateHomework = getHomeworkForDate(date);
              const dateStatus = getDateStatus(date);
              const isToday = dateStatus === 'today';
              const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
              
              return (
                <motion.div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square p-1 border rounded-lg cursor-pointer transition-colors ${
                    isToday 
                      ? 'bg-blue-100' 
                      : isSelected 
                        ? 'bg-blue-50' 
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </span>
                    
                    {dateHomework.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dateHomework.slice(0, 2).map((hw) => (
                          <div
                            key={hw._id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: hw.color || '#3B82F6' }}
                            title={hw.title}
                          />
                        ))}
                        {dateHomework.length > 2 && (
                          <span className="text-xs text-gray-500">+{dateHomework.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {dates.map((date, index) => {
              const dateHomework = getHomeworkForDate(date);
              const dateStatus = getDateStatus(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = dateStatus === 'today';
              
              return (
                <motion.div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square p-1 border rounded cursor-pointer transition-colors ${
                    !isCurrentMonth 
                      ? 'bg-gray-50 text-gray-400' 
                      : isToday 
                        ? 'bg-blue-100' 
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <span className={`text-xs font-medium ${
                      isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </span>
                    
                    {dateHomework.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dateHomework.slice(0, 3).map((hw) => (
                          <div
                            key={hw._id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: hw.color || '#3B82F6' }}
                            title={hw.title}
                          />
                        ))}
                        {dateHomework.length > 3 && (
                          <span className="text-xs text-gray-400">+{dateHomework.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Date Homework */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 bg-gray-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                Homework for {formatDate(selectedDate)}
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getHomeworkForDate(selectedDate).length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No homework due on this date</p>
                </div>
              ) : (
                getHomeworkForDate(selectedDate).map((hw) => (
                  <HomeworkCard
                    key={hw._id}
                    homework={hw}
                    isTeacher={isTeacher}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onProgressUpdate={onProgressUpdate}
                    onViewDetails={onViewDetails}
                  />
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomeworkCalendar; 