import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyUser } from "@/api/user";
import { fetchMyCourses, fetchAllCourses, searchCourses } from "@/api/course";
import type { CourseSummary, Page } from "@/api/course"; // Import the Page type
import DashboardNavbar from "@/components/DashboardNavbar";
import StudentDashboard from "./features/student/StudentDashboard";
import InstructorDashboard from "./features/instructor/InstructorDashboard";

interface UserData {
  fullName: string;
  role: 'STUDENT' | 'INSTRUCTOR';
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Spring pages are 0-indexed
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const COURSES_PER_PAGE = 9; // Define how many courses to show per page

  const loadCourses = useCallback(async (role: UserData['role'], query: string, page: number) => {
    setIsLoading(true);
    try {
      let response: Page<CourseSummary>;
      if (query) {
        // ✅ DEFINITIVE FIX: Pass the page and size to the search function
        response = await searchCourses(query, page, COURSES_PER_PAGE);
      } else {
        // ✅ DEFINITIVE FIX: Pass the page and size to the fetch functions
        response = role === 'INSTRUCTOR' 
          ? await fetchMyCourses(page, COURSES_PER_PAGE) 
          : await fetchAllCourses(page, COURSES_PER_PAGE);
      }
      
      // ✅ DEFINITIVE FIX: Correctly extract the 'content' array from the Page object.
      // Also, ensure it's always an array to prevent crashes.
      setCourses(response.content || []);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);

    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]); // Always fall back to an empty array on any error.
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for initial user and course load
  useEffect(() => {
    fetchMyUser()
      .then((data) => {
        setUser(data);
        if (data.role) {
          loadCourses(data.role, "", 0); // Initial load of page 0
        } else {
            setIsLoading(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate, loadCourses]);

  // Effect to handle searching
  useEffect(() => {
    if (user) {
      const handler = setTimeout(() => {
        // ✅ DEFINITIVE FIX: When a new search starts, always go back to page 0
        loadCourses(user.role, searchQuery, 0);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, user, loadCourses]);

  // Handler for the pagination component
  const handlePageChange = (newPage: number) => {
    if (user) {
        loadCourses(user.role, searchQuery, newPage);
    }
  };

  const renderDashboard = () => {
    if (!user) return null;
    const reload = () => loadCourses(user.role, searchQuery, currentPage);
    switch (user.role) {
      case 'STUDENT':
        return <StudentDashboard fullName={user.fullName} courses={courses} isLoading={isLoading} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />;
      case 'INSTRUCTOR':
        return <InstructorDashboard fullName={user.fullName} courses={courses} isLoading={isLoading} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} onCourseDeleted={reload} />;
      default:
        return <div>Unknown role.</div>;
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl font-medium text-slate-700">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
    </div>
  );
}
