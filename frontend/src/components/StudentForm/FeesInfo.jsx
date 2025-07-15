import React from "react";

export default function FeesInfo({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fees & Finance</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fee Structure *</label>
          <select
            name="feeStructure"
            value={form.feeStructure || "regular"}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="regular">Regular</option>
            <option value="scholarship">Scholarship</option>
            <option value="concession">Concession</option>
            <option value="free">Free</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Status</label>
          <select
            name="paymentStatus"
            value={form.paymentStatus || "pending"}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fee Discount (%)</label>
          <input
            type="number"
            name="feeDiscount"
            value={form.feeDiscount || ""}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="0"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Late Fees (₹)</label>
          <input
            type="number"
            name="lateFees"
            value={form.lateFees || ""}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Scholarship Details</label>
          <textarea
            name="scholarshipDetails"
            value={form.scholarshipDetails || ""}
            onChange={handleChange}
            rows={2}
            placeholder="Details of any scholarships or financial aid received"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Payment History Notes</label>
          <textarea
            name="paymentHistoryNotes"
            value={form.paymentHistoryNotes || ""}
            onChange={handleChange}
            rows={2}
            placeholder="Any notes about payment history or special arrangements"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Fee Calculation Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 mb-3">Fee Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <div className="text-gray-600">Fee Structure</div>
            <div className="font-medium capitalize">{form.feeStructure || "Regular"}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-gray-600">Discount</div>
            <div className="font-medium">{form.feeDiscount || "0"}%</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-gray-600">Status</div>
            <div
              className={`font-medium capitalize ${
                form.paymentStatus === "paid"
                  ? "text-green-600"
                  : form.paymentStatus === "overdue"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {form.paymentStatus || "Pending"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
