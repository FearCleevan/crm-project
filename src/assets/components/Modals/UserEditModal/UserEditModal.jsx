//src/assets/components/Modals/UserEditModal/UserEditModal.jsx
// src/assets/components/Modals/UserEditModal/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './UserEditModal.module.css';

const UserEditModal = ({ isOpen, onClose, user, mode, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    phone_no: '',
    address: '',
    role: 'Data Analyst',
    email: '',
    username: ''
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === 'edit');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        birthday: user.birthday || '',
        phone_no: user.phone_no || '',
        address: user.address || '',
        role: user.role || 'Data Analyst',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only if changing password)
    if (passwordData.password && passwordData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Password confirmation
    if (passwordData.password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrors({ general: 'No authentication token found. Please log in again.' });
        setIsSubmitting(false);
        return;
      }

      const updateData = { ...formData };
      
      // Only include password if it's provided
      if (passwordData.password) {
        updateData.password = passwordData.password;
      }

      const response = await fetch(`http://localhost:5001/api/users/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('email') || data.error.includes('Email')) {
          setErrors({ email: data.error });
        } else if (data.error.includes('username') || data.error.includes('Username')) {
          setErrors({ username: data.error });
        } else {
          setErrors({ general: data.error });
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onUserUpdated();
        setPasswordData({
          password: '',
          confirm_password: ''
        });
        setSuccess(false);
        setIsEditing(false);
      }, 1500);
    } catch (error) {
      setErrors({ general: 'Failed to update user. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setErrors({});
      setPasswordData({
        password: '',
        confirm_password: ''
      });
      setIsEditing(mode === 'edit');
      setSuccess(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (!isOpen || !user) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Edit User' : 'View User'}</h2>
          <div className={styles.headerActions}>
            {mode === 'view' && (
              <button
                className={styles.editButton}
                onClick={toggleEditMode}
                disabled={isSubmitting}
              >
                <FiEdit size={16} />
                {isEditing ? 'Cancel Edit' : 'Edit User'}
              </button>
            )}
            <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        {success ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <FiCheck size={48} />
            </div>
            <h3>User Updated Successfully!</h3>
            <p>The user information has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {errors.general && (
              <div className={styles.errorBanner}>
                <FiAlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={errors.first_name ? styles.errorInput : ''}
                  disabled={!isEditing || isSubmitting}
                />
                {errors.first_name && <span className={styles.errorText}>{errors.first_name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="middle_name">Middle Name</label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={errors.last_name ? styles.errorInput : ''}
                  disabled={!isEditing || isSubmitting}
                />
                {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? styles.errorInput : ''}
                  disabled={!isEditing || isSubmitting}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? styles.errorInput : ''}
                  disabled={!isEditing || isSubmitting}
                />
                {errors.username && <span className={styles.errorText}>{errors.username}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSubmitting}
                >
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="IT Admin">IT Admin</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone_no">Phone Number</label>
                <input
                  type="tel"
                  id="phone_no"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="birthday">Birthday</label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSubmitting}
                />
              </div>

              {isEditing && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="password">New Password (leave blank to keep current)</label>
                    <div className={styles.passwordInput}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        className={errors.password ? styles.errorInput : ''}
                        disabled={isSubmitting}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirm_password">Confirm New Password</label>
                    <div className={styles.passwordInput}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm_password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className={errors.confirm_password ? styles.errorInput : ''}
                        disabled={isSubmitting}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <span className={styles.errorText}>{errors.confirm_password}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                disabled={!isEditing || isSubmitting}
                className={styles.textarea}
              />
            </div>

            {isEditing && (
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default UserEditModal;