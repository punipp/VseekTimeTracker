import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import AttendanceReport from "./AttendanceReport"; // ✅ NEW

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  // 🔒 Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/" replace />;
  };

  return (
    <Routes>
      {/* 🔐 LOGIN */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />

      {/* 🆕 SIGNUP */}
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" /> : <Signup />}
      />

      {/* 📊 DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 📄 ATTENDANCE REPORT (NEW) */}
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <AttendanceReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/"} />}
      />
    </Routes>
  );
}

export default App;