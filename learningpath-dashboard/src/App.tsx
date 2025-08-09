// src/App.tsx
import React from "react";
import AppRoutes from "./routes/AppRoutes"; // Import the new AppRoutes component

/**
 * The main application component.
 * It now primarily renders the AppRoutes component, which contains all routing logic.
 */
export default function App() {
  return (
    // AppRoutes encapsulates BrowserRouter and all route definitions
    <AppRoutes />
  );
}