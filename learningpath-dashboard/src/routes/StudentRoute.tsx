import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

const StudentRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken: DecodedToken = jwtDecode(token);
    
    // Check if the user's role is 'STUDENT'
    if (decodedToken.role !== 'STUDENT') {
      // If not a student, redirect them to the main dashboard
      // (The dashboard will then show them the correct view for their role)
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    // If token is invalid, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If the token is valid and the role is STUDENT, render the protected page
  return <Outlet />;
};

export default StudentRoute;
