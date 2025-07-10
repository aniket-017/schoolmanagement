import React, { useState } from "react";
import { CheckIcon, DocumentDuplicateIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const TeacherCredentials = ({ teacher, onClose }) => {
  const [copied, setCopied] = useState({});

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [field]: true }));
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const copyAllCredentials = async () => {
    const credentials = `Teacher Login Credentials
    
Name: ${teacher.name}
Email: ${teacher.email}
Employee ID: ${teacher.employeeId}
Temporary Password: ${teacher.tempPassword}

Please login and change your password immediately.
Login URL: ${window.location.origin}/login`;

    try {
      await navigator.clipboard.writeText(credentials);
      toast.success("All credentials copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy credentials");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Created Successfully!</h2>
            <p className="text-gray-600 mt-1">Share these credentials with the teacher</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Teacher Profile Created</span>
            </div>
            <p className="text-green-700 text-sm">{teacher.name} has been successfully added to the system.</p>
          </div>

          <div className="space-y-3">
            {/* Name */}
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{teacher.name}</span>
                <button
                  onClick={() => copyToClipboard(teacher.name, "Name")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied.Name ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="text-sm font-medium text-gray-700 block mb-1">Email (Login ID)</label>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{teacher.email}</span>
                <button
                  onClick={() => copyToClipboard(teacher.email, "Email")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied.Email ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Employee ID */}
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="text-sm font-medium text-gray-700 block mb-1">Employee ID</label>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{teacher.employeeId}</span>
                <button
                  onClick={() => copyToClipboard(teacher.employeeId, "Employee ID")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied["Employee ID"] ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Temporary Password */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <label className="text-sm font-medium text-orange-700 block mb-1">Temporary Password</label>
              <div className="flex items-center justify-between">
                <span className="text-orange-900 font-mono font-bold text-lg">{teacher.tempPassword}</span>
                <button
                  onClick={() => copyToClipboard(teacher.tempPassword, "Password")}
                  className="text-orange-400 hover:text-orange-600 transition-colors"
                >
                  {copied.Password ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-orange-600 text-xs mt-1">⚠️ This password must be changed on first login</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={copyAllCredentials}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Copy All Credentials
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="text-blue-800 font-medium mb-2">Important Instructions:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Share these credentials securely with the teacher</li>
              <li>• Teacher must change password on first login</li>
              <li>• Login URL: {window.location.origin}/login</li>
              <li>• Keep employee ID for future reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCredentials;
