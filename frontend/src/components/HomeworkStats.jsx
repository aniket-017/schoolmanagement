import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const HomeworkStats = ({ stats = {}, isTeacher = false }) => {
  // Ensure stats object exists and has default values
  const safeStats = {
    total: 0,
    dueToday: 0,
    dueTomorrow: 0,
    overdue: 0,
    completed: 0,
    ...stats
  };

  const statCards = [
    {
      title: 'Total Homework',
      value: safeStats.total,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Due Today',
      value: safeStats.dueToday,
      icon: CalendarIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Due Tomorrow',
      value: safeStats.dueTomorrow,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Overdue',
      value: safeStats.overdue,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  if (!isTeacher) {
    // For students, show progress stats instead
    const completedCount = safeStats.completed;
    const totalCount = safeStats.total;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    statCards.splice(2, 2, {
      title: 'Completed',
      value: completedCount,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    });

    statCards.push({
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HomeworkStats; 