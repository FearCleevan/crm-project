//src/components/Permissions/Modals/RoleAssignmentModal.jsx
import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import styles from './Modals.module.css';

const RoleAssignmentModal = ({ 
  user, 
  roles, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const [selectedRoles, setSelectedRoles] = useState(user?.roles || []);

  const handleRoleSelection = (roleName, isSelected) => {
    if (isSelected) {
      setSelectedRoles(prev => [...prev, roleName]);
    } else {
      setSelectedRoles(prev => prev.filter(role => role !== roleName));
    }
  };

  const handleSave = () => {
    onSave(selectedRoles);
  };

  if (!user) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Assign Roles to {user.firstName} {user.lastName}</h3>
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
            </div>
          </div>

          <div className={styles.rolesSection}>
            <h4>Available Roles</h4>
            <div className={styles.rolesListModal}>
              {roles.map(role => (
                <div key={role.id} className={styles.roleItem}>
                  <label className={styles.roleCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.name)}
                      onChange={(e) => handleRoleSelection(role.name, e.target.checked)}
                      disabled={role.isSystemRole && !user.roles.includes(role.name)}
                    />
                    <span className={styles.checkmark}></span>
                    <div className={styles.roleInfo}>
                      <div className={styles.roleName}>{role.name}</div>
                      <div className={styles.roleDescription}>{role.description}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;