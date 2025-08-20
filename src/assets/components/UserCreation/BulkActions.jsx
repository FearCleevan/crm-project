import React from 'react';
import styles from './UserCreation.module.css';

const BulkActions = ({ selectedCount, onBulkEdit, onBulkDelete }) => {
    if (selectedCount === 0) return null;

    return (
        <div className={styles.bulkActions}>
            <div className={styles.bulkActionsContent}>
                <span>{selectedCount} user(s) selected</span>
                <div className={styles.bulkButtons}>
                    <button className={styles.bulkButton} onClick={onBulkEdit}>
                        Edit
                    </button>
                    <button className={styles.bulkButton} onClick={onBulkDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActions;