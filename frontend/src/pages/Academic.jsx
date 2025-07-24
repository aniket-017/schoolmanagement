import React from "react";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  AcademicCapIcon,
  CalculatorIcon,
  BeakerIcon,
  GlobeAltIcon,
  LanguageIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  ComputerDesktopIcon,
  HeartIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Academic = () => {
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

  const curricularPrograms = [
    {
      level: "Primary Education",
      classes: "Nursery - Class V",
      description: "Foundation years focusing on basic literacy, numeracy, and holistic development",
      features: [
        "Play-based learning approach",
        "Multi-sensory teaching methods",
        "Regular assessment and feedback",
        "Parent-teacher collaboration",
      ],
    },
    {
      level: "Secondary Education",
      classes: "Class VI - Class X",
      description: "Comprehensive education preparing students for board examinations",
      features: [
        "CBSE curriculum and guidelines",
        "Subject specialization begins",
        "Project-based learning",
        "Career guidance and counseling",
      ],
    },
    {
      level: "Higher Secondary",
      classes: "Class XI - Class XII",
      description: "Advanced studies with stream specialization for career preparation",
      features: [
        "Science and Commerce streams",
        "Practical and laboratory work",
        "Competitive exam preparation",
        "College admission guidance",
      ],
    },
  ];

  const subjects = [
    {
      icon: CalculatorIcon,
      name: "Mathematics",
      description: "From basic arithmetic to advanced calculus, fostering logical thinking and problem-solving skills.",
    },
    {
      icon: BeakerIcon,
      name: "Science",
      description: "Physics, Chemistry, and Biology with hands-on experiments and practical applications.",
    },
    {
      icon: LanguageIcon,
      name: "Languages",
      description: "English, Hindi, and Marathi to develop comprehensive communication skills.",
    },
    {
      icon: GlobeAltIcon,
      name: "Social Studies",
      description: "History, Geography, and Civics to understand society, culture, and governance.",
    },
    {
      icon: ComputerDesktopIcon,
      name: "Computer Science",
      description: "Programming, digital literacy, and technology skills for the modern world.",
    },
    {
      icon: PaintBrushIcon,
      name: "Arts & Crafts",
      description: "Creative expression through drawing, painting, and various art forms.",
    },
    {
      icon: MusicalNoteIcon,
      name: "Music & Dance",
      description: "Cultural education through classical and contemporary music and dance forms.",
    },
    {
      icon: HeartIcon,
      name: "Physical Education",
      description: "Sports, fitness, and health education for overall physical development.",
    },
  ];

  const academicFeatures = [
    {
      title: "CBSE Curriculum",
      description: "Following CBSE guidelines with modern teaching methodologies",
    },
    {
      title: "Smart Classrooms",
      description: "Technology-enabled learning with interactive digital boards",
    },
    {
      title: "Regular Assessments",
      description: "Continuous evaluation through tests, projects, and assignments",
    },
    {
      title: "Individual Attention",
      description: "Small class sizes ensuring personalized learning experience",
    },
    {
      title: "Remedial Classes",
      description: "Additional support for students who need extra help",
    },
    {
      title: "Advanced Learning",
      description: "Enrichment programs for gifted and talented students",
    },
  ];

  const examSystem = [
    {
      type: "Formative Assessment",
      weightage: "40%",
      description: "Continuous evaluation through class tests, assignments, projects, and practical work",
    },
    {
      type: "Summative Assessment",
      weightage: "60%",
      description: "Term examinations including mid-term and final examinations",
    },
  ];

  const streams = [
    {
      name: "Science Stream",
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Physical Education"],
      careers: ["Engineering", "Medical", "Research", "Technology", "Architecture"],
    },
    {
      name: "Commerce Stream",
      subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics", "English", "Physical Education"],
      careers: ["Chartered Accountancy", "Business Management", "Banking", "Finance", "Economics"],
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-800 to-teal-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Academic Excellence</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Comprehensive education designed to nurture intellectual growth and character development
            </p>
          </motion.div>
        </div>
      </section>

      {/* Curricular Programs */}
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
              Our Academic Programs
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured learning pathways from foundation to advanced levels
            </motion.p>
          </motion.div>

          <div className="space-y-12">
            {curricularPrograms.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.level}</h3>
                    <p className="text-blue-600 font-semibold mb-4">{program.classes}</p>
                    <p className="text-gray-700">{program.description}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {program.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Subjects We Offer
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive curriculum covering all essential areas of knowledge
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {subjects.map((subject, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <subject.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{subject.name}</h3>
                <p className="text-gray-600 text-sm">{subject.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Academic Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academic Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern teaching methods and support systems for effective learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {academicFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Higher Secondary Streams */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Higher Secondary Streams</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Specialized tracks for Class XI and XII students</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {streams.map((stream, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{stream.name}</h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Subjects:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {stream.subjects.map((subject, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Career Opportunities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {stream.careers.map((career, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Examination System */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Examination System</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive assessment system following CBSE guidelines
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {examSystem.map((exam, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-8 text-center"
              >
                <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold">{exam.weightage}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{exam.type}</h3>
                <p className="text-gray-700">{exam.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <ClockIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Academic Calendar</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>First Term:</strong> April to September
                    </p>
                    <p>
                      <strong>Second Term:</strong> October to March
                    </p>
                    <p>
                      <strong>Summer Break:</strong> May to June
                    </p>
                    <p>
                      <strong>Winter Break:</strong> December (2 weeks)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Academic;
