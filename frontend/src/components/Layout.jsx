import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "../utils/cn";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  GraduationCap,
  Wallet,
  Megaphone,
  ChevronLeft,
  LogOut,
  User,
  BookOpen,
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "primary" },
    { name: "User Management", href: "/users", icon: Users, color: "success" },
    { name: "User Approval", href: "/user-approval", icon: CheckSquare, color: "warning" },
    { name: "Class Management", href: "/classes", icon: GraduationCap, color: "error" },
    { name: "Fee Management", href: "/fees", icon: Wallet, color: "primary" },
    { name: "Announcements", href: "/announcements", icon: Megaphone, color: "success" },
    { name: "Student Demo", href: "/student-demo", icon: BookOpen, color: "warning" },
  ];

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" },
  };

  const NavItem = ({ item, isActive }) => (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Link
            to={item.href}
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
              isActive
                ? cn(
                    "bg-primary-50 text-primary-700",
                    item.color === "success" && "bg-success-50 text-success-700",
                    item.color === "warning" && "bg-warning-50 text-warning-700",
                    item.color === "error" && "bg-error-50 text-error-700"
                  )
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            }`}
          >
            <motion.div
              className="flex items-center"
              initial={false}
              animate={{
                gap: isCollapsed ? "0" : "0.75rem",
                justifyContent: isCollapsed ? "center" : "flex-start",
              }}
            >
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive && item.color === "primary" && "bg-primary-100 text-primary-600",
                  isActive && item.color === "success" && "bg-success-100 text-success-600",
                  isActive && item.color === "warning" && "bg-warning-100 text-warning-600",
                  isActive && item.color === "error" && "bg-error-100 text-error-600",
                  !isActive && "text-secondary-600 group-hover:text-secondary-900"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </motion.div>
          </Link>
        </Tooltip.Trigger>
        {isCollapsed && (
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="bg-secondary-900 text-white px-2 py-1 rounded text-sm"
              sideOffset={5}
            >
              {item.name}
              <Tooltip.Arrow className="fill-secondary-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <motion.div
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 bg-white shadow-lg flex flex-col border-r border-secondary-200"
      >
        <div className="flex flex-col h-full">
          {/* Logo and collapse button */}
          <div className="flex items-center h-16 px-4 bg-gradient-to-r from-primary-700 to-primary-600 justify-between">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <GraduationCap className="w-8 h-8 text-primary-100" />
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl font-bold text-primary-50"
                >
                  School Admin
                </motion.h1>
              </motion.div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-primary-800/50 text-primary-50 hover:bg-primary-900/50 hover:text-white transition-colors ring-1 ring-primary-400/30"
            >
              <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} isActive={location.pathname === item.href} />
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-secondary-200 bg-white">
            <div className="flex items-center justify-center">
              <div className={`flex items-center ${isCollapsed ? "flex-col" : "w-full"}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 ring-2 ring-primary-200">
                  <User className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 flex-1"
                  >
                    <p className="text-sm font-medium text-secondary-900 truncate">{user?.name || "Admin User"}</p>
                    <p className="text-xs text-secondary-500 truncate">{user?.email || "admin@school.com"}</p>
                  </motion.div>
                )}
              </div>
            </div>
            <Tooltip.Provider>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={logout}
                    className={`mt-3 flex items-center justify-center px-3 py-2 text-sm font-medium text-black bg-gradient-to-r from-error-600 to-error-500 rounded-lg hover:from-error-700 hover:to-error-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 transition-all duration-200 shadow-sm ${
                      isCollapsed ? "w-full aspect-square" : "w-full"
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="ml-2">Logout</span>}
                  </button>
                </Tooltip.Trigger>
                {isCollapsed && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-secondary-900 text-white px-2 py-1 rounded text-sm shadow-lg"
                      sideOffset={5}
                    >
                      Logout
                      <Tooltip.Arrow className="fill-secondary-900" />
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
          marginLeft: isCollapsed ? "5rem" : "16rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;
