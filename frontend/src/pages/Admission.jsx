import React from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CurrencyRupeeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Admission = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const admissionProcess = [
    {
      step: 1,
      title: "Application Submission",
      description: "Submit the completed application form with required documents",
    },
    {
      step: 2,
      title: "Document Verification",
      description: "Our team will verify all submitted documents and certificates",
    },
    {
      step: 3,
      title: "Entrance Assessment",
      description: "Students may need to appear for an entrance test (if applicable)",
    },
    {
      step: 4,
      title: "Parent Interview",
      description: "A brief interaction with parents to understand student requirements",
    },
    {
      step: 5,
      title: "Admission Confirmation",
      description: "Successful candidates receive admission confirmation and fee details",
    },
  ];

  const requiredDocuments = [
    "Birth Certificate (Original + 2 Photocopies)",
    "Previous School Transfer Certificate",
    "Mark Sheets of Previous Classes",
    "Character Certificate from Previous School",
    "Caste Certificate (if applicable)",
    "Aadhar Card Copy (Student & Parents)",
    "Passport Size Photographs (6 copies)",
    "Medical Certificate",
    "Income Certificate (if applying for scholarship)",
    "Address Proof",
  ];

  const ageRequirements = [
    { class: "Nursery", age: "3+ years" },
    { class: "LKG", age: "4+ years" },
    { class: "UKG", age: "5+ years" },
    { class: "Class I", age: "6+ years" },
    { class: "Class II", age: "7+ years" },
    { class: "Class XI (Science)", age: "After Class X" },
    { class: "Class XI (Commerce)", age: "After Class X" },
  ];

  const feeStructure = [
    {
      category: "Nursery - UKG",
      admission: "₹200",
      annual: "15,000",
      installment: "₹5,000",
    },
    {
      category: "Class I - IV",
      admission: "200",
      annual: "15,000",
      installment: "₹5,000",
    },
    {
      category: "Class V - VIII",
      admission: "₹200",
      annual: "20,000",
      installment: "₹6,000",
    },
    {
      category: "Class IX",
      admission: "₹200",
      annual: "25,000",
      installment: "₹6,000",
    },
    {
      category: "Class X",
      admission: "₹200",
      annual: "25,000",
      installment: "₹6,000",
    },
    {
      category: "Class XI - XII",
      admission: "₹0",
      annual: "₹7,200",
      installment: "₹3,000",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Admissions 2024-25</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              Join our community of learners and begin your journey towards excellence
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <InformationCircleIcon className="w-6 h-6 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Important Notice</span>
              </div>
              <p className="text-white">Admissions for Academic Year 2024-25 are now open. Limited seats available.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Admission Process
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple and transparent admission process designed for your convenience
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Process Timeline */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>

            <div className="space-y-12">
              {admissionProcess.map((process, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="flex-1 md:w-1/2">
                    <div className={`bg-white rounded-xl shadow-lg p-6 ${index % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {process.step}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 ml-4">{process.title}</h3>
                      </div>
                      <p className="text-gray-600">{process.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:block w-4 h-4 bg-blue-600 rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Required Documents</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <ul className="space-y-3">
                  {requiredDocuments.map((document, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{document}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> All documents should be attested by a gazetted officer. Original documents
                      will be verified and returned.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Age Requirements</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  {ageRequirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="font-medium text-gray-900">{requirement.class}</span>
                      <span className="text-blue-600 font-semibold">{requirement.age}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800 text-sm">
                      <strong>Important:</strong> Age is calculated as on 31st March of the academic year.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fee Structure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent and competitive fee structure with various payment options
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Class</th>
                  <th className="px-6 py-4 text-left font-semibold">Registration Fee</th>
                  <th className="px-6 py-4 text-left font-semibold">Annual Fee</th>
                  <th className="px-6 py-4 text-left font-semibold">Installment Fee</th>
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((fee, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 font-medium text-gray-900">{fee.category}</td>
                    <td className="px-6 py-4 text-gray-700">{fee.admission}</td>
                    <td className="px-6 py-4 text-gray-700">{fee.annual}</td>
                    <td className="px-6 py-4 text-gray-700">{fee.installment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <CurrencyRupeeIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Scholarship Available</h3>
              <p className="text-sm text-gray-600">Merit-based scholarships for deserving students</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Payment</h3>
              <p className="text-sm text-gray-600">Quarterly and monthly payment options available</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <DocumentTextIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Process</h3>
              <p className="text-sm text-gray-600">Simple online and offline payment methods</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Admission */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Apply?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Take the first step towards your child's bright future. Our admission team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+911234567890"
                className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Call for Admission
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Visit School
              </a>
            </div>
            <div className="mt-8 text-blue-200">
              <p>Admission Office Hours: Monday - Saturday, 9:00 AM - 4:00 PM</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Admission;
