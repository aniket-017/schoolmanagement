import React, { useEffect, useState } from "react";
import { Calendar, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import appConfig from "../config/environment";

const getMonthDays = (year, month) => {
  // month: 0-indexed
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

const AnnualCalendarAdmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "" });
  const [editId, setEditId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Calendar state
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

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${appConfig.API_BASE_URL}/annual-calendar/${editId}`
      : `${appConfig.API_BASE_URL}/annual-calendar`;

    // Fix: Convert date to local midnight ISO string
    const formToSend = { ...form };
    if (formToSend.date) {
      formToSend.date = new Date(formToSend.date + "T00:00:00").toISOString();
    }

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formToSend),
    });
    setShowForm(false);
    setForm({ title: "", description: "", date: "" });
    setEditId(null);
    fetchEvents();
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10),
    });
    setEditId(event._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${appConfig.API_BASE_URL}/annual-calendar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchEvents();
  };

  // Calendar helpers
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
          <button
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            onClick={() => {
              setShowForm(true);
              setForm({ title: "", description: "", date: "" });
              setEditId(null);
            }}
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
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
            <ChevronLeft />
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
            <ChevronRight />
          </button>
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3 mb-8 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-inner">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-bold text-gray-600 py-3 text-sm uppercase tracking-wide">
              {d}
            </div>
          ))}
          {/* Empty boxes for days before the 1st */}
          {Array(firstDayOfWeek)
            .fill(null)
            .map((_, i) => (
              <div key={"empty-" + i} className="min-h-[80px]"></div>
            ))}
          {days.map((date) => {
            const dateStr = date.toISOString().slice(0, 10);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={dateStr}
                className={`min-h-[80px] flex flex-col items-start p-3 relative transition-all duration-200 group rounded-xl border-2 ${
                  dayEvents.length 
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md hover:shadow-lg hover:scale-105" 
                    : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 shadow-sm hover:shadow-md"
                } ${
                  isToday ? "ring-2 ring-blue-400 ring-offset-2" : ""
                }`}
                onClick={() => handleDayClick(date)}
              >
                <span className={`font-bold text-sm mb-2 ${
                  isToday ? "text-blue-600" : "text-gray-700"
                }`}>
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-1 w-full">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev._id}
                        className="text-xs truncate bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 rounded-lg px-2 py-1 mb-1 font-medium shadow-sm"
                        title={ev.title}
                      >
                        {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-amber-600 font-semibold">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                )}
                {dayEvents.length === 0 && (
                  <div className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to add event
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Day Modal */}
        {showDayModal && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-100/80 via-white/80 to-amber-200/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-lg relative animate-fadeInUp border border-amber-100">
              {/* Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-t-2xl" />
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-amber-500 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-amber-100 transition-colors duration-200 shadow-sm border border-transparent hover:border-amber-200"
                onClick={closeDayModal}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
              <div className="px-8 py-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-700">
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-2" />
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="space-y-4">
                  {(eventsByDate[selectedDate.toISOString().slice(0, 10)] || []).length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No events for this day.</div>
                  ) : (
                    eventsByDate[selectedDate.toISOString().slice(0, 10)].map((ev) => (
                      <div key={ev._id} className="border border-amber-200 rounded-xl p-4 bg-amber-50/70 shadow-sm transition hover:shadow-md">
                        <div className="font-semibold text-amber-700 text-lg mb-1">{ev.title}</div>
                        <div className="text-sm text-gray-700 mb-2">{ev.description}</div>
                        <div className="text-xs text-gray-500 mb-2">{new Date(ev.date).toLocaleDateString()}</div>
                        <div className="flex gap-3 mt-2">
                          <button
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 shadow-sm transition"
                            onClick={() => {
                              setShowDayModal(false);
                              handleEdit(ev);
                            }}
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1 shadow-sm transition"
                            onClick={() => handleDelete(ev._id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-100/80 via-white/80 to-amber-200/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-lg relative animate-fadeInUp border border-amber-100">
              {/* Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-t-2xl" />
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-amber-500 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-amber-100 transition-colors duration-200 shadow-sm border border-transparent hover:border-amber-200"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm({ title: "", description: "", date: "" });
                }}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
              <div className="px-8 py-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-700">
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-2" />
                  {editId ? "Edit Event" : "Add Event"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      placeholder="Enter event description"
                      rows="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="submit" 
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                    >
                      {editId ? "Update" : "Add"} Event
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-200"
                      onClick={() => {
                        setShowForm(false);
                        setEditId(null);
                        setForm({ title: "", description: "", date: "" });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* List fallback for accessibility or if needed */}
        {loading && <div>Loading events...</div>}
      </div>
    </Layout>
  );
};

export default AnnualCalendarAdmin; 