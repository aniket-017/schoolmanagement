import React from "react";

export default function DocumentsInfo({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documents & Certificates</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Birth Certificate</label>
          <input
            type="text"
            name="birthCertificate"
            value={form.birthCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Transfer Certificate</label>
          <input
            type="text"
            name="transferCertificate"
            value={form.transferCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Character Certificate</label>
          <input
            type="text"
            name="characterCertificate"
            value={form.characterCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Medical Certificate</label>
          <input
            type="text"
            name="medicalCertificate"
            value={form.medicalCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aadhar Card</label>
          <input
            type="text"
            name="aadharCard"
            value={form.aadharCard || ""}
            onChange={handleChange}
            placeholder="URL or file path"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Caste Certificate</label>
          <input
            type="text"
            name="casteCertificate"
            value={form.casteCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path (if applicable)"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Income Certificate</label>
          <input
            type="text"
            name="incomeCertificate"
            value={form.incomeCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path (if applicable)"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passport</label>
          <input
            type="text"
            name="passport"
            value={form.passport || ""}
            onChange={handleChange}
            placeholder="URL or file path (if applicable)"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Previous School Report Card</label>
          <input
            type="text"
            name="previousReportCard"
            value={form.previousReportCard || ""}
            onChange={handleChange}
            placeholder="URL or file path"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Disability Certificate</label>
          <input
            type="text"
            name="disabilityCertificate"
            value={form.disabilityCertificate || ""}
            onChange={handleChange}
            placeholder="URL or file path (if applicable)"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Document Status Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-3">Document Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-gray-600">Birth Certificate</div>
            <div className={`font-medium ${form.birthCertificate ? "text-green-600" : "text-red-600"}`}>
              {form.birthCertificate ? "✓" : "✗"}
            </div>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-gray-600">Transfer Certificate</div>
            <div className={`font-medium ${form.transferCertificate ? "text-green-600" : "text-red-600"}`}>
              {form.transferCertificate ? "✓" : "✗"}
            </div>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-gray-600">Aadhar Card</div>
            <div className={`font-medium ${form.aadharCard ? "text-green-600" : "text-red-600"}`}>
              {form.aadharCard ? "✓" : "✗"}
            </div>
          </div>
          <div className="bg-white p-2 rounded border text-center">
            <div className="text-gray-600">Medical Certificate</div>
            <div className={`font-medium ${form.medicalCertificate ? "text-green-600" : "text-red-600"}`}>
              {form.medicalCertificate ? "✓" : "✗"}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Document Notes</label>
        <textarea
          name="documentNotes"
          value={form.documentNotes || ""}
          onChange={handleChange}
          rows={3}
          placeholder="Any notes about documents, missing certificates, or special requirements"
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
