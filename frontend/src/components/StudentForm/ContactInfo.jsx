import React from "react";

export default function ContactInfo({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact & Address Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Current Address *</label>
          <textarea
            name="currentAddress"
            value={form.currentAddress}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Permanent Address</label>
          <textarea
            name="permanentAddress"
            value={form.permanentAddress}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pin Code</label>
          <input
            type="text"
            name="pinCode"
            value={form.pinCode}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile Number *</label>
          <input
            type="tel"
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            required
            pattern="^[1-9]\d{9}$"
            title="Mobile number must be exactly 10 digits and cannot start with 0"
            placeholder="Enter 10 digit mobile number"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Optional Mobile Number</label>
          <input
            type="tel"
            name="optionalMobileNumber"
            value={form.optionalMobileNumber}
            onChange={handleChange}
            pattern="^[1-9]\d{9}$"
            title="Mobile number must be exactly 10 digits and cannot start with 0"
            placeholder="Enter 10 digit mobile number (optional)"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
