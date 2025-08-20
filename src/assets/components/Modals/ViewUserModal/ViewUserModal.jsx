// src/assets/components/Modals/ViewUserModal/ViewUserModal.jsx
import React from 'react';
import { FiX, FiEdit } from 'react-icons/fi';
import styles from './ViewUserModal.module.css';

const ViewUserModal = ({ isOpen, onClose, user, onEdit }) => {
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
              <h4>Permissions & Access</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Role</span>
                  <span className={styles.detailValue}>{user.role || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Additional Permissions</span>
                  <span className={styles.detailValue}>{getPermissionsDisplay()}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;