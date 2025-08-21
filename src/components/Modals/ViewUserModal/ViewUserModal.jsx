// src/assets/components/Modals/ViewUserModal/ViewUserModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiEdit, FiKey, FiShield } from 'react-icons/fi';
import styles from './ViewUserModal.module.css';

const ViewUserModal = ({ isOpen, onClose, user, onEdit }) => {
  const [userRoles, setUserRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserPermissionsAndRoles();
    }
  }, [isOpen, user]);

  const fetchUserPermissionsAndRoles = async () => {
    if (!user || !user.user_id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user roles and permissions
      const response = await fetch(`http://localhost:5001/api/permissions/users/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserRoles(data.user.roles || []);
          setUserPermissions(data.user.permissions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPermissionsDisplay = () => {
    if (!user.permissions) return 'Not Assigned';
    
    try {
      const permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions;
      
      if (!permissions || Object.keys(permissions).length === 0) {
        return 'Not Assigned';
      }
      
      return Object.entries(permissions)
        .filter(([_, hasPermission]) => hasPermission)
        .map(([permission]) => permission)
        .join(', ') || 'Not Assigned';
    } catch (error) {
      return 'Not Assigned';
    }
  };

  const formatPermissionKey = (permission) => {
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPermissionCategory = (permission) => {
    if (permission.includes('dashboard')) return 'Dashboard';
    if (permission.includes('lead')) return 'Leads';
    if (permission.includes('contact')) return 'Contacts';
    if (permission.includes('account')) return 'Accounts';
    if (permission.includes('deal')) return 'Deals';
    if (permission.includes('calendar')) return 'Calendar';
    if (permission.includes('email')) return 'Email';
    if (permission.includes('call')) return 'Calls';
    if (permission.includes('task')) return 'Tasks';
    if (permission.includes('user')) return 'Users';
    if (permission.includes('permission')) return 'Permissions';
    return 'Other';
  };

  const groupedPermissions = userPermissions.reduce((groups, permission) => {
    const category = getPermissionCategory(permission);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {});

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>User Details</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.editButton}
              onClick={onEdit}
            >
              <FiEdit size={16} />
              Edit User
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userHeader}>
            <div className={styles.avatarLarge}>
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className={styles.userTitle}>
              <h3>{user.first_name} {user.middle_name && `${user.middle_name} `}{user.last_name}</h3>
              <span className={`${styles.roleBadge} ${user.role === 'IT Admin' ? styles.admin : styles.analyst}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className={styles.userDetails}>
            <div className={styles.detailSection}>
              <h4>Personal Information</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{user.email || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Username</span>
                  <span className={styles.detailValue}>{user.username || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{user.phone_no || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Birthday</span>
                  <span className={styles.detailValue}>{formatDate(user.birthday)}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>Address</h4>
              <div className={styles.detailItem}>
                <span className={styles.detailValue}>
                  {user.address || 'No address provided'}
                </span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>Roles & Access</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Primary Role</span>
                  <span className={styles.detailValue}>{user.role || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Additional Roles</span>
                  <div className={styles.rolesList}>
                    {loading ? (
                      <span className={styles.loadingText}>Loading roles...</span>
                    ) : userRoles.length > 0 ? (
                      userRoles.map(role => (
                        <span key={role} className={styles.roleTag}>
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className={styles.detailValue}>No additional roles</span>
                    )}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Account Created</span>
                  <span className={styles.detailValue}>{formatDate(user.created_at)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Last Updated</span>
                  <span className={styles.detailValue}>{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div className={styles.detailSection}>
              <h4>
                <FiKey size={18} className={styles.sectionIcon} />
                User Permissions
              </h4>
              {loading ? (
                <div className={styles.loadingPermissions}>
                  <div className={styles.spinner}></div>
                  <span>Loading permissions...</span>
                </div>
              ) : userPermissions.length > 0 ? (
                <div className={styles.permissionsGrid}>
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category} className={styles.permissionCategory}>
                      <h5 className={styles.categoryTitle}>
                        <FiShield size={14} />
                        {category}
                      </h5>
                      <div className={styles.permissionsList}>
                        {permissions.map(permission => (
                          <span key={permission} className={styles.permissionTag}>
                            {formatPermissionKey(permission)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noPermissions}>
                  <FiKey size={24} />
                  <span>No permissions assigned</span>
                </div>
              )}
            </div>

            {/* Legacy Permissions (from user.permissions field) */}
            {user.permissions && (
              <div className={styles.detailSection}>
                <h4>Legacy Permissions</h4>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Additional Permissions</span>
                  <span className={styles.detailValue}>{getPermissionsDisplay()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;