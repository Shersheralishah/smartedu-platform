// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * A component that protects routes, redirecting to login if no token is found.
 * It uses React Router's <Outlet /> for rendering nested routes.
 */
const ProtectedRoute: React.FC = () => {
  // Check for the authentication token in localStorage
  const token = localStorage.getItem('token');

  // If no token is found, force a full page reload to /login
  if (!token) {
    window.location.replace("/login");
    return null; // prevent React rendering
  }

  // If a token exists, render the child routes (nested within this protected route)
  return <Outlet />;
};

export default ProtectedRoute;
