import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "../utils/cn";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  Megaphone,
  ChevronLeft,
  LogOut,
  User,
  BookOpen,
  Settings,
  Bell,
  Search,
  UserCheck,
  Calendar,
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "blue",
      description: "Overview and analytics",
    },
    {
      name: "Teacher Management",
      href: "/users",
      icon: Users,
      color: "emerald",
      description: "Manage teachers and staff",
    },
    {
      name: "Class Management",
      href: "/classes",
      icon: GraduationCap,
      color: "purple",
      description: "Manage classes and subjects",
    },
    {
      name: "Fee Management",
      href: "/fees",
      icon: Wallet,
      color: "cyan",
      description: "Handle fee collection",
    },
    {
      name: "Announcements",
      href: "/announcements",
      icon: Megaphone,
      color: "rose",
      description: "School announcements",
    },
    {
      name: "Annual Calendar",
      href: "/annual-calendar",
      icon: Calendar,
      color: "amber",
      description: "School events and holidays",
    },
    {
      name: "Student Demo",
      href: "/student-demo",
      icon: BookOpen,
      color: "indigo",
      description: "Student portal demo",
    },
  ];

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  };

  const getColorClasses = (color, isActive) => {
    const colorMap = {
      blue: isActive
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700",
      emerald: isActive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700",
      amber: isActive
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "text-gray-600 hover:bg-amber-50 hover:text-amber-700",
      purple: isActive
        ? "bg-purple-50 text-purple-700 border-purple-200"
        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
      cyan: isActive
        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
        : "text-gray-600 hover:bg-cyan-50 hover:text-cyan-700",
      rose: isActive
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "text-gray-600 hover:bg-rose-50 hover:text-rose-700",
      indigo: isActive
        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700",
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconColorClasses = (color, isActive) => {
    const colorMap = {
      blue: isActive ? "bg-blue-100 text-blue-600" : "text-gray-500 group-hover:text-blue-600",
      emerald: isActive ? "bg-emerald-100 text-emerald-600" : "text-gray-500 group-hover:text-emerald-600",
      amber: isActive ? "bg-amber-100 text-amber-600" : "text-gray-500 group-hover:text-amber-600",
      purple: isActive ? "bg-purple-100 text-purple-600" : "text-gray-500 group-hover:text-purple-600",
      cyan: isActive ? "bg-cyan-100 text-cyan-600" : "text-gray-500 group-hover:text-cyan-600",
      rose: isActive ? "bg-rose-100 text-rose-600" : "text-gray-500 group-hover:text-rose-600",
      indigo: isActive ? "bg-indigo-100 text-indigo-600" : "text-gray-500 group-hover:text-indigo-600",
    };
    return colorMap[color] || colorMap.blue;
  };

  const NavItem = ({ item, isActive }) => (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Link
            to={item.href}
            className={cn(
              "group flex items-center px-4 py-3 rounded-xl transition-all duration-300 border-2",
              getColorClasses(item.color, isActive),
              isActive ? "shadow-sm" : "border-transparent"
            )}
          >
            <motion.div
              className="flex items-center w-full"
              initial={false}
              animate={{
                gap: isCollapsed ? "0" : "0.75rem",
                justifyContent: isCollapsed ? "center" : "flex-start",
              }}
            >
              <div
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-300",
                  getIconColorClasses(item.color, isActive)
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </motion.div>
              )}
            </motion.div>
          </Link>
        </Tooltip.Trigger>
        {isCollapsed && (
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl border border-gray-700"
              sideOffset={8}
            >
              <div className="text-center">
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-gray-300 mt-1">{item.description}</div>
              </div>
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 bg-white shadow-2xl flex flex-col border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
          {/* Logo and collapse button */}
          <div className="flex items-center h-20 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3 relative z-10"
              >
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xl font-bold text-white"
                  >
                    School Admin
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-blue-100"
                  >
                    Management Portal
                  </motion.p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 ring-1 ring-white/30 backdrop-blur-sm relative z-10"
            >
              <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} isActive={location.pathname === item.href} />
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-center mb-3">
              <div className={`flex items-center ${isCollapsed ? "flex-col" : "w-full"}`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-200 shadow-lg">
                  <User className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 flex-1"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Admin User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || "admin@school.com"}</p>
                  </motion.div>
                )}
              </div>
            </div>
            <Tooltip.Provider>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={logout}
                    className={`flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isCollapsed ? "w-full aspect-square" : "w-full"
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="ml-2">Sign Out</span>}
                  </button>
                </Tooltip.Trigger>
                {isCollapsed && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl border border-gray-700"
                      sideOffset={8}
                    >
                      Sign Out
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        animate={{
          marginLeft: isCollapsed ? "80px" : "280px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">{children}</div>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;
