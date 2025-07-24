import React from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  AcademicCapIcon,
  MusicalNoteIcon,
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const Achievements = () => {
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

  const academicAchievements = [
    {
      year: "2023-24",
      achievement: "100% Pass Rate in CBSE Class X",
      description: "All students successfully passed with flying colors",
    },
    {
      year: "2023-24",
      achievement: "98% Pass Rate in CBSE Class XII",
      description: "Outstanding performance in board examinations",
    },
    {
      year: "2023",
      achievement: "State Level Mathematics Olympiad - 1st Prize",
      description: "Won by student Priya Sharma from Class X",
    },
    {
      year: "2023",
      achievement: "National Science Exhibition - Gold Medal",
      description: "Project on 'Renewable Energy' won national recognition",
    },
    {
      year: "2022",
      achievement: "Best School Award - District Level",
      description: "Recognized for overall academic excellence",
    },
  ];

  const sportsAchievements = [
    {
      sport: "Cricket",
      achievement: "Inter-School Championship Winners",
      year: "2023",
      description: "Under-17 team won the district championship",
    },
    {
      sport: "Badminton",
      achievement: "State Level Singles Champion",
      year: "2023",
      description: "Raj Patel from Class XI won state championship",
    },
    {
      sport: "Athletics",
      achievement: "Zone Level Track & Field Meet",
      year: "2023",
      description: "Multiple medals in 100m, 200m, and long jump",
    },
    {
      sport: "Football",
      achievement: "Regional Tournament Runners-up",
      year: "2022",
      description: "Girls team reached the final of regional tournament",
    },
  ];

  const culturalAchievements = [
    {
      category: "Dance",
      achievement: "Classical Dance Competition - 1st Prize",
      year: "2023",
      description: "Bharatanatyam performance won state level competition",
    },
    {
      category: "Music",
      achievement: "Vocal Music Competition Winner",
      year: "2023",
      description: "Classical singing competition at inter-school level",
    },
    {
      category: "Drama",
      achievement: "Best Play Award",
      year: "2022",
      description: "School drama 'Ramayana' won district level competition",
    },
    {
      category: "Art",
      achievement: "Painting Competition Champion",
      year: "2023",
      description: "Student artwork displayed in state art exhibition",
    },
  ];

  const recognitions = [
    {
      icon: AcademicCapIcon,
      title: "CBSE Excellence Award",
      year: "2023",
      description: "Recognized as one of the top CBSE schools in the region",
    },
    {
      icon: TrophyIcon,
      title: "Best Sports Facility",
      year: "2022",
      description: "Awarded for outstanding sports infrastructure and programs",
    },
    {
      icon: UserGroupIcon,
      title: "Best Teacher Training Program",
      year: "2023",
      description: "Recognized for innovative teacher development initiatives",
    },
    {
      icon: GlobeAltIcon,
      title: "Environmental Excellence Award",
      year: "2022",
      description: "For sustainable practices and environmental education",
    },
  ];

  const statistics = [
    {
      number: "100%",
      label: "Board Exam Success Rate",
      description: "Consistent excellent results over past 5 years",
    },
    {
      number: "250+",
      label: "Awards & Medals",
      description: "Won by students in various competitions",
    },
    {
      number: "50+",
      label: "Inter-School Competitions",
      description: "Participated and won in multiple events annually",
    },
    {
      number: "95%",
      label: "College Admission Rate",
      description: "Students admitted to top colleges and universities",
    },
  ];

  const toppers = [
    {
      name: "Arjun Mehta",
      class: "Class XII Science",
      percentage: "98.6%",
      achievement: "School Topper 2023",
    },
    {
      name: "Sneha Kapoor",
      class: "Class XII Commerce",
      percentage: "97.8%",
      achievement: "Commerce Stream Topper",
    },
    {
      name: "Rohit Singh",
      class: "Class X",
      percentage: "99.2%",
      achievement: "Perfect Score in Mathematics",
    },
    {
      name: "Priya Patel",
      class: "Class X",
      percentage: "98.4%",
      achievement: "Science Topper",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Achievements</h1>
            <p className="text-xl text-yellow-100 max-w-3xl mx-auto">
              Celebrating excellence in academics, sports, culture, and beyond
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-16 h-16">
            <TrophyIcon className="w-full h-full text-yellow-300 opacity-20 animate-pulse" />
          </div>
          <div className="absolute bottom-20 left-10 w-20 h-20">
            <StarIcon className="w-full h-full text-yellow-300 opacity-20 animate-pulse delay-1000" />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {statistics.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                <div className="text-gray-600 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Academic Achievements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academic Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our students consistently achieve outstanding results
            </p>
          </motion.div>

          <div className="space-y-6">
            {academicAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{achievement.achievement}</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {achievement.year}
                    </span>
                  </div>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Top Performers 2023</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Celebrating our academic achievers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {toppers.map((topper, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-6 text-center"
              >
                {/* Placeholder for student photo */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserGroupIcon className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{topper.name}</h3>
                <p className="text-blue-600 font-semibold mb-2">{topper.class}</p>
                <div className="text-3xl font-bold text-orange-600 mb-2">{topper.percentage}</div>
                <p className="text-gray-700 text-sm">{topper.achievement}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Achievements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sports Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Champions on the field and beyond</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sportsAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrophyIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{achievement.sport}</h3>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {achievement.year}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-blue-600 mb-2">{achievement.achievement}</h4>
                    <p className="text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Achievements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cultural Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Nurturing artistic talents and creativity</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {culturalAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MusicalNoteIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{achievement.category}</h3>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {achievement.year}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-blue-600 mb-2">{achievement.achievement}</h4>
                    <p className="text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* School Recognitions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">School Recognitions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Awards and recognitions received by our institution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recognitions.map((recognition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center"
              >
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <recognition.icon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recognition.title}</h3>
                <p className="text-blue-600 font-medium mb-3">{recognition.year}</p>
                <p className="text-gray-600 text-sm">{recognition.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Be Part of Our Success Story</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join Dnyanbhavan and discover your potential. Excellence is not just our goal, it's our tradition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/admission"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Apply for Admission
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Visit Our School
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Achievements;
