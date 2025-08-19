import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import RightDashboard from '../RightDashboard/RightDashboard';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import { DashboardSkeleton } from '../Common/SkeletonLoading';

// Mock data for dashboard stats and activities
const mockDashboardData = {
  stats: {
    totalLeads: 1248,
    totalLeadsChange: 12,
    totalEmails: 2475,
    totalEmailsChange: 8,
    totalPhones: 1982,
    totalPhonesChange: 5,
    totalCompanies: 428,
    totalCompaniesChange: 3,
    duplicateLeads: 87,
    duplicateLeadsChange: -2,
    junkLeads: 42,
    junkLeadsChange: -15
  },
  recentActivity: [
    {
      id: 1,
      type: "call",
      icon: "📞",
      description: "Call with Acme Corp completed",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: "John Doe"
    },
    {
      id: 2,
      type: "email",
      icon: "✉️",
      description: "Proposal sent to XYZ Ltd",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      user: "Jane Smith"
    },
    {
      id: 3,
      type: "meeting",
      icon: "📅",
      description: "Meeting scheduled with ABC Inc",
      timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      user: "John Doe"
    },
    {
      id: 4,
      type: "task",
      icon: "✅",
      description: "Completed customer onboarding process",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      user: "Mike Johnson"
    },
    {
      id: 5,
      type: "note",
      icon: "📝",
      description: "Added new notes to Johnson account",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      user: "Sarah Wilson"
    }
  ]
};

// Logout Confirmation Modal Component
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

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(true);
    const [showLeftToggle, setShowLeftToggle] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (!token) {
                    throw new Error('No authentication token');
                }

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                const response = await fetch('http://localhost:5001/api/auth/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to verify session');
                }

                const data = await response.json();
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Set mock data for dashboard stats and activities
                setDashboardData(mockDashboardData);

            } catch (err) {
                console.error('Authentication error:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login', { state: { error: err.message } });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        try {
            await fetch('http://localhost:5001/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setShowLogoutModal(false);
            navigate('/login');
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatDate = (date) => {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        
        if (date > now) {
            // Future date
            return 'Tomorrow, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffHours < 24) {
            return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (isLoading || !user || !dashboardData) {
        return <DashboardSkeleton />;
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Logout Confirmation Modal */}
            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                userName={`${user.firstName} ${user.lastName}`}
            />
            
            {/* Left Dashboard Panel */}
            <div
                className={`${styles.leftPanel} ${leftCollapsed ? styles.collapsed : ''}`}
                onMouseEnter={() => setShowLeftToggle(true)}
                onMouseLeave={() => setShowLeftToggle(false)}
            >
                <LeftDashboard collapsed={leftCollapsed} />
            </div>

            {/* Collapse Button (between left panel and main content) */}
            <div
                className={`${styles.collapseButtonWrapper} ${leftCollapsed ? styles.collapsed : ''}`}
                onMouseEnter={() => setShowLeftToggle(true)}
                onMouseLeave={() => setShowLeftToggle(false)}
            >
                {showLeftToggle && (
                    <button
                        className={styles.collapseButton}
                        onClick={() => setLeftCollapsed(!leftCollapsed)}
                        aria-label={leftCollapsed ? "Expand navigation" : "Collapse navigation"}
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                            <path d={leftCollapsed ?
                                "M12.76 10.56a.77.77 0 0 0 0-1.116L8.397 5.233a.84.84 0 0 0-1.157 0 .77.77 0 0 0 0 1.116l3.785 3.653-3.785 3.652a.77.77 0 0 0 0 1.117.84.84 0 0 0 1.157 0l4.363-4.211Z" :
                                "M7.24 9.444a.77.77 0 0 0 0 1.116l4.363 4.21a.84.84 0 0 0 1.157 0 .77.77 0 0 0 0-1.116l-3.785-3.652 3.785-3.653a.77.77 0 0 0 0-1.116.84.84 0 0 0-1.157 0L7.24 9.443Z"}
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className={`${styles.mainContentArea} ${leftCollapsed ? styles.leftCollapsed : ''} ${rightCollapsed ? styles.rightCollapsed : ''}`}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.logo}>CRM Dashboard</h1>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                            <span className={styles.userRole}>{user.role}</span>
                        </div>
                        <button
                            className={styles.sidebarToggle}
                            onClick={() => setRightCollapsed(!rightCollapsed)}
                        >
                            {rightCollapsed ? '☰' : '▶'}
                        </button>
                        <button onClick={handleLogoutClick} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className={styles.mainContent}>
                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Total Leads</h3>
                            </div>
                            <p className={styles.statValue}>{formatNumber(dashboardData.stats.totalLeads)}</p>
                            <p className={dashboardData.stats.totalLeadsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                {dashboardData.stats.totalLeadsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.stats.totalLeadsChange)}% from last month
                            </p>
                            <button className={styles.moreInfoBtn}>More info</button>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Total Emails</h3>
                            </div>
                            <p className={styles.statValue}>{formatNumber(dashboardData.stats.totalEmails)}</p>
                            <p className={dashboardData.stats.totalEmailsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                {dashboardData.stats.totalEmailsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.stats.totalEmailsChange)}% from last week
                            </p>
                            <button className={styles.moreInfoBtn}>More info</button>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Total Phone Numbers</h3>
                            </div>
                            <p className={styles.statValue}>{formatNumber(dashboardData.stats.totalPhones)}</p>
                            <p className={dashboardData.stats.totalPhonesChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                {dashboardData.stats.totalPhonesChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.stats.totalPhonesChange)}% from yesterday
                            </p>
                            <button className={styles.moreInfoBtn}>More info</button>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Total Company</h3>
                            </div>
                            <p className={styles.statValue}>{formatNumber(dashboardData.stats.totalCompanies)}</p>
                            <p className={dashboardData.stats.totalCompaniesChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                {dashboardData.stats.totalCompaniesChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.stats.totalCompaniesChange)}% from last quarter
                            </p>
                            <button className={styles.moreInfoBtn}>More info</button>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Duplicate Leads</h3>
                            </div>
                            <p className={styles.statValue}>{formatNumber(dashboardData.stats.duplicateLeads)}</p>
                            <p className={dashboardData.stats.duplicateLeadsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                {dashboardData.stats.duplicateLeadsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.stats.duplicateLeadsChange)}% from last month
                            </p>
                            <button className={styles.moreInfoBtn}>More info</button>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Junk Leads</h3>
                            </div>
                            <p className={styles.statValue}>{formatNumber(dashboardData.stats.junkLeads)}</p>
                            <p className={dashboardData.stats.junkLeadsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                {dashboardData.stats.junkLeadsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData.stats.junkLeadsChange)}% from last week
                            </p>
                            <button className={styles.moreInfoBtn}>More info</button>
                        </div>
                    </div>

                    <div className={styles.recentActivity}>
                        <h3>Recent Activity</h3>
                        <div className={styles.activityList}>
                            {dashboardData.recentActivity.map(activity => (
                                <div key={activity.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>{activity.icon}</div>
                                    <div className={styles.activityDetails}>
                                        <p>{activity.description}</p>
                                        <small>{formatDate(activity.timestamp)} • By {activity.user}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Right Dashboard Panel */}
            <div className={`${styles.rightPanel} ${rightCollapsed ? styles.collapsed : ''}`}>
                <RightDashboard
                    collapsed={rightCollapsed}
                    onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
                />
            </div>
        </div>
    );
};

export default Dashboard;