// Updated LeftDashboard.jsx with React Router integration
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './LeftDashboard.module.css';

const LeftDashboard = ({ collapsed }) => {
    const location = useLocation();
    
    // Function to check if a path is active
    const isActivePath = (path) => {
        return location.pathname === path;
    };

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
                                <Link 
                                    to="/dashboard" 
                                    className={`${styles.navLink} ${isActivePath('/dashboard') ? styles.active : ''}`}
                                >
                                    <span className={styles.navIcon}>📊</span>
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>👤</span>
                                    <span>Contacts</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>💼</span>
                                    <span>Accounts</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>💰</span>
                                    <span>Deals</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
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
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>📅</span>
                                    <span>Calendar</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>✉️</span>
                                    <span>Emails</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>📞</span>
                                    <span>Calls</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>📝</span>
                                    <span>Tasks</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Account Settings</h4>
                        <ul className={styles.navList}>
                            <li className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.navLink}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <span className={styles.navIcon}>🔐</span>
                                    <span>Permissions</span>
                                </a>
                            </li>
                            <li className={styles.navItem}>
                                <Link 
                                    to="/user-management" 
                                    className={`${styles.navLink} ${isActivePath('/user-management') ? styles.active : ''}`}
                                >
                                    <span className={styles.navIcon}>👥</span>
                                    <span>Account Management</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {collapsed && (
                <div className={styles.collapsedMenu}>
                    <Link 
                        to="/dashboard" 
                        className={`${styles.collapsedIcon} ${isActivePath('/dashboard') ? styles.active : ''}`}
                        title="Dashboard"
                    >
                        <span>📊</span>
                    </Link>
                    <button 
                        className={styles.collapsedIcon}
                        onClick={(e) => e.preventDefault()}
                        title="Contacts"
                    >
                        <span>👤</span>
                    </button>
                    <button 
                        className={styles.collapsedIcon}
                        onClick={(e) => e.preventDefault()}
                        title="Accounts"
                    >
                        <span>💼</span>
                    </button>
                    <button 
                        className={styles.collapsedIcon}
                        onClick={(e) => e.preventDefault()}
                        title="Deals"
                    >
                        <span>💰</span>
                    </button>
                    <Link 
                        to="/user-management" 
                        className={`${styles.collapsedIcon} ${isActivePath('/user-management') ? styles.active : ''}`}
                        title="Account Management"
                    >
                        <span>👥</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default LeftDashboard;