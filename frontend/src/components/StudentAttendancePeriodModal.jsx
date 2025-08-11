import React, { useEffect, useMemo, useState } from "react";
import { X, Calendar, Loader2 } from "lucide-react";
import apiService from "../services/apiService";

const STATUS_STYLES = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-yellow-100 text-yellow-800",
  leave: "bg-blue-100 text-blue-800",
  unmarked: "bg-gray-100 text-gray-800",
};

function formatDateYYYYMMDDLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getISOWeekStart(year, weekNum) {
  // Monday as first day of ISO week
  const simple = new Date(year, 0, 1 + (weekNum - 1) * 7);
  const day = simple.getDay() || 7; // Sunday as 7
  if (day !== 1) simple.setDate(simple.getDate() - (day - 1));
  return simple;
}

function parseWeekPeriod(currentPeriod) {
  // currentPeriod format: YYYY-Www
  const match = /^([0-9]{4})-W([0-9]{1,2})$/.exec(currentPeriod || "");
  const now = new Date();
  const year = match ? parseInt(match[1], 10) : now.getFullYear();
  const weekNum = match ? parseInt(match[2], 10) : 1;
  const startOfWeek = getISOWeekStart(year, weekNum);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return {
    startDate: formatDateYYYYMMDDLocal(startOfWeek),
    endDate: formatDateYYYYMMDDLocal(endOfWeek),
    label: `Week ${weekNum}, ${year}`,
    range: [new Date(startOfWeek), new Date(endOfWeek)],
  };
}

function parseMonthPeriod(currentPeriod) {
  // Accept YYYY-MM or YYYY-M; fallback to current month
  const match = /^([0-9]{4})-([0-9]{1,2})$/.exec(currentPeriod || "");
  const now = new Date();
  const year = match ? parseInt(match[1], 10) : now.getFullYear();
  const month = match ? parseInt(match[2], 10) : now.getMonth() + 1;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const monthName = start.toLocaleString("default", { month: "long" });
  return {
    year,
    month,
    startDate: formatDateYYYYMMDDLocal(start),
    endDate: formatDateYYYYMMDDLocal(end),
    label: `${monthName} ${year}`,
    range: [start, end],
  };
}

function parseYearPeriod(currentPeriod) {
  const year = parseInt(currentPeriod, 10);
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return {
    startDate: formatDateYYYYMMDDLocal(start),
    endDate: formatDateYYYYMMDDLocal(end),
    label: `Year ${year}`,
    year,
  };
}

const StudentAttendancePeriodModal = ({ isOpen, onClose, student, viewType, currentPeriod }) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  // Resolve current period metadata first (used by subsequent memos)
  const periodMeta = useMemo(() => {
    if (!currentPeriod) return null;
    if (viewType === "week") return parseWeekPeriod(currentPeriod);
    if (viewType === "month") return parseMonthPeriod(currentPeriod);
    if (viewType === "year") return parseYearPeriod(currentPeriod);
    return null;
  }, [viewType, currentPeriod]);

  // Build helpful structures for compact views
  const recordsByDate = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      const d = new Date(r.date);
      const key = formatDateYYYYMMDDLocal(d);
      map.set(key, r);
    });
    return map;
  }, [records]);

  const weekDays = useMemo(() => {
    if (viewType !== "week" || !periodMeta?.range) return [];
    const [start, end] = periodMeta.range;
    const days = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [viewType, periodMeta]);

  const monthGrid = useMemo(() => {
    if (viewType !== "month" || !periodMeta?.range) return [];
    const first = new Date(periodMeta.range[0]);
    const last = new Date(periodMeta.range[1]);
    // grid starts on Monday
    const gridStart = new Date(first);
    const day = gridStart.getDay() || 7;
    gridStart.setDate(gridStart.getDate() - (day - 1));
    const grid = [];
    const cursor = new Date(gridStart);
    while (cursor <= last || (cursor.getDay() || 7) !== 1) {
      grid.push({ date: new Date(cursor), inMonth: cursor.getMonth() === first.getMonth() });
      cursor.setDate(cursor.getDate() + 1);
    }
    return grid;
  }, [viewType, periodMeta]);

  const yearlyMonthlyStats = useMemo(() => {
    if (viewType !== "year" || !periodMeta) return [];
    const stats = Array.from({ length: 12 }, () => ({ present: 0, absent: 0, late: 0, leave: 0 }));
    records.forEach((r) => {
      const d = new Date(r.date);
      const m = d.getMonth();
      stats[m][r.status] = (stats[m][r.status] || 0) + 1;
    });
    return stats;
  }, [viewType, periodMeta, records]);

  useEffect(() => {
    if (!isOpen || !student?._id || !periodMeta) return;
    const load = async () => {
      try {
        setLoading(true);
        let params = {};
        if (viewType === "month") {
          params = { month: String(periodMeta.month), year: String(periodMeta.year) };
        } else {
          params = { startDate: periodMeta.startDate, endDate: periodMeta.endDate };
        }
        const response = await apiService.attendance.getStudentAttendance(student._id, params);
        if (response?.success && response?.data?.attendance) {
          // Filter to the exact range to be safe
          const start = new Date(periodMeta.startDate);
          const end = new Date(periodMeta.endDate);
          const filtered = response.data.attendance.filter((r) => {
            const d = new Date(r.date);
            return d >= start && d <= end;
          });
          // Sort ascending by date for readability
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          setRecords(filtered);
        } else {
          setRecords([]);
        }
      } catch (e) {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, student?._id, periodMeta, viewType]);

  if (!isOpen) return null;

  const studentName =
    student?.name || `${student?.firstName || ""} ${student?.middleName || ""} ${student?.lastName || ""}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-10 bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{studentName || "Student"}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{periodMeta?.label}</span>
              {viewType === "week" && periodMeta?.range && (
                <span className="text-gray-500">
                  {periodMeta.range[0].toLocaleDateString()} - {periodMeta.range[1].toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-600">
              <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading...
            </div>
          ) : (
            <>
              {viewType === "week" && (
                <div className="space-y-2">
                  {weekDays.map((d, idx) => {
                    const key = formatDateYYYYMMDDLocal(d);
                    const rec = recordsByDate.get(key);
                    const status = rec?.status || "unmarked";
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="text-gray-900 font-medium">
                          {d.toLocaleDateString()} ({d.toLocaleString(undefined, { weekday: "long" })})
                        </div>
                        <div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[status]}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewType === "month" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 px-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="text-center">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {monthGrid.map(({ date, inMonth }, idx) => {
                      const key = formatDateYYYYMMDDLocal(date);
                      const rec = recordsByDate.get(key);
                      const status = rec?.status || "unmarked";
                      return (
                        <div
                          key={idx}
                          className={`rounded-lg border p-2 text-sm ${
                            inMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs">{date.getDate()}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[status]}`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewType === "year" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 12 }).map((_, m) => {
                    const monthName = new Date(periodMeta.year, m, 1).toLocaleString("default", { month: "short" });
                    const s = yearlyMonthlyStats[m] || { present: 0, absent: 0, late: 0, leave: 0 };
                    const total = s.present + s.absent + s.late + s.leave;
                    return (
                      <div key={m} className="border rounded-lg p-3 bg-white">
                        <div className="text-sm font-semibold mb-2">{monthName}</div>
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">P: {s.present}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800">A: {s.absent}</span>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">L: {s.late}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Lv: {s.leave}</span>
                          <span className="ml-auto text-gray-500">Total: {total}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewType !== "week" && viewType !== "month" && viewType !== "year" && (
                <div className="text-center py-10 text-gray-500">No attendance records in this period.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePeriodModal;
