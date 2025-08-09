import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Import your page components
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/dashboard/Dashboard";
import Profile from "@/profile/Profile";
import EditProfile from "@/profile/EditProfile";
import CreateCoursePage from "@/pages/course/CreateCoursePage"; // <-- IMPORT
import EditCoursePage from "@/pages/course/EditCoursePage";
import CourseViewerPage from "@/pages/course/CourseViewerPage"; 
// Import the route protectors
import ProtectedRoute from "./ProtectedRoute";
import InstructorRoute from "./InstructorRoute"; // <-- IMPORT
import StudentRoute from "./StudentRoute";
import MyCoursesPage from "@/pages/course/MyCoursesPage";
import CheckoutPage from "@/pages/course/CheckoutPage"; // <-- IMPORT
import CourseAnalyticsPage from "@/pages/course/CourseAnalyticsPage"; // <-- IMPORT

export default function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        {/* General Protected Routes (for all logged-in users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>

        {/* Instructor-Only Protected Routes */}
        <Route element={<InstructorRoute />}>
          <Route path="/create-course" element={<CreateCoursePage />} />
          {/* ✅ ADD THIS DYNAMIC ROUTE FOR EDITING */}
          <Route path="/edit-course/:courseId" element={<EditCoursePage />} />
            <Route path="/instructor/course/:courseId/dashboard" element={<CourseAnalyticsPage />} />
        </Route>
        

        {/* Student-Only Protected Routes */}
        <Route element={<StudentRoute />}>
          <Route path="/learn/course/:courseId" element={<CourseViewerPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} /> {/* ✅ ADD THIS ROUTE */}
          <Route path="/checkout/course/:courseId" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
