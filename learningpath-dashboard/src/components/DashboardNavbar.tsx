import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import UserDropdown from "@/components/UserDropdown";


interface DashboardNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardNavbar({ searchQuery, onSearchChange }: DashboardNavbarProps) {
  const navigate = useNavigate();
  // State to control the visibility of the search bar on mobile
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

  return (
    // The container is a div, not a header, to avoid semantic issues
    <div className="bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link to="/dashboard">
            <img
              src={logo}
              alt="Logo"
              className="h-9 w-auto"
            />
          </Link>
        </div>

        {/* Center: Search Bar (Visible on medium screens and up) */}
        <div className="flex-1 max-w-xl mx-4 hidden md:flex">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right: Search Icon (Mobile) & User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)} 
            className="md:hidden p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            aria-label="Toggle search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <UserDropdown />
        </div>
      </div>

      {/* --- MOBILE SEARCH BAR (Appears below the navbar) --- */}
      {isMobileSearchVisible && (
        <div className="p-4 border-t border-gray-200 md:hidden">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
      )}
    </div>
  );
}