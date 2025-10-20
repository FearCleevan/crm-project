import React from 'react';
import { FiX } from 'react-icons/fi';
import styles from './Modals.module.css';

const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>User Details - {user.firstName} {user.lastName}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.userInfoModal}>
            <div className={styles.avatarModal}>
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div>
              <div className={styles.userNameModal}>{user.firstName} {user.lastName}</div>
              <div className={styles.userEmailModal}>{user.email}</div>
              <div className={styles.userLastLogin}>
                Last Login: {formatDate(user.lastLogin)}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>User Roles</h4>
            <div className={styles.itemsList}>
              {user.roles && user.roles.length > 0 ? (
                user.roles.map(role => (
                  <span key={role} className={styles.roleBadge}>
                    {role}
                  </span>
                ))
              ) : (
                <p className={styles.noItems}>No roles assigned</p>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h4>User Permissions</h4>
            <div className={styles.itemsList}>
              {user.permissions && user.permissions.length > 0 ? (
                user.permissions.map(permission => (
                  <span key={permission} className={styles.permissionBadge}>
                    {permission.replace(/_/g, ' ')}
                  </span>
                ))
              ) : (
                <p className={styles.noItems}>No permissions assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* <div className={styles.modalFooter}>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ViewUserModal;