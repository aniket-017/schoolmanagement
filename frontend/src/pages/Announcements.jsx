import React from "react";
import Layout from "../components/Layout";

const Announcements = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage school announcements</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Announcements Features</h3>
            <p className="text-gray-500 mb-4">This page will contain announcement management functionality</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Create Announcements</p>
              <p>• Schedule Publishing</p>
              <p>• Target Audience Selection</p>
              <p>• Notification Management</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Announcements;
