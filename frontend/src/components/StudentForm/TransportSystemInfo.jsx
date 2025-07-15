import React from "react";

export default function TransportSystemInfo({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Transport & System Information</h3>

      {/* Transport Details */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Transport Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="transportRequired"
              checked={form.transportRequired || false}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium">Transport Required</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bus Number</label>
            <input
              type="text"
              name="busNumber"
              value={form.busNumber || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Point</label>
            <input
              type="text"
              name="pickupPoint"
              value={form.pickupPoint || ""}
              onChange={handleChange}
              placeholder="e.g., Main Gate, Bus Stop"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Drop Point</label>
            <input
              type="text"
              name="dropPoint"
              value={form.dropPoint || ""}
              onChange={handleChange}
              placeholder="e.g., School Gate"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Driver Name</label>
            <input
              type="text"
              name="driverName"
              value={form.driverName || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Driver Phone</label>
            <input
              type="tel"
              name="driverPhone"
              value={form.driverPhone || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hostel Information */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Hostel Information (if applicable)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room Number</label>
            <input
              type="text"
              name="hostelRoomNumber"
              value={form.hostelRoomNumber || ""}
              onChange={handleChange}
              placeholder="e.g., A-101"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Warden Name</label>
            <input
              type="text"
              name="hostelWardenName"
              value={form.hostelWardenName || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Warden Phone</label>
            <input
              type="tel"
              name="hostelWardenPhone"
              value={form.hostelWardenPhone || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* System & Access Information */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">System & Access Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">RFID Card Number</label>
            <input
              type="text"
              name="rfidCardNumber"
              value={form.rfidCardNumber || ""}
              onChange={handleChange}
              placeholder="e.g., RFID001"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Library Card Number</label>
            <input
              type="text"
              name="libraryCardNumber"
              value={form.libraryCardNumber || ""}
              onChange={handleChange}
              placeholder="e.g., LIB001"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Student Portal Username</label>
            <input
              type="text"
              name="portalUsername"
              value={form.portalUsername || ""}
              onChange={handleChange}
              placeholder="Auto-generated if left empty"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Student Portal Password</label>
            <input
              type="password"
              name="portalPassword"
              value={form.portalPassword || ""}
              onChange={handleChange}
              placeholder="Auto-generated if left empty"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Additional Notes</h4>
        <div>
          <label className="block text-sm font-medium mb-1">Special Instructions</label>
          <textarea
            name="specialInstructions"
            value={form.specialInstructions || ""}
            onChange={handleChange}
            rows={3}
            placeholder="Any special instructions for transport, hostel, or system access"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
