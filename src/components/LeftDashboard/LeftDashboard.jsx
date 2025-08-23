// Updated LeftDashboard.jsx with robust error handling
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './LeftDashboard.module.css';
import usePermissions from '../../hooks/usePermissions';
import {
  hasAccessToNavigation,
  hasAccessToCategory
} from '../../utils/permissionMappings';

const LeftDashboard = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, roles, loading, error } = usePermissions();
  const [accessibleRoutes, setAccessibleRoutes] = useState({});

  // Determine which routes are accessible based on permissions
  useEffect(() => {
    if (!loading) {
      const accessible = {};

      // Always allow dashboard access
      accessible.DASHBOARD = true;

      // Check other routes based on permissions
      accessible.CONTACTS = hasAccessToNavigation(permissions, 'CONTACTS');
      accessible.ACCOUNTS = hasAccessToNavigation(permissions, 'ACCOUNTS');
      accessible.DEALS = hasAccessToNavigation(permissions, 'DEALS');
      accessible.LEADS = hasAccessToNavigation(permissions, 'LEADS');
      accessible.CALENDAR = hasAccessToNavigation(permissions, 'CALENDAR');
      accessible.EMAILS = hasAccessToNavigation(permissions, 'EMAILS');
      accessible.CALLS = hasAccessToNavigation(permissions, 'CALLS');
      accessible.TASKS = hasAccessToNavigation(permissions, 'TASKS');
      accessible.PERMISSIONS = hasAccessToNavigation(permissions, 'PERMISSIONS');
      accessible.USER_MANAGEMENT = hasAccessToNavigation(permissions, 'USER_MANAGEMENT');

      setAccessibleRoutes(accessible);

      // Redirect if current route is not accessible
      const currentPath = location.pathname;
      if (currentPath === '/permissions' && !accessible.PERMISSIONS) {
        navigate('/dashboard', { replace: true });
      } else if (currentPath === '/user-management' && !accessible.USER_MANAGEMENT) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [permissions, loading, location, navigate]);

  // Function to check if a path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className={styles.leftDashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Permissions error:', error);
    // Continue with default accessible routes
  }

  return (
    <div className={styles.leftDashboard}>
      <div className={styles.sidebarHeader}>
        {!collapsed && <h3 className={styles.sidebarTitle}>Navigation</h3>}
      </div>

      {!collapsed && (
        <div className={styles.sidebarContent}>
          {/* CRM Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>CRM</h4>
            <ul className={styles.navList}>
              {/* Dashboard - Always accessible */}
              <li className={styles.navItem}>
                <Link
                  to="/dashboard"
                  className={`${styles.navLink} ${isActivePath('/dashboard') ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>📊</span>
                  <span>Dashboard</span>
                </Link>
              </li>

              {/* Contacts */}
              {accessibleRoutes.CONTACTS && (
                <li className={styles.navItem}>
                  <Link
                    to="/contacts"
                    className={`${styles.navLink} ${isActivePath('/contacts') ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>👤</span>
                    <span>Contacts</span>
                  </Link>
                </li>
              )}

              {/* Accounts */}
              {accessibleRoutes.ACCOUNTS && (
                <li className={styles.navItem}>
                  <Link
                    to="/accounts"
                    className={`${styles.navLink} ${isActivePath('/accounts') ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>💼</span>
                    <span>Accounts</span>
                  </Link>
                </li>
              )}

              {/* Deals */}
              {accessibleRoutes.DEALS && (
                <li className={styles.navItem}>
                  <Link
                    to="/deals"
                    className={`${styles.navLink} ${isActivePath('/deals') ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>💰</span>
                    <span>Deals</span>
                  </Link>
                </li>
              )}

              {/* Leads */}
              {accessibleRoutes.LEADS && (
                <li className={styles.navItem}>
                  <Link
                    to="/leads"
                    className={`${styles.navLink} ${isActivePath('/leads') ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>📈</span>
                    <span>Leads</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Activities Section */}
          {(accessibleRoutes.CALENDAR || accessibleRoutes.EMAILS ||
            accessibleRoutes.CALLS || accessibleRoutes.TASKS) && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Activities</h4>
                <ul className={styles.navList}>
                  {/* Calendar */}
                  {accessibleRoutes.CALENDAR && (
                    <li className={styles.navItem}>
                      <Link
                        to="/calendar"
                        className={`${styles.navLink} ${isActivePath('/calendar') ? styles.active : ''}`}
                      >
                        <span className={styles.navIcon}>📅</span>
                        <span>Calendar</span>
                      </Link>
                    </li>
                  )}

                  {/* Emails */}
                  {accessibleRoutes.EMAILS && (
                    <li className={styles.navItem}>
                      <Link
                        to="/emails"
                        className={`${styles.navLink} ${isActivePath('/emails') ? styles.active : ''}`}
                      >
                        <span className={styles.navIcon}>✉️</span>
                        <span>Emails</span>
                      </Link>
                    </li>
                  )}

                  {/* Calls */}
                  {accessibleRoutes.CALLS && (
                    <li className={styles.navItem}>
                      <Link
                        to="/calls"
                        className={`${styles.navLink} ${isActivePath('/calls') ? styles.active : ''}`}
                      >
                        <span className={styles.navIcon}>📞</span>
                        <span>Calls</span>
                      </Link>
                    </li>
                  )}

                  {/* Tasks */}
                  {accessibleRoutes.TASKS && (
                    <li className={styles.navItem}>
                      <Link
                        to="/tasks"
                        className={`${styles.navLink} ${isActivePath('/tasks') ? styles.active : ''}`}
                      >
                        <span className={styles.navIcon}>📝</span>
                        <span>Tasks</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

          {/* Account Settings Section - Only show for IT Admins */}
          {(accessibleRoutes.PERMISSIONS || accessibleRoutes.USER_MANAGEMENT) && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Account Settings</h4>
              <ul className={styles.navList}>
                {/* Permissions */}
                {accessibleRoutes.PERMISSIONS && (
                  <li className={styles.navItem}>
                    <Link
                      to="/permissions"
                      className={`${styles.navLink} ${isActivePath('/permissions') ? styles.active : ''}`}
                    >
                      <span className={styles.navIcon}>🔐</span>
                      <span>Permissions</span>
                    </Link>
                  </li>
                )}

                {/* User Management */}
                {accessibleRoutes.USER_MANAGEMENT && (
                  <li className={styles.navItem}>
                    <Link
                      to="/user-management"
                      className={`${styles.navLink} ${isActivePath('/user-management') ? styles.active : ''}`}
                    >
                      <span className={styles.navIcon}>👥</span>
                      <span>Account Management</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className={styles.collapsedMenu}>
          {/* Dashboard - Always accessible */}
          <Link
            to="/dashboard"
            className={`${styles.collapsedIcon} ${isActivePath('/dashboard') ? styles.active : ''}`}
            title="Dashboard"
          >
            <span>📊</span>
          </Link>

          {/* Contacts */}
          {accessibleRoutes.CONTACTS && (
            <Link
              to="/contacts"
              className={`${styles.collapsedIcon} ${isActivePath('/contacts') ? styles.active : ''}`}
              title="Contacts"
            >
              <span>👤</span>
            </Link>
          )}

          {/* Accounts */}
          {accessibleRoutes.ACCOUNTS && (
            <Link
              to="/accounts"
              className={`${styles.collapsedIcon} ${isActivePath('/accounts') ? styles.active : ''}`}
              title="Accounts"
            >
              <span>💼</span>
            </Link>
          )}

          {/* Permissions */}
          {accessibleRoutes.PERMISSIONS && (
            <Link
              to="/permissions"
              className={`${styles.collapsedIcon} ${isActivePath('/permissions') ? styles.active : ''}`}
              title="Permissions"
            >
              <span>🔐</span>
            </Link>
          )}

          {/* User Management */}
          {accessibleRoutes.USER_MANAGEMENT && (
            <Link
              to="/user-management"
              className={`${styles.collapsedIcon} ${isActivePath('/user-management') ? styles.active : ''}`}
              title="Account Management"
            >
              <span>👥</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftDashboard;