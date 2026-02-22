// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Build from "./pages/Build.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";

import { getAuth } from "./api/api.js";

function RequireAuth({ children }) {
  const auth = getAuth();
  if (!auth?.token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 14px" }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/build"
          element={
            <RequireAuth>
              <Build />
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
