import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  HeartIcon,
  MusicalNoteIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Photos", icon: PhotoIcon },
    { id: "campus", name: "Campus", icon: BuildingLibraryIcon },
    { id: "events", name: "Events", icon: CalendarDaysIcon },
    { id: "sports", name: "Sports", icon: TrophyIcon },
    { id: "cultural", name: "Cultural", icon: MusicalNoteIcon },
    { id: "academic", name: "Academic", icon: AcademicCapIcon },
  ];

  const galleryItems = [
    {
      id: 1,
      category: "campus",
      title: "Main Building",
      description: "Our beautiful main academic building",
      type: "image",
    },
    {
      id: 2,
      category: "campus",
      title: "Library Interior",
      description: "Modern library with study spaces",
      type: "image",
    },
    {
      id: 3,
      category: "campus",
      title: "Science Laboratory",
      description: "Well-equipped chemistry lab",
      type: "image",
    },
    {
      id: 4,
      category: "campus",
      title: "Smart Classroom",
      description: "Technology-enabled learning environment",
      type: "image",
    },
    {
      id: 5,
      category: "events",
      title: "Annual Day Celebration",
      description: "Students performing at annual function",
      type: "image",
    },
    {
      id: 6,
      category: "events",
      title: "Independence Day",
      description: "Flag hoisting ceremony",
      type: "image",
    },
    {
      id: 7,
      category: "events",
      title: "Science Exhibition",
      description: "Students showcasing their projects",
      type: "image",
    },
    {
      id: 8,
      category: "events",
      title: "Teachers Day",
      description: "Celebration honoring our teachers",
      type: "image",
    },
    {
      id: 9,
      category: "sports",
      title: "Cricket Match",
      description: "Inter-house cricket competition",
      type: "image",
    },
    {
      id: 10,
      category: "sports",
      title: "Sports Day",
      description: "Annual athletics meet",
      type: "image",
    },
    {
      id: 11,
      category: "sports",
      title: "Swimming Competition",
      description: "Students participating in swimming events",
      type: "image",
    },
    {
      id: 12,
      category: "sports",
      title: "Football Tournament",
      description: "Inter-school football championship",
      type: "image",
    },
    {
      id: 13,
      category: "cultural",
      title: "Classical Dance Performance",
      description: "Bharatanatyam performance by students",
      type: "image",
    },
    {
      id: 14,
      category: "cultural",
      title: "Music Concert",
      description: "Students performing classical music",
      type: "image",
    },
    {
      id: 15,
      category: "cultural",
      title: "Drama Performance",
      description: "Annual play presentation",
      type: "image",
    },
    {
      id: 16,
      category: "cultural",
      title: "Art Exhibition",
      description: "Student artwork display",
      type: "image",
    },
    {
      id: 17,
      category: "academic",
      title: "Mathematics Olympiad",
      description: "Students participating in math competition",
      type: "image",
    },
    {
      id: 18,
      category: "academic",
      title: "Science Fair",
      description: "Innovative science projects",
      type: "image",
    },
    {
      id: 19,
      category: "academic",
      title: "Graduation Ceremony",
      description: "Class XII graduation celebration",
      type: "image",
    },
    {
      id: 20,
      category: "academic",
      title: "Award Ceremony",
      description: "Recognizing academic achievements",
      type: "image",
    },
  ];

  const filteredItems =
    activeCategory === "all" ? galleryItems : galleryItems.filter((item) => item.category === activeCategory);

  const videos = [
    {
      title: "School Tour 2024",
      description: "Virtual tour of our campus facilities",
    },
    {
      title: "Annual Day Highlights",
      description: "Best moments from our annual celebration",
    },
    {
      title: "Sports Day 2023",
      description: "Highlights from our athletics meet",
    },
    {
      title: "Student Life at Dnyanbhavan",
      description: "A day in the life of our students",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-800 to-pink-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Capturing moments of learning, growth, and celebration at Dnyanbhavan
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-purple-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
              >
                {/* Placeholder for image */}
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center p-4">
                    <PhotoIcon className="w-16 h-16 text-purple-500 mx-auto mb-2" />
                    <p className="text-purple-700 font-semibold text-sm">{item.title}</p>
                    <p className="text-purple-600 text-xs">Image will be added</p>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <PhotoIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-semibold">View Full Size</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  <div className="mt-3">
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No photos found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Video Gallery</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch our school in action through these video highlights
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
              >
                {/* Placeholder for video */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <VideoCameraIcon className="w-20 h-20 text-white mx-auto mb-4 opacity-80" />
                    <p className="text-white font-semibold">{video.title}</p>
                    <p className="text-gray-300 text-sm">Video will be embedded here</p>
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-0 h-0 border-l-8 border-t-4 border-b-4 border-l-white border-t-transparent border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram-style Grid Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recent Highlights</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Latest moments captured at our school</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="aspect-square bg-gradient-to-br from-pink-100 to-purple-200 rounded-lg flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <PhotoIcon className="w-8 h-8 text-purple-500" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300">
              Follow Us on Social Media
            </button>
          </div>
        </div>
      </section>

      {/* Submit Photos CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Share Your Memories</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Have photos from school events? We'd love to feature them in our gallery. Send us your best shots!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Submit Photos
              </a>
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                Download High-Res Photos
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
