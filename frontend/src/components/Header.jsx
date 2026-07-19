import React from 'react';
import { Sun, Moon, LogIn, LogOut, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Header component managing authentication controls and theme settings
 */
export default function Header({
  user,
  isAuthenticated,
  authLoading,
  login,
  logout,
  darkMode,
  setDarkMode
}) {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-200 dark:border-darkbg-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white shadow-md shadow-indigo-600/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent font-sans">
              QuizSlide AI
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              Quiz to Google Slides Automation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkbg-card transition-colors duration-150"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Google Integration Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium border-gray-200 dark:border-darkbg-border bg-gray-50 dark:bg-darkbg-card">
            {authLoading ? (
              <span className="flex items-center gap-1.5 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" /> Checking Google Link...
              </span>
            ) : isAuthenticated ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected to Google APIs
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" /> Google Link Required
              </span>
            )}
          </div>

          {/* Auth Button/Profile Card */}
          {authLoading ? (
            <div className="w-28 h-10 rounded-lg bg-gray-200 dark:bg-darkbg-border animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* User profile details */}
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                  {user.email}
                </p>
              </div>
              
              {/* Avatar Picture */}
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-500 border border-white dark:border-darkbg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold ring-2 ring-indigo-500">
                  {user.name.charAt(0)}
                </div>
              )}

              {/* Sign out */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
                title="Disconnect Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="btn-primary py-2 text-sm shadow-indigo-600/10 hover:shadow-indigo-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Connect Google</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
