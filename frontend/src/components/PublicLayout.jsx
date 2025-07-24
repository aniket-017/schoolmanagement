import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.jpeg";
import {
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const PublicLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "About", href: "/about" },
    { name: "Admission", href: "/admission" },
    { name: "Academic", href: "/academic" },
    { name: "Achievements", href: "/achievements" },
    { name: "Infrastructure", href: "/infrastructure" },
    { name: "Gallery", href: "/gallery" },
    { name: "Mandatory Disclosure", href: "/mandatory-disclosure" },
    { name: "Contact", href: "/contact" },
  ];

  // Group navigation items for dropdown
  const primaryNav = [
    { name: "About", href: "/about" },
    { name: "Admission", href: "/admission" },
    { name: "Academic", href: "/academic" },
  ];

  const secondaryNav = [
    { name: "Achievements", href: "/achievements" },
    { name: "Infrastructure", href: "/infrastructure" },
    { name: "Gallery", href: "/gallery" },
    { name: "Mandatory Disclosure", href: "/mandatory-disclosure" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-blue-900 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span>+91 83798 68456</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>info@dnyanbhavan.edu.in</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>Chhatrapati Sambhajinagar, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-24 h-12 sm:w-40 sm:h-12 flex items-center justify-center">
                <img src={logo} alt="Dnyanbhavan Logo" className="w-24 h-16 sm:w-40 sm:h-20" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dnyanbhavan English School</h1>
                <p className="text-lg text-blue-600 font-medium">& Junior College</p>
              </div>
            </Link>

            {/* Mobile School Name - Visible only on mobile */}
            <div className="sm:hidden flex-1 ml-3">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Dnyanbhavan
                <br />
                English School
              </h1>
              <p className="text-sm text-blue-600 font-medium">& Junior College</p>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Primary Navigation */}
              {primaryNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-900 hover:text-blue-600"
                  } px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap`}
                >
                  {item.name}
                </Link>
              ))}

              {/* More Options Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`${
                    secondaryNav.some((item) => isActive(item.href))
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-900 hover:text-blue-600"
                  } px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap`}
                >
                  <span>More</span>
                  {isDropdownOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {secondaryNav.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`${
                          isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-900 hover:bg-gray-50"
                        } block px-4 py-2 text-sm transition-colors duration-200`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Student/Teacher Login Button */}
              <Link
                to="/student-teacher-login"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap"
              >
                <AcademicCapIcon className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Primary Navigation */}
              {primaryNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${
                    isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-900 hover:bg-gray-50"
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Secondary Navigation */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">More Options</p>
                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${
                      isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-900 hover:bg-gray-50"
                    } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Student/Teacher Login */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to="/student-teacher-login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  <AcademicCapIcon className="w-5 h-5" />
                  <span>Portal Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* School Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-20 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <img src={logo} alt="Dnyanbhavan Logo" className="w-20 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Dnyanbhavan English School & Junior College</h3>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Committed to providing quality education and nurturing young minds for a better tomorrow. We strive to
                create an environment where students can excel academically and personally.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">RL-70, Bajajnagar ,Chhatrapati Sambhajinagar, Maharashtra</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">+91 83798 68456</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">info@dnyanbhavan.edu.in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/admission" className="text-gray-300 hover:text-white transition-colors">
                    Admission
                  </Link>
                </li>
                <li>
                  <Link to="/academic" className="text-gray-300 hover:text-white transition-colors">
                    Academic
                  </Link>
                </li>
                <li>
                  <Link to="/achievements" className="text-gray-300 hover:text-white transition-colors">
                    Achievements
                  </Link>
                </li>
                <li>
                  <Link to="/infrastructure" className="text-gray-300 hover:text-white transition-colors">
                    Infrastructure
                  </Link>
                </li>
              </ul>
            </div>

            {/* Important Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Important</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/mandatory-disclosure" className="text-gray-300 hover:text-white transition-colors">
                    Mandatory Disclosure
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="text-gray-300 hover:text-white transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/student-teacher-login" className="text-gray-300 hover:text-white transition-colors">
                    Student/Teacher Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                    Staff Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Dnyanbhavan English School & Junior College. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-2 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
