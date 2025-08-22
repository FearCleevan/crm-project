//src/assets/components/ProtectedRoute.jsx
// Enhanced ProtectedRoute.jsx with permission checking
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import usePermissions from '../hooks/usePermissions';
import { hasAccessToNavigation } from '../utils/permissionMappings';

const ProtectedRoute = ({ requiredPermission }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const { permissions, loading } = usePermissions();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If no specific permission required, just check authentication
  if (!requiredPermission) {
    return <Outlet />;
  }
  
  // Still loading permissions
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check if user has the required permission
  const hasAccess = hasAccessToNavigation(permissions, requiredPermission);
  
  if (!hasAccess) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;