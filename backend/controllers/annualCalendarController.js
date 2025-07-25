const AnnualCalendarEvent = require("../models/AnnualCalendarEvent");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const event = new AnnualCalendarEvent({
      ...req.body,
      createdBy: req.user._id,
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await AnnualCalendarEvent.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await AnnualCalendarEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await AnnualCalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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