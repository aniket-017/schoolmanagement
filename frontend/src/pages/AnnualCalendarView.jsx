import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Layout from "../components/Layout";
import appConfig from "../config/environment";

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AnnualCalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const fetchEvents = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${appConfig.API_BASE_URL}/annual-calendar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const days = getMonthDays(calendarYear, calendarMonth);
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = new Date(event.date).toISOString().slice(0, 10);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {});

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDate(null);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500" /> Annual Calendar
          </h2>
        </div>
        {/* Month Selector */}
        <div className="flex items-center justify-center mb-4 gap-4">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(calendarYear - 1);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
          >
            <span>&lt;</span>
          </button>
          <span className="text-lg font-semibold">
            {monthNames[calendarMonth]} {calendarYear}
          </span>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(calendarYear + 1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
          >
            <span>&gt;</span>
          </button>
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-semibold text-gray-500 py-1">
              {d}
            </div>
          ))}
          {/* Empty boxes for days before the 1st */}
          {Array(firstDayOfWeek)
            .fill(null)
            .map((_, i) => (
              <div key={"empty-" + i}></div>
            ))}
          {days.map((date) => {
            const dateStr = date.toISOString().slice(0, 10);
            const dayEvents = eventsByDate[dateStr] || [];
            return (
              <button
                key={dateStr}
                className={`border rounded-lg min-h-[70px] flex flex-col items-start p-2 relative hover:bg-amber-50 transition group ${
                  dayEvents.length ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"
                }`}
                onClick={() => handleDayClick(date)}
              >
                <span className="font-bold text-sm mb-1">{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-1 w-full">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev._id}
                        className="text-xs truncate bg-amber-100 text-amber-700 rounded px-1 py-0.5 mb-0.5"
                        title={ev.title}
                      >
                        {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-amber-600">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Day Modal */}
        {showDayModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={closeDayModal}
              >
                ×
              </button>
              <h3 className="text-lg font-bold mb-2">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {(eventsByDate[selectedDate.toISOString().slice(0, 10)] || []).length === 0 ? (
                  <div className="text-gray-500">No events for this day.</div>
                ) : (
                  eventsByDate[selectedDate.toISOString().slice(0, 10)].map((ev) => (
                    <div key={ev._id} className="border rounded p-2 bg-amber-50">
                      <div className="font-semibold text-amber-700">{ev.title}</div>
                      <div className="text-sm text-gray-700 mb-1">{ev.description}</div>
                      <div className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {loading && <div>Loading events...</div>}
      </div>
    </Layout>
  );
};

export default AnnualCalendarView; 