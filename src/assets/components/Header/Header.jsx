import React from 'react';
import styles from './Header.module.css';

const Header = ({ 
  user, 
  onLogoutClick, 
  onToggleRightPanel, 
  rightCollapsed,
  showRightToggle = true // Default to showing the toggle
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.logo}>CRM Dashboard</h1>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.firstName} {user.lastName}</span>
          <span className={styles.userRole}>{user.role}</span>
        </div>
        {showRightToggle && (
          <button
            className={styles.sidebarToggle}
            onClick={onToggleRightPanel}
            aria-label={rightCollapsed ? "Expand right panel" : "Collapse right panel"}
          >
            {rightCollapsed ? '☰' : '▶'}
          </button>
        )}
        <button onClick={onLogoutClick} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;