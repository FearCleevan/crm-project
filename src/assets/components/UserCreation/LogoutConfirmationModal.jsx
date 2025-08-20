import React from 'react';
import styles from './UserCreation.module.css';

const LogoutConfirmationModal = ({ isOpen, onConfirm, onCancel, userName }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Confirm Logout</h3>
                </div>
                <div className={styles.modalBody}>
                    <p>Are you sure you want to logout, <strong>{userName}</strong>?</p>
                </div>
                <div className={styles.modalFooter}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        Stay Logged In
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={onConfirm}
                    >
                        Yes, Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;