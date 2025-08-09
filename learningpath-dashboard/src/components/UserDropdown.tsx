import { useState, useEffect, useRef } from "react";
import { fetchUserProfile } from "@/api/user";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "@/api/user";


type User = {
  fullName: string;
  email: string;
  profileImage?: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile()
      .then((data: UserProfile) => {
        setUser(data as User);
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Use window.location.href for a full page reload to clear all state
    window.location.href = '/login';
  };

  if (!user) return null;

  const avatarUrl = user.profileImage
    ? user.profileImage
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.fullName || user.email || "User"
      )}&background=1E40AF&color=FFFFFF&bold=true`;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Avatar button */}
        <button
          className="block w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-3 focus:ring-blue-300 transition duration-200 ease-in-out"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open user menu"
        >
          <img
            src={avatarUrl}
            alt={user.fullName || user.email || "User avatar"}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-5 origin-top-right animate-fade-in-down"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-100">
              <img
                src={avatarUrl}
                alt={user.fullName || user.email || "Profile avatar"}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
         
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-lg leading-tight truncate">
                  {user.fullName}
                </p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>
            </div>

            {/* Menu Options */}
            <div className="text-sm text-gray-800 space-y-2">
              {user.role === 'STUDENT' && (
                <button
                  className="group flex items-center w-full px-3 py-2 rounded-lg text-left hover:bg-gray-50 hover:text-indigo-600 transition duration-150 ease-in-out"
                  onClick={() => {
                    navigate("/my-courses");
                    setIsOpen(false);
                  }}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.063a1 1 0 00.5.866l7 4a1 1 0 001 0l7-4a1 1 0 00.5-.866V9.61l5.606-2.67a1 1 0 000-1.84l-7-3zM10 4.268L14.394 6 10 7.732 5.606 6 10 4.268zM3 9.61l7 3.333 7-3.333-7-3.334-7 3.334z" />
                  </svg>
                  My Courses
                </button>
              )}

              <button
                className="group flex items-center w-full px-3 py-2 rounded-lg text-left hover:bg-gray-50 hover:text-green-600 transition duration-150 ease-in-out"
                onClick={() => {
                  navigate("/profile");
                  setIsOpen(false);
                }}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                Profile
              </button>

              <button
                className="group flex items-center w-full px-3 py-2 rounded-lg text-left hover:bg-gray-50 hover:text-blue-600 transition duration-150 ease-in-out"
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                Settings
              </button>

              <button
                className="group flex items-center w-full px-3 py-2 rounded-lg text-left hover:bg-red-50 hover:text-red-600 transition duration-150 ease-in-out"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <svg
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1"
                  ></path>
                </svg>
                Logout
              </button>
            </div>

            {/* Logout Confirm */}
            {showLogoutConfirm && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-gray-700 text-sm mb-3">
                  Are you sure you want to log out?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150 ease-in-out"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 ease-in-out shadow-md"
                    onClick={handleLogout}
                  >
                    Confirm Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}