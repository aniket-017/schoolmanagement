import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { appConfig } from "../config/environment";

const UserApproval = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/auth/pending-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPendingUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/auth/approve-user/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
        alert("User approved successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Error approving user. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    setProcessingId(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/auth/reject-user/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
        alert("User rejected successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>User Approval</h1>
        <div style={{ color: "#666" }}>
          {pendingUsers.length} pending approval{pendingUsers.length !== 1 ? "s" : ""}
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h3>No pending users</h3>
          <p>All user registrations have been processed.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {pendingUsers.map((pendingUser) => (
            <div
              key={pendingUser._id}
              style={{
                padding: "16px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{pendingUser.name}</div>
                <div style={{ color: "#666" }}>{pendingUser.email}</div>
                <div style={{ color: "#666" }}>Role: {pendingUser.role}</div>
                {pendingUser.phone && <div style={{ color: "#666" }}>Phone: {pendingUser.phone}</div>}
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleApprove(pendingUser._id)}
                  disabled={processingId === pendingUser._id}
                  style={{
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {processingId === pendingUser._id ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(pendingUser._id)}
                  disabled={processingId === pendingUser._id}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {processingId === pendingUser._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserApproval;
