import React from "react";

export default function AcademicInfo({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Roll Number *</label>
          <input
            type="text"
            name="rollNumber"
            value={form.rollNumber || ""}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Admission Number</label>
          <input
            type="text"
            name="admissionNumber"
            value={form.admissionNumber || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Section</label>
          <select
            name="section"
            value={form.section || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Academic Year</label>
          <input
            type="text"
            name="academicYear"
            value={form.academicYear || ""}
            onChange={handleChange}
            placeholder="2024-25"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Previous School</label>
          <input
            type="text"
            name="previousSchool"
            value={form.previousSchool || ""}
            onChange={handleChange}
            placeholder="Name of previous school attended"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Transfer Certificate Number</label>
          <input
            type="text"
            name="transferCertificateNumber"
            value={form.transferCertificateNumber || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Previous Grade/Class</label>
          <input
            type="text"
            name="previousGrade"
            value={form.previousGrade || ""}
            onChange={handleChange}
            placeholder="e.g., Class 5"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Special Needs/Requirements</label>
          <textarea
            name="specialNeeds"
            value={form.specialNeeds || ""}
            onChange={handleChange}
            rows={3}
            placeholder="Any special educational needs, learning disabilities, or accommodations required"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Learning Disabilities (if any)</label>
          <textarea
            name="learningDisabilities"
            value={form.learningDisabilities || ""}
            onChange={handleChange}
            rows={2}
            placeholder="e.g., Dyslexia, ADHD, etc."
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Academic Achievements</label>
          <textarea
            name="academicAchievements"
            value={form.academicAchievements || ""}
            onChange={handleChange}
            rows={2}
            placeholder="Previous academic achievements, awards, certificates"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
