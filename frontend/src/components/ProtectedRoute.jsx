import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protected Route component that requires authentication
 * Redirects to login page if user is not authenticated
 * Verifies token with backend to prevent localStorage tampering
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if authenticated
 * @param {Array<string>} props.allowedRoles - Optional array of allowed user roles
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed (if roles are specified)
  if (
    allowedRoles.length > 0 &&
    user?.role &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i
            className="bi bi-shield-exclamation text-danger"
            style={{ fontSize: "5rem" }}
          ></i>
          <h2 className="mt-4">Access Denied</h2>
          <p className="text-muted">
            You don't have permission to access this page.
          </p>
          <a href="/" className="btn btn-primary mt-3">
            <i className="bi bi-house-door me-2"></i>
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
