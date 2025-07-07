const Transport = require("../models/Transport");
const StudentTransport = require("../models/StudentTransport");
const User = require("../models/User");

// Create a new transport route
exports.createTransport = async (req, res) => {
  try {
    const {
      route_name,
      route_number,
      driver_id,
      vehicle_number,
      vehicle_type,
      capacity,
      pickup_points,
      route_timings,
      monthly_fee,
      status,
    } = req.body;

    // Validate required fields
    if (!route_name || !route_number || !driver_id || !vehicle_number || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Route name, route number, driver ID, vehicle number, and capacity are required",
      });
    }

    // Check if driver exists and has bus_driver role
    const driver = await User.findById(driver_id);
    if (!driver || driver.role !== "bus_driver") {
      return res.status(404).json({
        success: false,
        message: "Driver not found or invalid role",
      });
    }

    // Check if route number already exists
    const existingRoute = await Transport.findOne({ route_number });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: "Route number already exists",
      });
    }

    // Check if vehicle number already exists
    const existingVehicle = await Transport.findOne({ vehicle_number });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already exists",
      });
    }

    const transport = new Transport({
      route_name,
      route_number,
      driver_id,
      vehicle_number,
      vehicle_type,
      capacity,
      pickup_points: pickup_points || [],
      route_timings: route_timings || [],
      monthly_fee: monthly_fee || 0,
      status: status || "active",
      created_by: req.user.id,
    });

    await transport.save();
    await transport.populate(["driver_id", "created_by"]);

    res.status(201).json({
      success: true,
      message: "Transport route created successfully",
      data: transport,
    });
  } catch (error) {
    console.error("Error creating transport:", error);
    res.status(500).json({
      success: false,
      message: "Error creating transport route",
      error: error.message,
    });
  }
};

// Get all transport routes with filters
exports.getTransports = async (req, res) => {
  try {
    const { driver_id, status, vehicle_type, route_number, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (driver_id) query.driver_id = driver_id;
    if (status) query.status = status;
    if (vehicle_type) query.vehicle_type = vehicle_type;
    if (route_number) query.route_number = route_number;

    // Search functionality
    if (search) {
      query.$or = [
        { route_name: new RegExp(search, "i") },
        { route_number: new RegExp(search, "i") },
        { vehicle_number: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;

    const transports = await Transport.find(query)
      .populate("driver_id", "name email phone")
      .populate("created_by", "name email")
      .sort({ route_number: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add student count for each route
    const transportsWithStudentCount = await Promise.all(
      transports.map(async (transport) => {
        const studentCount = await StudentTransport.countDocuments({
          transport_id: transport._id,
          status: "active",
        });
        return {
          ...transport.toObject(),
          student_count: studentCount,
          available_seats: transport.capacity - studentCount,
        };
      })
    );

    const total = await Transport.countDocuments(query);

    res.json({
      success: true,
      data: transportsWithStudentCount,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching transports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transport routes",
      error: error.message,
    });
  }
};

// Get transport route by ID
exports.getTransportById = async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id)
      .populate("driver_id", "name email phone")
      .populate("created_by", "name email");

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport route not found",
      });
    }

    // Get assigned students
    const assignedStudents = await StudentTransport.find({
      transport_id: req.params.id,
      status: "active",
    }).populate("student_id", "name email roll_number");

    const studentCount = assignedStudents.length;
    const availableSeats = transport.capacity - studentCount;

    res.json({
      success: true,
      data: {
        transport,
        assigned_students: assignedStudents,
        student_count: studentCount,
        available_seats: availableSeats,
      },
    });
  } catch (error) {
    console.error("Error fetching transport:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transport route",
      error: error.message,
    });
  }
};

// Update transport route
exports.updateTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating certain fields
    delete updateData.created_by;
    delete updateData.created_at;

    // If updating driver, validate the new driver
    if (updateData.driver_id) {
      const driver = await User.findById(updateData.driver_id);
      if (!driver || driver.role !== "bus_driver") {
        return res.status(404).json({
          success: false,
          message: "Driver not found or invalid role",
        });
      }
    }

    // If updating route number, check for duplicates
    if (updateData.route_number) {
      const existingRoute = await Transport.findOne({
        route_number: updateData.route_number,
        _id: { $ne: id },
      });
      if (existingRoute) {
        return res.status(400).json({
          success: false,
          message: "Route number already exists",
        });
      }
    }

    // If updating vehicle number, check for duplicates
    if (updateData.vehicle_number) {
      const existingVehicle = await Transport.findOne({
        vehicle_number: updateData.vehicle_number,
        _id: { $ne: id },
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle number already exists",
        });
      }
    }

    const transport = await Transport.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate([
      "driver_id",
      "created_by",
    ]);

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport route not found",
      });
    }

    res.json({
      success: true,
      message: "Transport route updated successfully",
      data: transport,
    });
  } catch (error) {
    console.error("Error updating transport:", error);
    res.status(500).json({
      success: false,
      message: "Error updating transport route",
      error: error.message,
    });
  }
};

// Delete transport route
exports.deleteTransport = async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport route not found",
      });
    }

    // Check if there are any active student assignments
    const activeAssignments = await StudentTransport.countDocuments({
      transport_id: req.params.id,
      status: "active",
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete transport route with active student assignments",
      });
    }

    await Transport.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Transport route deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transport:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting transport route",
      error: error.message,
    });
  }
};

