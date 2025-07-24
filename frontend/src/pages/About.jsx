import React from "react";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  AcademicCapIcon,
  HeartIcon,
  LightBulbIcon,
  StarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const About = () => {
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

  const values = [
    {
      icon: AcademicCapIcon,
      title: "Excellence in Education",
      description:
        "We strive for academic excellence while fostering critical thinking and creativity in every student.",
    },
    {
      icon: HeartIcon,
      title: "Holistic Development",
      description:
        "We believe in nurturing not just the mind, but also the heart, spirit, and character of our students.",
    },
    {
      icon: UserGroupIcon,
      title: "Inclusive Community",
      description:
        "We celebrate diversity and create an inclusive environment where every student feels valued and supported.",
    },
    {
      icon: LightBulbIcon,
      title: "Innovation & Growth",
      description: "We embrace innovative teaching methods and encourage continuous learning and growth.",
    },
  ];

  const leadership = [
    {
      name: "Dr. Rajesh Sharma",
      position: "Principal",
      education: "Ph.D. in Education, M.A. in English Literature",
      experience: "25+ years in education",
      description: "Leading with vision and dedication to educational excellence.",
    },
    {
      name: "Mrs. Priya Patel",
      position: "Vice Principal",
      education: "M.Ed., M.Sc. in Mathematics",
      experience: "20+ years in education",
      description: "Committed to innovative teaching methodologies and student development.",
    },
    {
      name: "Mr. Suresh Kumar",
      position: "Academic Coordinator",
      education: "M.A. in Psychology, B.Ed.",
      experience: "18+ years in education",
      description: "Specializing in curriculum development and student counseling.",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Dnyanbhavan</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Dedicated to nurturing minds and building character since 1999
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-blue-50 p-8 rounded-xl"
            >
              <div className="flex items-center mb-6">
                <StarIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                To provide quality education that empowers students with knowledge, skills, and values necessary for
                personal growth and meaningful contribution to society. We are committed to creating a learning
                environment that fosters intellectual curiosity, critical thinking, and moral character development.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-indigo-50 p-8 rounded-xl"
            >
              <div className="flex items-center mb-6">
                <BookOpenIcon className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                To be a leading educational institution that shapes future leaders, innovators, and responsible
                citizens. We envision a school where every student discovers their potential, develops a love for
                learning, and graduates as confident individuals ready to make a positive impact in the world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* School History */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to a leading educational institution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">A Legacy of Excellence</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded in 1999, Dnyanbhavan English School & Junior College began as a small institution with a big
                  dream - to provide quality education that would transform lives and communities.
                </p>
                <p>
                  Over the past 25 years, we have grown from a modest beginning with 50 students to a thriving
                  educational community of over 2000 students, maintaining our commitment to excellence throughout this
                  remarkable journey.
                </p>
                <p>
                  Our school has consistently achieved outstanding academic results, with our students excelling in
                  board examinations, competitive exams, and various extracurricular activities.
                </p>
                <p>
                  Today, we stand proud as a CBSE-affiliated institution known for our innovative teaching methods,
                  state-of-the-art facilities, and most importantly, our dedicated community of educators, students, and
                  parents.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Placeholder for timeline or school history image */}
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <AcademicCapIcon className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-blue-800 font-semibold text-lg">25 Years of Excellence</p>
                  <p className="text-blue-600">1999 - 2024</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
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
              Our Core Values
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced educators dedicated to student success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Placeholder for leader photo */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <UserGroupIcon className="w-20 h-20 text-gray-400" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{leader.position}</p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Education:</strong> {leader.education}
                    </p>
                    <p>
                      <strong>Experience:</strong> {leader.experience}
                    </p>
                  </div>
                  <p className="text-gray-700">{leader.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
