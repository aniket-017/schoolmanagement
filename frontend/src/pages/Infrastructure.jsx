import React from "react";
import { motion } from "framer-motion";
import {
  BuildingLibraryIcon,
  ComputerDesktopIcon,
  BeakerIcon,
  HeartIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  TruckIcon,
  ShieldCheckIcon,
  WifiIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

const Infrastructure = () => {
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

  const academicFacilities = [
    {
      icon: ComputerDesktopIcon,
      name: "Smart Classrooms",
      description:
        "42 digitally equipped classrooms with interactive whiteboards, projectors, and high-speed internet connectivity.",
      features: ["Interactive Whiteboards", "Audio-Visual Systems", "High-Speed Internet", "Air Conditioning"],
    },
    {
      icon: BuildingLibraryIcon,
      name: "Modern Library",
      description: "A well-stocked library with over 15,000 books, digital resources, and comfortable reading spaces.",
      features: ["15,000+ Books", "Digital Resources", "Reading Halls", "Study Rooms"],
    },
    {
      icon: BeakerIcon,
      name: "Science Laboratories",
      description: "State-of-the-art labs for Physics, Chemistry, Biology, and General Science with modern equipment.",
      features: ["Physics Lab", "Chemistry Lab", "Biology Lab", "Modern Equipment"],
    },
    {
      icon: ComputerDesktopIcon,
      name: "Computer Labs",
      description: "Two fully equipped computer labs with latest hardware and software for practical learning.",
      features: ["80+ Computers", "Latest Software", "Internet Access", "Programming Tools"],
    },
  ];

  const sportsRecreation = [
    {
      name: "Multi-Purpose Sports Complex",
      description: "Indoor sports complex for badminton, table tennis, basketball, and various indoor games.",
      image: "sports-complex.jpg",
    },
    {
      name: "Football Ground",
      description: "Full-size football field with proper drainage and floodlights for evening practice.",
      image: "football-ground.jpg",
    },
    {
      name: "Cricket Ground",
      description: "Well-maintained cricket ground with practice nets and proper pitch conditions.",
      image: "cricket-ground.jpg",
    },
    {
      name: "Athletics Track",
      description: "200-meter running track with facilities for various track and field events.",
      image: "athletics-track.jpg",
    },
    {
      name: "Swimming Pool",
      description: "Olympic-size swimming pool with changing rooms and safety equipment.",
      image: "swimming-pool.jpg",
    },
    {
      name: "Gymnasium",
      description: "Fully equipped gymnasium with modern fitness equipment and yoga studio.",
      image: "gymnasium.jpg",
    },
  ];

  const specialFacilities = [
    {
      icon: MusicalNoteIcon,
      name: "Music & Dance Studio",
      description: "Soundproof studios equipped with musical instruments and dance floors for cultural activities.",
      features: ["Sound System", "Musical Instruments", "Dance Floor", "Recording Equipment"],
    },
    {
      icon: PaintBrushIcon,
      name: "Art & Craft Studio",
      description: "Creative spaces with proper lighting and tools for artistic expression and craft activities.",
      features: ["Art Supplies", "Pottery Wheel", "Display Boards", "Natural Lighting"],
    },
    {
      icon: HeartIcon,
      name: "Medical Room",
      description: "Well-equipped medical facility with qualified nurse and first aid equipment.",
      features: ["Qualified Nurse", "First Aid Kit", "Emergency Equipment", "Isolation Room"],
    },
    {
      icon: TruckIcon,
      name: "Transport Facility",
      description: "GPS-enabled buses covering major areas of the city with trained drivers and attendants.",
      features: ["GPS Tracking", "CCTV Cameras", "Trained Staff", "Safety Equipment"],
    },
  ];

  const techFeatures = [
    {
      icon: WifiIcon,
      name: "High-Speed Internet",
      description: "Campus-wide WiFi connectivity for students and staff",
    },
    {
      icon: CameraIcon,
      name: "CCTV Surveillance",
      description: "24/7 security monitoring throughout the campus",
    },
    {
      icon: ShieldCheckIcon,
      name: "Security System",
      description: "Biometric access control and visitor management system",
    },
    {
      icon: ComputerDesktopIcon,
      name: "Digital Learning",
      description: "Learning management system and digital content delivery",
    },
  ];

  const campusStats = [
    {
      number: "15",
      label: "Acre Campus",
      description: "Spacious and green environment",
    },
    {
      number: "42",
      label: "Smart Classrooms",
      description: "Digitally equipped learning spaces",
    },
    {
      number: "8",
      label: "Science Labs",
      description: "Modern laboratory facilities",
    },
    {
      number: "24/7",
      label: "Security",
      description: "Round-the-clock campus security",
    },
  ];

  const safetyFeatures = [
    "CCTV surveillance throughout campus",
    "Biometric access control system",
    "Fire safety equipment and emergency exits",
    "Qualified security personnel",
    "GPS tracking for school buses",
    "Medical emergency response system",
    "Visitor management system",
    "Safe drinking water with RO systems",
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">World-Class Infrastructure</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Modern facilities designed to enhance learning and provide the best educational experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Campus Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {campusStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center bg-gradient-to-br from-teal-50 to-blue-100 rounded-xl p-8"
              >
                <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">{stat.number}</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                <div className="text-gray-600 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Academic Facilities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academic Facilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              State-of-the-art learning environments equipped with modern technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {academicFacilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <facility.icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{facility.name}</h3>
                    <p className="text-gray-600 mb-4">{facility.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {facility.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{feature}</span>
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

      {/* Sports & Recreation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sports & Recreation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive sports facilities promoting physical fitness and team spirit
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sportsRecreation.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Placeholder for facility image */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-teal-200 flex items-center justify-center">
                  <div className="text-center">
                    <HeartIcon className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-800 font-semibold">{facility.name}</p>
                    <p className="text-blue-600 text-sm">Image will be added later</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{facility.name}</h3>
                  <p className="text-gray-600">{facility.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Facilities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Special Facilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Additional amenities for holistic development and student welfare
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialFacilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <facility.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{facility.name}</h3>
                    <p className="text-gray-600 mb-4">{facility.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {facility.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{feature}</span>
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

      {/* Technology Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Technology Integration</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology enhancing the learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Security */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Safety & Security</h2>
              <p className="text-xl text-gray-600 mb-8">
                Your child's safety is our top priority. We have implemented comprehensive security measures to ensure a
                safe learning environment.
              </p>
              <div className="space-y-3">
                {safetyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <ShieldCheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Placeholder for security image */}
              <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-200 rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <ShieldCheckIcon className="w-24 h-24 text-green-600 mx-auto mb-4" />
                  <p className="text-green-800 font-semibold text-lg">Safe & Secure Campus</p>
                  <p className="text-green-600">24/7 Security Monitoring</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Virtual Tour CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Experience Our Campus</h2>
            <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
              See our world-class infrastructure in person. Schedule a campus visit or take a virtual tour to explore
              our facilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Schedule Campus Visit
              </a>
              <button className="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                Virtual Tour (Coming Soon)
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Infrastructure;
