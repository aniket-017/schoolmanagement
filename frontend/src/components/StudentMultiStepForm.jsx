import React, { useState } from "react";

const initialForm = {
  // Personal Information
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  religion: "",
  caste: "",
  motherTongue: "",
  bloodGroup: "",
  photo: "",
  // Contact & Address
  currentAddress: "",
  permanentAddress: "",
  city: "",
  state: "",
  pinCode: "",
  mobileNumber: "",
  optionalMobileNumber: "",
  email: "",
};

const steps = [
  "Personal Information",
  "Contact & Address Details",
  // Add more steps later
];

export default function StudentMultiStepForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Add Student</h2>
      <div className="mb-6 flex gap-2">
        {steps.map((label, idx) => (
          <div
            key={label}
            className={`flex-1 text-center py-2 rounded ${
              idx === step ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Religion</label>
              <input
                type="text"
                name="religion"
                value={form.religion}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Caste</label>
              <input
                type="text"
                name="caste"
                value={form.caste}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother Tongue</label>
              <input
                type="text"
                name="motherTongue"
                value={form.motherTongue}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo (URL)</label>
              <input
                type="text"
                name="photo"
                value={form.photo}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Address *</label>
              <textarea
                name="currentAddress"
                value={form.currentAddress}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Permanent Address</label>
              <textarea
                name="permanentAddress"
                value={form.permanentAddress}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pin Code</label>
              <input
                type="text"
                name="pinCode"
                value={form.pinCode}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        )}
        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-200 rounded">
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">
              Next
            </button>
          ) : (
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Submit
            </button>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-red-500 text-white rounded ml-2">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
