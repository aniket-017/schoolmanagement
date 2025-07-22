import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Calendar, Plus, Trash2 } from "lucide-react";
import appConfig from "../config/environment";

const defaultPeriod = {
  name: "Period 1",
  startTime: "07:00",
  endTime: "07:45",
  type: "period",
  duration: 45,
};

const TimetableOutlineManager = () => {
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    periods: [{ ...defaultPeriod }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [viewOutline, setViewOutline] = useState(null);
  const [editOutline, setEditOutline] = useState(null);

  useEffect(() => {
    fetchOutlines();
  }, []);

  const fetchOutlines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${appConfig.API_BASE_URL}/timetables/outlines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOutlines(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = () => {
    setForm((prev) => {
      let startTime = "07:00";
      let endTime = "07:40";
      if (prev.periods.length > 0) {
        const last = prev.periods[prev.periods.length - 1];
        startTime = last.endTime;
        // Calculate end time +40 min
        const [sh, sm] = startTime.split(":").map(Number);
        let mins = sh * 60 + sm + 40;
        if (mins >= 24 * 60) mins = mins % (24 * 60);
        const eh = Math.floor(mins / 60)
          .toString()
          .padStart(2, "0");
        const em = (mins % 60).toString().padStart(2, "0");
        endTime = `${eh}:${em}`;
      }
      return {
        ...prev,
        periods: [
          ...prev.periods,
          {
            name: `Period ${prev.periods.length + 1}`,
            startTime,
            endTime,
            type: "period",
            duration: calcDuration({ startTime, endTime }, "endTime", endTime),
          },
        ],
      };
    });
  };

  const handleRemovePeriod = (idx) => {
    setForm((prev) => ({
      ...prev,
      periods: prev.periods.filter((_, i) => i !== idx),
    }));
  };

  const handlePeriodChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      periods: prev.periods.map((p, i) =>
        i === idx
          ? {
              ...p,
              [field]: value,
              duration: field === "startTime" || field === "endTime" ? calcDuration(p, field, value) : p.duration,
            }
          : p
      ),
    }));
  };

  const calcDuration = (period, field, value) => {
    let start = field === "startTime" ? value : period.startTime;
    let end = field === "endTime" ? value : period.endTime;
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let startMins = sh * 60 + sm;
    let endMins = eh * 60 + em;
    // If end is less than start, treat as afternoon (add 12 hours to end)
    if (endMins < startMins) endMins += 12 * 60;
    return endMins > startMins ? endMins - startMins : 0;
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${appConfig.API_BASE_URL}/timetables/outlines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ name: "", description: "", periods: [{ ...defaultPeriod }] });
        fetchOutlines();
      } else {
        setError(data.message || "Failed to save outline");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this outline?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${appConfig.API_BASE_URL}/timetables/outlines/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOutlines();
  };

  // Add this function for updating
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${appConfig.API_BASE_URL}/timetables/outlines/${editOutline._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditOutline(null);
        setForm({ name: "", description: "", periods: [{ ...defaultPeriod }] });
        fetchOutlines();
      } else {
        setError(data.message || "Failed to update outline");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Calendar className="w-7 h-7 mr-2 text-green-600" />
              Timetable Outlines
            </h1>
            <p className="text-gray-600">Define and manage period/break structures for different class timetables.</p>
          </div>
          <button
            className="flex items-center px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Outline
          </button>
        </div>
        {/* List Outlines */}
        <div className="bg-white rounded-xl shadow p-8">
          {loading ? (
            <div className="text-gray-400 text-center">Loading...</div>
          ) : outlines.length === 0 ? (
            <div className="text-gray-400 text-center">No outlines found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Periods/Breaks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {outlines.map((outline) => (
                  <tr
                    key={outline._id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setViewOutline(outline)}
                  >
                    <td className="py-2 font-semibold">{outline.name}</td>
                    <td className="py-2">{outline.description}</td>
                    <td className="py-2">{outline.periods.length}</td>
                    <td className="py-2 text-right flex gap-2 justify-end">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditOutline(outline);
                          setForm({
                            name: outline.name,
                            description: outline.description,
                            periods: outline.periods.map((p) => ({ ...p })),
                          });
                          setShowModal(true);
                        }}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(outline._id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal for Creating/Editing Outline */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowModal(false);
                  setEditOutline(null);
                  setForm({ name: "", description: "", periods: [{ ...defaultPeriod }] });
                }}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 px-8 pt-8">
                {editOutline ? "Edit Timetable Outline" : "Create Timetable Outline"}
              </h2>
              <form onSubmit={editOutline ? handleUpdate : handleSave} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Periods & Breaks</label>
                    <div className="space-y-2">
                      {form.periods.map((period, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={period.name}
                            onChange={(e) => handlePeriodChange(idx, "name", e.target.value)}
                            className="border px-2 py-1 rounded w-32"
                            placeholder="Name"
                            required
                          />
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) => handlePeriodChange(idx, "startTime", e.target.value)}
                            className="border px-2 py-1 rounded"
                            required
                          />
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) => handlePeriodChange(idx, "endTime", e.target.value)}
                            className="border px-2 py-1 rounded"
                            required
                          />
                          <select
                            value={period.type}
                            onChange={(e) => handlePeriodChange(idx, "type", e.target.value)}
                            className="border px-2 py-1 rounded"
                          >
                            <option value="period">Period</option>
                            <option value="break">Break</option>
                          </select>
                          <span className="text-xs text-gray-500 w-16">{period.duration} min</span>
                          {form.periods.length > 1 && (
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemovePeriod(idx)}
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={handleAddPeriod}
                      >
                        + Add Period/Break
                      </button>
                    </div>
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                </div>
                <div className="sticky bottom-0 left-0 right-0 bg-white px-8 py-4 border-t flex justify-end z-10">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving
                      ? editOutline
                        ? "Updating..."
                        : "Saving..."
                      : editOutline
                      ? "Update Outline"
                      : "Save Outline"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Outline Modal */}
        {viewOutline && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setViewOutline(null)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-2">{viewOutline.name}</h2>
              <p className="mb-4 text-gray-600">{viewOutline.description}</p>
              <table className="w-full mb-2">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Start</th>
                    <th className="text-left py-2">End</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOutline.periods.map((p, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-1">{p.name}</td>
                      <td className="py-1 capitalize">{p.type}</td>
                      <td className="py-1">{p.startTime}</td>
                      <td className="py-1">{p.endTime}</td>
                      <td className="py-1">{p.duration} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TimetableOutlineManager;
