import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import RightDashboard from '../RightDashboard/RightDashboard';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import { DashboardSkeleton } from '../Common/SkeletonLoading';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(true);
    const [showLeftToggle, setShowLeftToggle] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5001/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    if (isLoading || !user) {
        return <DashboardSkeleton />;
    }

    return (
        <div className={styles.dashboardContainer}>
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
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className={styles.mainContent}>
                    <div className={styles.welcomeSection}>
                        <h2>Welcome back, {user.firstName}!</h2>
                        <p>Here's what's happening with your CRM today.</p>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Customers</h3>
                            <p className={styles.statValue}>1,248</p>
                            <p className={styles.statChange}>↑ 12% from last month</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>New Leads</h3>
                            <p className={styles.statValue}>84</p>
                            <p className={styles.statChange}>↑ 5% from last week</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Open Tasks</h3>
                            <p className={styles.statValue}>23</p>
                            <p className={styles.statChange}>↓ 3 from yesterday</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Revenue</h3>
                            <p className={styles.statValue}>$48,750</p>
                            <p className={styles.statChange}>↑ 18% from last quarter</p>
                        </div>
                    </div>

                    <div className={styles.recentActivity}>
                        <h3>Recent Activity</h3>
                        <div className={styles.activityList}>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}>📞</div>
                                <div className={styles.activityDetails}>
                                    <p>Call with Acme Corp completed</p>
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
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}>📅</div>
                                <div className={styles.activityDetails}>
                                    <p>Meeting scheduled with ABC Inc</p>
                                    <small>Tomorrow, 2:00 PM</small>
                                </div>
                            </div>
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