// Assign student to transport
exports.assignStudentToTransport = async (req, res) => {
  try {
    const { student_id, transport_id, pickup_point, monthly_fee } = req.body;

    // Validate required fields
    if (!student_id || !transport_id || !pickup_point) {
      return res.status(400).json({
        success: false,
        message: "Student ID, transport ID, and pickup point are required",
      });
    }

    // Check if student exists
    const student = await User.findById(student_id);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if transport exists
    const transport = await Transport.findById(transport_id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: "Transport route not found",
      });
    }

    // Check if student already has an active transport assignment
    const existingAssignment = await StudentTransport.findOne({
      student_id,
      status: "active",
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Student already has an active transport assignment",
      });
    }

    // Check if transport has available capacity
    const currentStudentCount = await StudentTransport.countDocuments({
      transport_id,
      status: "active",
    });

    if (currentStudentCount >= transport.capacity) {
      return res.status(400).json({
        success: false,
        message: "Transport route has reached maximum capacity",
      });
    }

    // Validate pickup point
    if (!transport.pickup_points.includes(pickup_point)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup point for this route",
      });
    }

    const studentTransport = new StudentTransport({
      student_id,
      transport_id,
      pickup_point,
      monthly_fee: monthly_fee || transport.monthly_fee,
      status: "active",
      assigned_by: req.user.id,
    });

    await studentTransport.save();
    await studentTransport.populate(["student_id", "transport_id", "assigned_by"]);

    res.status(201).json({
      success: true,
      message: "Student assigned to transport successfully",
      data: studentTransport,
    });
  } catch (error) {
    console.error("Error assigning student to transport:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning student to transport",
      error: error.message,
    });
  }
};

// Get student transport assignments
exports.getStudentTransportAssignments = async (req, res) => {
  try {
    const { student_id, transport_id, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (student_id) query.student_id = student_id;
    if (transport_id) query.transport_id = transport_id;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const assignments = await StudentTransport.find(query)
      .populate("student_id", "name email roll_number")
      .populate("transport_id", "route_name route_number vehicle_number")
      .populate("assigned_by", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudentTransport.countDocuments(query);

    res.json({
      success: true,
      data: assignments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching student transport assignments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student transport assignments",
      error: error.message,
    });
  }
};

// Update student transport assignment
exports.updateStudentTransportAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating certain fields
    delete updateData.student_id;
    delete updateData.transport_id;
    delete updateData.assigned_by;
    delete updateData.created_at;

    const assignment = await StudentTransport.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["student_id", "transport_id", "assigned_by"]);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Student transport assignment not found",
      });
    }

    res.json({
      success: true,
      message: "Student transport assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating student transport assignment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student transport assignment",
      error: error.message,
    });
  }
};

// Deactivate student transport assignment
exports.deactivateStudentTransportAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await StudentTransport.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true, runValidators: true }
    ).populate(["student_id", "transport_id", "assigned_by"]);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Student transport assignment not found",
      });
    }

    res.json({
      success: true,
      message: "Student transport assignment deactivated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error deactivating student transport assignment:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating student transport assignment",
      error: error.message,
    });
  }
};

// Get transport statistics
exports.getTransportStats = async (req, res) => {
  try {
    const totalRoutes = await Transport.countDocuments();
    const activeRoutes = await Transport.countDocuments({ status: "active" });
    const inactiveRoutes = await Transport.countDocuments({ status: "inactive" });

    const totalCapacity = await Transport.aggregate([{ $group: { _id: null, total: { $sum: "$capacity" } } }]);

    const totalStudents = await StudentTransport.countDocuments({ status: "active" });

    const routeUtilization = await Transport.aggregate([
      {
        $lookup: {
          from: "studenttransports",
          let: { transportId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$transport_id", "$$transportId"] }, { $eq: ["$status", "active"] }] },
              },
            },
          ],
          as: "students",
        },
      },
      {
        $project: {
          route_name: 1,
          route_number: 1,
          capacity: 1,
          student_count: { $size: "$students" },
          utilization_percentage: { $multiply: [{ $divide: [{ $size: "$students" }, "$capacity"] }, 100] },
        },
      },
      { $sort: { utilization_percentage: -1 } },
    ]);

    const driverStats = await Transport.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "driver_id",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: "$driver" },
      {
        $group: {
          _id: "$driver_id",
          driver_name: { $first: "$driver.name" },
          routes_count: { $sum: 1 },
          total_capacity: { $sum: "$capacity" },
        },
      },
      { $sort: { routes_count: -1 } },
    ]);

    const vehicleTypeStats = await Transport.aggregate([
      { $group: { _id: "$vehicle_type", count: { $sum: 1 }, total_capacity: { $sum: "$capacity" } } },
    ]);

    res.json({
      success: true,
      data: {
        total_routes: totalRoutes,
        active_routes: activeRoutes,
        inactive_routes: inactiveRoutes,
        total_capacity: totalCapacity.length > 0 ? totalCapacity[0].total : 0,
        total_students: totalStudents,
        utilization_percentage:
          totalCapacity.length > 0 && totalCapacity[0].total > 0
            ? ((totalStudents / totalCapacity[0].total) * 100).toFixed(2)
            : 0,
        route_utilization: routeUtilization,
        driver_stats: driverStats,
        vehicle_type_stats: vehicleTypeStats,
      },
    });
  } catch (error) {
    console.error("Error fetching transport statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transport statistics",
      error: error.message,
    });
  }
};
