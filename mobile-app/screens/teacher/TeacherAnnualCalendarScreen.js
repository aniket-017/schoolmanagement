import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../../services/apiService";
import theme from "../../utils/theme";

const { width } = Dimensions.get("window");

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export default function TeacherAnnualCalendarScreen() {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await apiService.annualCalendar.getEvents();
      setEvents(data);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (calendarMonth === 0) {
              setCalendarMonth(11);
              setCalendarYear(calendarYear - 1);
            } else {
              setCalendarMonth(calendarMonth - 1);
            }
          }}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {calendarYear} / {calendarMonth + 1}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (calendarMonth === 11) {
              setCalendarMonth(0);
              setCalendarYear(calendarYear + 1);
            } else {
              setCalendarMonth(calendarMonth + 1);
            }
          }}
        >
          <Ionicons name="chevron-forward" size={28} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subHeader}>{monthNames[calendarMonth]}</Text>
      <View style={styles.weekRow}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.calendarGrid}>
          <View style={styles.gridRow}>
            {Array(firstDayOfWeek)
              .fill(null)
              .map((_, i) => (
                <View key={"empty-" + i} style={styles.dayCell} />
              ))}
            {days.map((date) => {
              const dateStr = date.toISOString().slice(0, 10);
              const dayEvents = eventsByDate[dateStr] || [];
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.dayCell,
                    today.getDate() === date.getDate() &&
                    today.getMonth() === date.getMonth() &&
                    today.getFullYear() === date.getFullYear()
                      ? styles.todayCell
                      : null,
                    dayEvents.length ? styles.eventCell : null,
                  ]}
                  onPress={() => handleDayClick(date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayNumber}>{date.getDate()}</Text>
                  {dayEvents.length > 0 && (
                    <View style={styles.eventBadge}>
                      <Text style={styles.eventBadgeText}>{dayEvents.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
      {/* Day Modal */}
      {showDayModal && selectedDate && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeDayModal}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(eventsByDate[selectedDate.toISOString().slice(0, 10)] || []).length === 0 ? (
                <Text style={styles.noEventsText}>No events for this day.</Text>
              ) : (
                eventsByDate[selectedDate.toISOString().slice(0, 10)].map((ev) => (
                  <View key={ev._id} style={styles.eventItem}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Text style={styles.eventDesc}>{ev.description}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 64,
  },
  headerText: {
    color: "#1e293b",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    flex: 1,
    textAlign: "center",
  },
  subHeader: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekDay: {
    color: "#64748b",
    fontWeight: "700",
    width: width / 7 - 16,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: width / 7 - 16,
    height: 64,
    margin: 2,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todayCell: {
    borderColor: "#3b82f6",
    borderWidth: 2,
    backgroundColor: "#eff6ff",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCell: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNumber: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "700",
  },
  eventBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  eventBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 0,
    width: width - 32,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTitle: {
    color: "#1e293b",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
    letterSpacing: -0.5,
  },
  noEventsText: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 24,
    fontStyle: "italic",
  },
  eventItem: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    width: "auto",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    color: "#92400e",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  eventDesc: {
    color: "#a16207",
    fontSize: 14,
    lineHeight: 20,
  },
}); 