// src/hooks/usePermissions.js
import { useState, useEffect } from 'react';

const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5001/api/permissions/my-permissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // If endpoint doesn't exist, fall back to role-based permissions
          if (response.status === 404) {
            console.warn('Permissions endpoint not found, using role-based fallback');
            await fetchPermissionsFallback();
            return;
          }
          throw new Error(`Failed to fetch permissions: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setPermissions(data.permissions || []);
          setRoles(data.roles || []);
        } else {
          throw new Error(data.error || 'Failed to fetch permissions');
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err.message);
        // Fall back to role-based permissions
        await fetchPermissionsFallback();
      } finally {
        setLoading(false);
      }
    };

    // Fallback method using user role from localStorage
    const fetchPermissionsFallback = async () => {
      try {
        // Get user info from localStorage or token
        const token = localStorage.getItem('token');
        let userRole = 'Data Analyst'; // Default role
        
        if (token) {
          // Try to decode token to get user role
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userRole = payload.role || userRole;
          } catch (e) {
            console.warn('Could not decode token, using default role');
          }
        }
        
        // Map roles to basic permissions - IT Admin gets ALL permissions
        const allPermissions = [
          'dashboard_view', 'leads_view', 'leads_create', 'leads_edit', 'leads_delete',
          'contacts_view', 'contacts_create', 'contacts_edit', 'contacts_delete',
          'accounts_view', 'accounts_create', 'accounts_edit', 'accounts_delete',
          'deals_view', 'deals_create', 'deals_edit', 'deals_delete',
          'calendar_view', 'calendar_create', 'calendar_edit', 'calendar_delete',
          'email_view', 'email_send', 'calls_view', 'calls_log',
          'tasks_view', 'tasks_create', 'tasks_edit', 'tasks_delete',
          'users_view', 'users_create', 'users_edit', 'users_delete',
          'permissions_view', 'permissions_manage'
        ];
        
        const rolePermissions = {
          'IT Admin': allPermissions,
          'Data Analyst': [
            'dashboard_view', 'leads_view', 'contacts_view', 'accounts_view', 'deals_view',
            'calendar_view', 'email_view', 'calls_view', 'tasks_view'
          ],
          'Agent': [
            'dashboard_view', 'leads_view', 'contacts_view', 'calendar_view',
            'email_view', 'calls_view', 'tasks_view'
          ]
        };
        
        setPermissions(rolePermissions[userRole] || rolePermissions['Data Analyst']);
        setRoles([userRole]);
      } catch (err) {
        console.error('Error in permissions fallback:', err);
        // Default to IT Admin permissions as fallback
        setPermissions([
          'dashboard_view', 'leads_view', 'leads_create', 'leads_edit', 'leads_delete',
          'contacts_view', 'contacts_create', 'contacts_edit', 'contacts_delete',
          'accounts_view', 'accounts_create', 'accounts_edit', 'accounts_delete',
          'deals_view', 'deals_create', 'deals_edit', 'deals_delete',
          'calendar_view', 'calendar_create', 'calendar_edit', 'calendar_delete',
          'email_view', 'email_send', 'calls_view', 'calls_log',
          'tasks_view', 'tasks_create', 'tasks_edit', 'tasks_delete',
          'users_view', 'users_create', 'users_edit', 'users_delete',
          'permissions_view', 'permissions_manage'
        ]);
        setRoles(['IT Admin']);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permissionKey) => {
    return permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys) => {
    return permissionKeys.some(key => permissions.includes(key));
  };

  const hasAllPermissions = (permissionKeys) => {
    return permissionKeys.every(key => permissions.includes(key));
  };

  const isITAdmin = () => {
    return roles.includes('IT Admin');
  };

  return {
    permissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isITAdmin
  };
};

export default usePermissions;