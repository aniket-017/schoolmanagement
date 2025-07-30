import React, { useState, useEffect } from "react";
import { appConfig } from "../../config/environment";

export default function FeesInfo({ form, handleChange }) {
  const [feeSlabs, setFeeSlabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [calculatedInstallments, setCalculatedInstallments] = useState([]);

  // Fetch fee slabs
  const fetchFeeSlabs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFeeSlabs(data.data.filter((slab) => slab.isActive));
      }
    } catch (error) {
      console.error("Error fetching fee slabs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate installments with concession
  const calculateInstallments = async (slabId, concessionAmount) => {
    if (!slabId || !concessionAmount || concessionAmount <= 0) {
      setCalculatedInstallments([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/fee-slabs/${slabId}/calculate-concession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ concessionAmount: parseFloat(concessionAmount) }),
      });
      const data = await response.json();
      if (data.success) {
        setCalculatedInstallments(data.data.installments);
      }
    } catch (error) {
      console.error("Error calculating concession:", error);
    }
  };

  // Handle fee slab change
  const handleSlabChange = (e) => {
    const slabId = e.target.value;
    const slab = feeSlabs.find((s) => s._id === slabId);
    setSelectedSlab(slab);

    // Update form data
    handleChange({
      target: {
        name: "feeSlabId",
        value: slabId,
      },
    });

    // Calculate installments if concession amount exists
    if (form.concessionAmount && form.concessionAmount > 0) {
      calculateInstallments(slabId, form.concessionAmount);
    }
  };

  // Handle concession amount change
  const handleConcessionChange = (e) => {
    const concessionAmount = e.target.value;
    handleChange(e);

    // Calculate installments if slab is selected
    if (form.feeSlabId && concessionAmount) {
      calculateInstallments(form.feeSlabId, concessionAmount);
    } else {
      setCalculatedInstallments([]);
    }
  };

  useEffect(() => {
    fetchFeeSlabs();
  }, []);

  useEffect(() => {
    if (form.feeSlabId && feeSlabs.length > 0) {
      const slab = feeSlabs.find((s) => s._id === form.feeSlabId);
      setSelectedSlab(slab);
    }
  }, [form.feeSlabId, feeSlabs]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fees & Finance</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fee Structure</label>
          <select
            name="feeStructure"
            value={form.feeStructure || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Fee Structure (Optional)</option>
            <option value="regular">Regular</option>
            <option value="scholarship">Scholarship</option>
            <option value="concession">Concession</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fee Slab {form.feeStructure === "regular" ? "(Recommended)" : ""}
          </label>
          <select
            name="feeSlabId"
            value={form.feeSlabId || ""}
            onChange={handleSlabChange}
            disabled={loading || form.feeStructure === "free" || !form.feeStructure}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">
              {loading ? "Loading slabs..." : !form.feeStructure ? "Select fee structure first" : form.feeStructure === "free" ? "Not applicable" : "Select Fee Slab (Optional)"}
            </option>
            {feeSlabs.map((slab) => (
              <option key={slab._id} value={slab._id}>
                {slab.slabName} - ₹{slab.totalAmount.toLocaleString()} ({slab.installments.length} installments)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Status</label>
          <select
            name="paymentStatus"
            value={form.paymentStatus || "pending"}
            onChange={handleChange}
            disabled={!form.feeStructure}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Concession Amount (₹)</label>
          <input
            type="number"
            name="concessionAmount"
            value={form.concessionAmount || ""}
            onChange={handleConcessionChange}
            min="0"
            max={selectedSlab ? selectedSlab.totalAmount : undefined}
            placeholder="0"
            disabled={form.feeStructure === "free"}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          {selectedSlab && form.concessionAmount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {((form.concessionAmount / selectedSlab.totalAmount) * 100).toFixed(1)}% discount
            </p>
          )}
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
            disabled={!form.feeStructure}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
            disabled={!form.feeStructure}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
            disabled={!form.feeStructure}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Fee Calculation Preview */}
      {form.feeStructure ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-800 mb-3">Fee Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="text-gray-600">Fee Structure</div>
              <div className="font-medium capitalize">{form.feeStructure}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-gray-600">Fee Slab</div>
              <div className="font-medium">{selectedSlab ? selectedSlab.slabName : "Not selected"}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-gray-600">Total Amount</div>
              <div className="font-medium">{selectedSlab ? `₹${selectedSlab.totalAmount.toLocaleString()}` : "N/A"}</div>
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

        {/* Concession Applied */}
        {form.concessionAmount > 0 && selectedSlab && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Concession Applied</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-blue-600">Original Amount:</span>
                <span className="font-medium ml-2">₹{selectedSlab.totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-600">Concession:</span>
                <span className="font-medium ml-2">₹{parseInt(form.concessionAmount).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-600">Final Amount:</span>
                <span className="font-medium ml-2">
                  ₹{(selectedSlab.totalAmount - (form.concessionAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Installment Details */}
        {selectedSlab && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-800 mb-2">
              Installment Structure {calculatedInstallments.length > 0 ? "(With Concession)" : ""}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(calculatedInstallments.length > 0 ? calculatedInstallments : selectedSlab.installments).map(
                (installment, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">Installment {installment.installmentNumber || index + 1}</div>
                    <div className="text-lg font-bold text-green-600">₹{installment.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {installment.percentage
                        ? `${installment.percentage}%`
                        : `${((installment.amount / selectedSlab.totalAmount) * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-gray-600">
                      Due: {new Date(installment.dueDate).toLocaleDateString()}
                    </div>
                    {installment.discountAmount && (
                      <div className="text-xs text-blue-600">Saved: ₹{installment.discountAmount.toLocaleString()}</div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-md font-medium text-blue-800 mb-2">Fee Information</h4>
          <p className="text-sm text-blue-700">
            Fee information is optional. You can select a fee structure above if you want to set up fees for this student, 
            or leave it blank to add fee information later.
          </p>
        </div>
      )}
    </div>
  );
}
