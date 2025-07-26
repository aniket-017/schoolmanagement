const AnnualCalendarEvent = require("../models/AnnualCalendarEvent");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const event = new AnnualCalendarEvent({
      ...req.body,
      createdBy: req.user._id,
    });
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await AnnualCalendarEvent.find({ isActive: true }).sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await AnnualCalendarEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await AnnualCalendarEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await AnnualCalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all events for teachers (can be customized for teacher-specific logic)
exports.getTeacherCalendar = async (req, res) => {
  try {
    const events = await AnnualCalendarEvent.find({ isActive: true }).sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 