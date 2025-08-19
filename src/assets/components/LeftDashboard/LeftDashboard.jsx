import React from 'react';
import styles from './LeftDashboard.module.css';

const LeftDashboard = ({ collapsed }) => {
    return (
        <div className={styles.leftDashboard}>
            <div className={styles.sidebarHeader}>
                {!collapsed && <h3 className={styles.sidebarTitle}>Navigation</h3>}
            </div>

            {!collapsed && (
                <div className={styles.sidebarContent}>
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>CRM</h4>
                        <ul className={styles.navList}>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>📊</span>
                                    <span>Dashboard</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>👤</span>
                                    <span>Contacts</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>💼</span>
                                    <span>Accounts</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>💰</span>
                                    <span>Deals</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>📈</span>
                                    <span>Leads</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Activities</h4>
                        <ul className={styles.navList}>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>📅</span>
                                    <span>Calendar</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>✉️</span>
                                    <span>Emails</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>📞</span>
                                    <span>Calls</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="#" className={styles.navLink}>
                                    <span className={styles.navIcon}>📝</span>
                                    <span>Tasks</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {collapsed && (
                <div className={styles.collapsedMenu}>
                    <button className={styles.collapsedIcon}>
                        <span>📊</span>
                    </button>
                    <button className={styles.collapsedIcon}>
                        <span>👤</span>
                    </button>
                    <button className={styles.collapsedIcon}>
                        <span>💼</span>
                    </button>
                    <button className={styles.collapsedIcon}>
                        <span>💰</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeftDashboard;