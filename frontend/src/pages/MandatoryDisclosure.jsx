import React from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const MandatoryDisclosure = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const schoolInfo = [
    { label: "Name of School", value: "Dnyanbhavan English School & Junior College" },
    { label: "Affiliation No.", value: "1234567" },
    { label: "School Code", value: "12345" },
    { label: "Complete Address", value: "123 Education Street, Knowledge Park, Chhatrapati Sambhajinagar, Maharashtra 431136" },
    { label: "Principal Name & Qualification", value: "Dr. Rajesh Sharma (Ph.D. in Education, M.A. English)" },
    { label: "School Email ID", value: "info@dnyanbhavan.edu.in" },
    { label: "Contact Details", value: "+91 12345 67890" },
    { label: "Year of Establishment", value: "1999" },
    { label: "Website", value: "www.dnyanbhavan.edu.in" },
  ];

  const documentLinks = [
    {
      title: "Copies of Affiliation/Upgradation Letter",
      status: "Available",
      description: "CBSE affiliation letter and recent upgradation documents",
    },
    {
      title: "Copies of Recognition Certificate",
      status: "Available",
      description: "State government recognition certificate",
    },
    {
      title: "Copy of Valid Fire Safety Certificate",
      status: "Valid until 2025",
      description: "Fire department safety clearance certificate",
    },
    {
      title: "Copy of Valid Building Safety Certificate",
      status: "Valid until 2025",
      description: "Municipal corporation building safety certificate",
    },
    {
      title: "Copy of Valid Water, Health & Sanitation Certificate",
      status: "Valid until 2024",
      description: "Health department sanitation clearance",
    },
    {
      title: "Copy of Valid DEO Certificate",
      status: "Available",
      description: "District Education Officer approval certificate",
    },
    {
      title: "Fee Structure of the School",
      status: "Updated 2024-25",
      description: "Complete fee structure for all classes",
    },
    {
      title: "Annual Report",
      status: "2023-24 Available",
      description: "Comprehensive annual academic and financial report",
    },
  ];

  const facultyInfo = [
    { category: "Principal", count: 1, qualification: "Ph.D./M.Ed." },
    { category: "Vice Principal", count: 1, qualification: "M.Ed./M.A." },
    { category: "PGT Teachers", count: 15, qualification: "Post Graduate + B.Ed." },
    { category: "TGT Teachers", count: 20, qualification: "Graduate + B.Ed." },
    { category: "PRT Teachers", count: 12, qualification: "Graduate + D.Ed." },
    { category: "Physical Education", count: 3, qualification: "M.P.Ed./B.P.Ed." },
    { category: "Computer Teachers", count: 2, qualification: "MCA/B.Tech + B.Ed." },
    { category: "Librarian", count: 1, qualification: "M.Lib.Sc." },
    { category: "Counselor", count: 1, qualification: "M.A. Psychology" },
    { category: "Support Staff", count: 25, qualification: "Various" },
  ];

  const infrastructureDetails = [
    { facility: "Total Campus Area", details: "15 acres" },
    { facility: "Built-up Area", details: "45,000 sq. ft." },
    { facility: "Number of Classrooms", details: "42 (All Air-conditioned)" },
    {
      facility: "Number of Laboratories",
      details: "8 (Physics, Chemistry, Biology, Computer x2, Language, Math, Geography)",
    },
    { facility: "Library Books", details: "15,000+ books, 50+ periodicals" },
    { facility: "Play Ground", details: "Football, Cricket, Basketball, Volleyball courts" },
    { facility: "Swimming Pool", details: "Olympic size with safety equipment" },
    { facility: "Auditorium", details: "500 seating capacity with modern AV systems" },
    { facility: "Medical Room", details: "Qualified nurse, first aid facility" },
    { facility: "Canteen", details: "Hygienic food preparation, nutritious meals" },
    { facility: "Transport", details: "15 GPS-enabled buses covering 25+ routes" },
    { facility: "Security", details: "24/7 CCTV surveillance, trained security guards" },
  ];

  const academicInfo = [
    { detail: "Classes Offered", value: "Nursery to Class XII" },
    { detail: "Streams in Class XI & XII", value: "Science (PCM, PCB), Commerce" },
    { detail: "Medium of Instruction", value: "English" },
    { detail: "Board Affiliation", value: "Central Board of Secondary Education (CBSE)" },
    { detail: "Academic Session", value: "April to March" },
    { detail: "Working Days per Week", value: "6 days (Monday to Saturday)" },
    { detail: "School Timings", value: "8:00 AM to 2:30 PM" },
    { detail: "Examination System", value: "Continuous and Comprehensive Evaluation (CCE)" },
  ];

  const feeStructure = [
    { class: "Nursery - UKG", admission: "₹5,000", annual: "₹45,000", monthly: "₹4,000" },
    { class: "Class I - V", admission: "₹8,000", annual: "₹55,000", monthly: "₹5,000" },
    { class: "Class VI - X", admission: "₹10,000", annual: "₹65,000", monthly: "₹6,000" },
    { class: "Class XI - XII", admission: "₹15,000", annual: "₹75,000", monthly: "₹7,000" },
  ];

  const resultInfo = [
    { year: "2023-24", classX: "100%", classXII: "98%", remarks: "Outstanding performance" },
    { year: "2022-23", classX: "98%", classXII: "96%", remarks: "Excellent results" },
    { year: "2021-22", classX: "97%", classXII: "95%", remarks: "Consistent excellence" },
  ];

  return (
    <div className="overflow-hidden bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Mandatory Public Disclosure</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              As per CBSE guidelines, all information related to school functioning and facilities
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Info Notice */}
      <section className="py-8 bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
            <p className="text-blue-800">Last Updated: March 2024 | For any queries, contact: +91 12345 67890</p>
          </div>
        </div>
      </section>

      {/* General Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">General Information</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Basic details about our school as per CBSE requirements
            </p>
          </motion.div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <BuildingLibraryIcon className="w-6 h-6 mr-3 text-blue-600" />
                School Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schoolInfo.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <dt className="text-sm font-medium text-gray-600 mb-1">{item.label}</dt>
                    <dd className="text-gray-900 font-medium">{item.value}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Documents & Certificates</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All mandatory documents as required by CBSE and state regulations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentLinks.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        {doc.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Document</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Faculty & Staff Information</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Details of our qualified teaching and non-teaching staff
            </p>
          </motion.div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <UserGroupIcon className="w-6 h-6 mr-3 text-blue-600" />
                Staff Details
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Count</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Qualification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facultyInfo.map((faculty, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{faculty.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{faculty.count}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{faculty.qualification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Infrastructure Details</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete information about school facilities and infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {infrastructureDetails.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.facility}</h3>
                  <span className="text-blue-600 font-medium">{item.details}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academic Information</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <AcademicCapIcon className="w-6 h-6 mr-3 text-blue-600" />
                Academic Details
              </h3>
              <div className="space-y-4">
                {academicInfo.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <dt className="text-sm font-medium text-gray-600">{item.detail}</dt>
                    <dd className="text-gray-900 font-medium mt-1">{item.value}</dd>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CurrencyRupeeIcon className="w-6 h-6 mr-3 text-blue-600" />
                Fee Structure (2024-25)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-semibold text-gray-900">Class</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-900">Admission</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-900">Annual</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-900">Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feeStructure.map((fee, index) => (
                      <tr key={index}>
                        <td className="py-3 text-sm font-medium text-gray-900">{fee.class}</td>
                        <td className="py-3 text-sm text-gray-700">{fee.admission}</td>
                        <td className="py-3 text-sm text-gray-700">{fee.annual}</td>
                        <td className="py-3 text-sm text-gray-700">{fee.monthly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academic Results</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Board examination results for the past three years
            </p>
          </motion.div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Academic Year</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class X Pass %</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class XII Pass %</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resultInfo.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{result.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{result.classX}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{result.classXII}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{result.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">For More Information</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              For any queries regarding the information disclosed above, feel free to contact us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+911234567890"
                className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Call: +91 83798 68456
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default MandatoryDisclosure;
