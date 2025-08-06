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
    const response = await res.json();
    setEvents(response.data || response);
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

  const handleAddEventForSelectedDate = () => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD for the date input using local timezone
      // Using this approach to prevent timezone issues (day shifting)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setForm({ ...form, date: formattedDate });
      setShowDayModal(false);
      setShowForm(true);
      setEditId(null);
    }
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDate(null);
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-xl mt-4 sm:mt-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            <Calendar className="w-6 h-6 text-amber-500" strokeWidth={2.5} /> Annual Calendar
          </h2>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
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
        <div className="flex items-center justify-center mb-6 gap-4 bg-gray-50/80 py-3 rounded-xl shadow-inner border border-gray-100">
          <button
            className="p-2 rounded-full hover:bg-white hover:shadow-md text-amber-700 transition-all duration-200"
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
          <span className="text-base sm:text-lg font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white shadow-md border border-gray-100 text-gray-800">
            {monthNames[calendarMonth]} {calendarYear}
          </span>
          <button
            className="p-2 rounded-full hover:bg-white hover:shadow-md text-amber-700 transition-all duration-200"
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
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-8 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center font-bold text-gray-700 py-3 text-xs uppercase tracking-wider bg-white rounded-lg shadow-sm border border-gray-100 mb-2"
            >
              {d}
            </div>
          ))}
          {/* Empty boxes for days before the 1st */}
          {Array(firstDayOfWeek)
            .fill(null)
            .map((_, i) => (
              <div key={"empty-" + i} className="min-h-[90px] rounded-lg bg-gray-50/50 border border-gray-100"></div>
            ))}
          {days.map((date) => {
            const dateStr = date.toISOString().slice(0, 10);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={dateStr}
                className={`min-h-[90px] flex flex-col items-start p-3 relative transition-all duration-300 group rounded-xl border ${
                  dayEvents.length
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md hover:shadow-xl hover:scale-105"
                    : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 shadow-sm hover:shadow-md"
                } ${isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${
                  selectedDate && selectedDate.toISOString().slice(0, 10) === dateStr
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : ""
                } hover:border-amber-300`}
                onClick={() => handleDayClick(date)}
              >
                <span
                  className={`font-bold text-sm mb-2 ${
                    isToday ? "text-blue-600" : dayEvents.length ? "text-amber-700" : "text-gray-700"
                  } bg-white/70 rounded-full w-6 h-6 flex items-center justify-center ${isToday ? "bg-blue-100" : ""}`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-1 w-full">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev._id}
                        className="text-xs truncate bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 rounded-lg px-2 py-1 mb-1 font-medium shadow-sm hover:shadow-md transition-shadow duration-200 border border-amber-200/50"
                        title={ev.title}
                      >
                        {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-md border border-amber-100 shadow-sm">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                )}
                {dayEvents.length === 0 && (
                  <div className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Add event
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Day Modal */}
        {showDayModal && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-[95%] sm:max-w-lg relative animate-fadeInUp border border-gray-100">
              {/* Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-t-2xl shadow-inner" />
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-amber-500 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 transition-all duration-200 shadow-sm border border-transparent hover:border-amber-200 hover:scale-110"
                onClick={closeDayModal}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>×
              </button>
              <div className="px-4 sm:px-8 py-5 sm:py-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                  <span className="inline-block w-3 h-3 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full mr-2 shadow-inner" />
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="flex justify-end mb-4">
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                    onClick={handleAddEventForSelectedDate}
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {(eventsByDate[selectedDate.toISOString().slice(0, 10)] || []).length === 0 ? (
                    <div className="text-gray-500 text-center py-10 bg-gray-50/80 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="w-10 h-10 text-amber-400 opacity-70" />
                        <p className="font-medium text-gray-600">No events scheduled for this day</p>
                        <p className="text-xs text-gray-500">Click the Add Event button to create one</p>
                      </div>
                    </div>
                  ) : (
                    eventsByDate[selectedDate.toISOString().slice(0, 10)].map((ev) => (
                      <div
                        key={ev._id}
                        className="border border-amber-200 rounded-xl p-4 bg-gradient-to-br from-amber-50/90 to-amber-100/80 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] group"
                      >
                        <div className="font-semibold text-amber-700 text-lg mb-1 group-hover:text-amber-800 transition-colors">
                          {ev.title}
                        </div>
                        <div className="text-sm text-gray-700 mb-3 bg-white/60 p-2 rounded-lg border border-gray-100">
                          {ev.description}
                        </div>
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          {new Date(ev.date).toLocaleDateString()}
                        </div>
                        <div className="flex gap-3 mt-2">
                          <button
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 shadow-sm transition hover:shadow-md"
                            onClick={() => {
                              setShowDayModal(false);
                              handleEdit(ev);
                            }}
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1 shadow-sm transition hover:shadow-md"
                            onClick={() => handleDelete(ev._id)}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-[95%] sm:max-w-lg relative animate-fadeInUp border border-gray-100">
              {/* Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-t-2xl shadow-inner" />
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-amber-500 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 transition-all duration-200 shadow-sm border border-transparent hover:border-amber-200 hover:scale-110"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm({ title: "", description: "", date: "" });
                }}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>×
              </button>
              <div className="px-4 sm:px-8 py-5 sm:py-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                  <span className="inline-block w-3 h-3 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full mr-2 shadow-inner" />
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-200 bg-gray-50/80 focus:bg-white shadow-sm focus:shadow-md"
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-200 bg-gray-50/80 focus:bg-white resize-none shadow-sm focus:shadow-md"
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-200 bg-gray-50/80 focus:bg-white shadow-sm focus:shadow-md"
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
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-200 shadow-sm hover:shadow-md hover:text-gray-800"
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
