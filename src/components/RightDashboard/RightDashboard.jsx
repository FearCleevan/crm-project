import React from 'react';
import styles from './RightDashboard.module.css';

const RightDashboard = ({ collapsed, onToggleCollapse }) => {
    return (
        <div className={styles.rightDashboard}>
            <div className={styles.sidebarHeader}>
                {!collapsed && <h3 className={styles.sidebarTitle}>Quick Actions</h3>}
                <button 
                    className={styles.collapseButton}
                    onClick={onToggleCollapse}
                >
                    {collapsed ? '←' : '→'}
                </button>
            </div>

            {!collapsed && (
                <div className={styles.sidebarContent}>
                    <div className={styles.quickAction}>
                        <button className={styles.actionButton}>
                            <span className={styles.actionIcon}>✉️</span>
                            <span>New Email</span>
                        </button>
                    </div>
                    <div className={styles.quickAction}>
                        <button className={styles.actionButton}>
                            <span className={styles.actionIcon}>📞</span>
                            <span>Log Call</span>
                        </button>
                    </div>
                    <div className={styles.quickAction}>
                        <button className={styles.actionButton}>
                            <span className={styles.actionIcon}>📅</span>
                            <span>Schedule Meeting</span>
                        </button>
                    </div>
                    <div className={styles.quickAction}>
                        <button className={styles.actionButton}>
                            <span className={styles.actionIcon}>➕</span>
                            <span>Add Task</span>
                        </button>
                    </div>

                    <div className={styles.recentActivity}>
                        <h4 className={styles.sectionTitle}>Recent Activity</h4>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>📞</div>
                            <div className={styles.activityDetails}>
                                <p>Call with Acme Corp</p>
                                <small>Today, 10:30 AM</small>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>✉️</div>
                            <div className={styles.activityDetails}>
                                <p>Proposal sent to XYZ Ltd</p>
                                <small>Yesterday, 3:45 PM</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightDashboard;