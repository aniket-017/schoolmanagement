import React, { useState, useEffect } from "react";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import appConfig from "../config/environment";

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

const TeacherAnnouncements = () => {
  const { user } = useTeacherAuth();
  const [tab, setTab] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", classId: "" });
  const [creating, setCreating] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${appConfig.API_BASE_URL}/announcements/teachers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data || []);
      }
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${appConfig.API_BASE_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (e) {
      // handle error
    }
  };

  const filtered = tab === "all"
    ? announcements
    : announcements.filter(a => a.createdBy?._id === user?._id);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${appConfig.API_BASE_URL}/announcements`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: form.title,
          content: form.message,
          targetAudience: "class",
          targetClasses: [form.classId],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ title: "", message: "", classId: "" });
        fetchAnnouncements();
      } else {
        alert(data.message || "Failed to create announcement");
      }
    } catch (e) {
      alert("Failed to create announcement");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-2 py-4 flex justify-center items-start">
      <div className="w-full max-w-md">
        <div className="flex items-center space-x-2 mb-6">
          <button onClick={() => window.history.back()} className="text-2xl text-gray-500 hover:text-blue-600 transition-colors font-bold">←</button>
          <h2 className="text-2xl font-bold tracking-tight">All Announcements</h2>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded-2xl font-semibold text-lg shadow mb-5"
          onClick={() => setShowModal(true)}
        >
          + Create Announcement
        </button>
        <div className="flex mb-6 rounded-xl overflow-hidden shadow-sm">
          <button
            className={`flex-1 py-2 font-semibold text-base transition-colors ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            onClick={() => setTab('all')}
          >
            All Announcements
          </button>
          <button
            className={`flex-1 py-2 font-semibold text-base transition-colors ${tab === 'mine' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            onClick={() => setTab('mine')}
          >
            My Announcements
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No announcements found.</div>
            ) : (
              filtered.map(a => (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl p-5 shadow flex flex-col gap-1 border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => setSelectedAnnouncement(a)}
                >
                  <div className="font-bold text-lg mb-1 text-gray-900">{a.title}</div>
                  <div className="text-gray-700 text-base mb-2 line-clamp-2">{a.content}</div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>By {a.createdBy?.name || 'School Administrator'}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Modal for Create Announcement */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-7 w-full max-w-md mx-2 shadow-2xl border border-gray-200">
              <h3 className="text-xl font-bold mb-5 text-center">Create Announcement for Students</h3>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 text-base focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                  <textarea
                    placeholder="Message"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Select Class</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    value={form.classId}
                    onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.grade}{getOrdinalSuffix(cls.grade)} Class - {cls.division}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
                    onClick={() => setShowModal(false)}
                    disabled={creating}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    disabled={creating}
                  >
                    {creating ? 'CREATING...' : 'CREATE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Full Announcement Modal */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-7 w-full max-w-md mx-2 shadow-2xl border border-gray-200 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold"
                onClick={() => setSelectedAnnouncement(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{selectedAnnouncement.title}</h3>
              <div className="text-gray-700 text-base mb-4 whitespace-pre-line">{selectedAnnouncement.content}</div>
              <div className="mb-2 text-sm text-gray-500">
                <span className="font-medium">Class: </span>
                {selectedAnnouncement.targetClasses && selectedAnnouncement.targetClasses.length > 0
                  ? (() => {
                      const cls = classes.find(cls => cls._id === selectedAnnouncement.targetClasses[0]);
                      return cls ? `${cls.grade}${getOrdinalSuffix(cls.grade)} Class - ${cls.division}` : 'N/A';
                    })()
                  : 'All'}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-4">
                <span>By {selectedAnnouncement.createdBy?.name || 'School Administrator'}</span>
                <span>{new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAnnouncements; 