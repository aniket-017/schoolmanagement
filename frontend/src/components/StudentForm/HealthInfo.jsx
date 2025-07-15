import React from "react";

export default function HealthInfo({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Health & Medical Information</h3>

      {/* Physical Metrics */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Physical Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={form.height || ""}
              onChange={handleChange}
              min="50"
              max="250"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={form.weight || ""}
              onChange={handleChange}
              min="10"
              max="200"
              step="0.1"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fitness Score (%)</label>
            <input
              type="number"
              name="fitnessScore"
              value={form.fitnessScore || ""}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Vision Test */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Vision Test Results</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Left Eye</label>
            <input
              type="text"
              name="visionTestLeftEye"
              value={form.visionTestLeftEye || ""}
              onChange={handleChange}
              placeholder="e.g., 6/6"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Right Eye</label>
            <input
              type="text"
              name="visionTestRightEye"
              value={form.visionTestRightEye || ""}
              onChange={handleChange}
              placeholder="e.g., 6/6"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Date</label>
            <input
              type="date"
              name="visionTestDate"
              value={form.visionTestDate || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hearing Test */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Hearing Test Results</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Left Ear</label>
            <input
              type="text"
              name="hearingTestLeftEar"
              value={form.hearingTestLeftEar || ""}
              onChange={handleChange}
              placeholder="e.g., Normal"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Right Ear</label>
            <input
              type="text"
              name="hearingTestRightEar"
              value={form.hearingTestRightEar || ""}
              onChange={handleChange}
              placeholder="e.g., Normal"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Date</label>
            <input
              type="date"
              name="hearingTestDate"
              value={form.hearingTestDate || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Medical History</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Allergies</label>
            <textarea
              name="allergies"
              value={form.allergies || ""}
              onChange={handleChange}
              rows={2}
              placeholder="e.g., Dust, Pollen, Peanuts (comma separated)"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Medical Conditions</label>
            <textarea
              name="medicalConditions"
              value={form.medicalConditions || ""}
              onChange={handleChange}
              rows={2}
              placeholder="e.g., Asthma, Diabetes (comma separated)"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Medications</label>
            <textarea
              name="medications"
              value={form.medications || ""}
              onChange={handleChange}
              rows={2}
              placeholder="e.g., Inhaler, Insulin (comma separated)"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vaccination Status</label>
            <select
              name="vaccinationStatus"
              value={form.vaccinationStatus || "complete"}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="exempt">Exempt</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Emergency Instructions</label>
            <textarea
              name="emergencyInstructions"
              value={form.emergencyInstructions || ""}
              onChange={handleChange}
              rows={2}
              placeholder="Special instructions for medical emergencies"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyContactName"
              value={form.emergencyContactName || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Relation</label>
            <input
              type="text"
              name="emergencyContactRelation"
              value={form.emergencyContactRelation || ""}
              onChange={handleChange}
              placeholder="e.g., Father, Uncle"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={form.emergencyContactPhone || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Email</label>
            <input
              type="email"
              name="emergencyContactEmail"
              value={form.emergencyContactEmail || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
