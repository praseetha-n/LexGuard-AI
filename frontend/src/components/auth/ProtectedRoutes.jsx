import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <span className="auth-loading-text">Authenticating LexGuard session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <span className="auth-loading-text">Verifying administrative privileges...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Access Restricted</h2>
          <p>
            You do not have administrative privileges to view this area. Admin access is strictly governed by Row Level Security and assigned role policies.
          </p>
          <div className="access-denied-actions">
            <Navigate to="/chat" replace />
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <span className="auth-loading-text">Loading LexGuard AI...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return children ? children : <Outlet />;
}
