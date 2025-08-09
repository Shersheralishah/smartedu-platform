import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // You may need to install this: npm install jwt-decode

interface DecodedToken {
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

const InstructorRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken: DecodedToken = jwtDecode(token);
    // Check if the role is 'INSTRUCTOR'
    if (decodedToken.role !== 'INSTRUCTOR') {
      // If not an instructor, redirect to dashboard (or an unauthorized page)
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }

  // If token is valid and role is INSTRUCTOR, render the child component
  return <Outlet />;
};

export default InstructorRoute;
