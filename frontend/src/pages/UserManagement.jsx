import React from 'react';
import Layout from '../components/Layout';

const UserManagement = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage students, teachers, and staff members
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User Management Features
            </h3>
            <p className="text-gray-500 mb-4">
              This page will contain user management functionality
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Add/Edit/Delete Users</p>
              <p>• Role Assignment</p>
              <p>• Bulk User Import</p>
              <p>• User Profile Management</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement; 