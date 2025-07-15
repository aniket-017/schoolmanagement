import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import Layout from "../components/Layout";
import StudentMultiStepForm from "../components/StudentForm/StudentMultiStepForm";
import { toast } from "react-toastify";
import appConfig from "../config/environment";

const AddStudent = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${classId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Student added successfully");
        navigate(`/classes/${classId}`);
      } else {
        toast.error(data.message || "Error adding student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Error adding student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/classes/${classId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Class</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Add New Student</h1>
              </div>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Student Registration Form</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Complete all sections to register the student
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Save className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">
                    {isSubmitting ? "Saving..." : "Auto-save enabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <StudentMultiStepForm 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AddStudent; 