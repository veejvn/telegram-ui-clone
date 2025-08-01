"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  User,
  MoreVertical,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function integrated directly in the component file
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define types for our navigation items and props
interface NavItem {
  icon: React.FC<{ className?: string }>;
  path: string;
  label: string;
}

interface NavigationMenuProps {
  className?: string;
  position?: "right" | "left";
  offset?: number;
}

/**
 * NavigationMenu component - displays a floating menu with navigation options
 */
const NavigationMenu: React.FC<NavigationMenuProps> = ({
  className,
  position = "right",
  offset = 4,
}) => {
  // State for tracking menu expansion
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current path and router for navigation
  const pathname = usePathname();
  const router = useRouter();

  // Ref for the component container to detect outside clicks
  const menuRef = useRef<HTMLDivElement>(null);

  // Define navigation items with icons, paths, and labels
  const navItems: NavItem[] = [
    { icon: Home, path: "/chat", label: "Home" },
    { icon: Calendar, path: "/video", label: "Video" },
    { icon: FileText, path: "/document", label: "Document" },
    { icon: MessageSquare, path: "/message", label: "Chat" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  // Handle outside clicks to close the menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    // Add and remove event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle navigation when clicking on a menu item
  const handleNavigation = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        "navigation-menu fixed z-50",
        position === "right" ? "right-4" : "left-4",
        "bottom-40",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="menu"
            initial={{ scale: 0, opacity: 0, originY: 1 }}
            animate={{ scale: 1, opacity: 1, originY: 1 }}
            exit={{ scale: 0, opacity: 0, originY: 1 }}
            transition={{
              // Replace spring with tween for instant expansion
              type: "tween",
              duration: 0.12, // Very short duration for quick expansion
              ease: [0.16, 1, 0.3, 1], // Custom bezier curve for a quick expansion with slight overshoot
            }}
            className="w-[89px] h-[431px] rounded-[100px] border border-white/20 flex flex-col justify-center items-center gap-8"
            style={{
              position: "absolute",
              bottom: "0",
              right: position === "right" ? "0" : "auto",
              left: position === "left" ? "0" : "auto",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(221,221,221,0.2) 50%, rgba(227,227,227,0.2) 75%, rgba(218,218,218,0.2) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow:
                "0 4px 4px rgba(255,255,255,0.25) inset, 0 4px 8px rgba(0,0,0,0.05)",
              transform: "translateY(-60%)",
            }}
          >
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.1, // Quick fade-in
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 transition-all",
                  isActive(item.path) ? "text-blue-500" : "text-gray-600/70"
                )}
                aria-label={item.label}
              >
                <item.icon className="w-6 h-6" />
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -right-4 w-1.5 h-1.5 bg-blue-500 rounded-full"
                    transition={{
                      duration: 0.1, // Quick indicator movement
                    }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.button
            key="toggle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "tween",
              duration: 0.12,
              ease: "easeOut",
            }}
            onClick={() => setIsExpanded(true)}
            className="w-8 h-12 rounded-full flex flex-col items-center justify-center bg-gray-100/50 backdrop-blur-sm border border-white/20 shadow-sm"
            aria-label="Navigation menu"
            aria-expanded={isExpanded}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-gray-700"></div>
              <div className="w-1 h-1 rounded-full bg-gray-700"></div>
              <div className="w-1 h-1 rounded-full bg-gray-700"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationMenu;
