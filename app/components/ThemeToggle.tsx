"use client";

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-2 border-blue-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200/50 dark:focus:ring-gray-400/50 group z-50"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      type="button"
    >
      {/* Sun Icon */}
      <svg
        className={`absolute w-6 h-6 text-amber-500 transition-all duration-500 ${
          theme === 'light' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 rotate-180 scale-75'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon Icon */}
      <svg
        className={`absolute w-6 h-6 text-blue-400 transition-all duration-500 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-180 scale-75'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Animated background glow */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-amber-200/30 to-orange-300/20' 
          : 'bg-gradient-to-br from-blue-200/30 to-indigo-300/20'
      }`} />
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}
