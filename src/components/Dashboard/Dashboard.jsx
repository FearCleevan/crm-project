//src/assets/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import RightDashboard from '../RightDashboard/RightDashboard';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import Header from '../Header/Header';
import { DashboardSkeleton } from '../Common/SkeletonLoading';
import useAuth from '../../hooks/useAuth';

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
    const { user, isLoading, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(true);
    const [showLeftToggle, setShowLeftToggle] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    // Fetch real dashboard data from API
    const fetchDashboardData = async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard data: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setDashboardData(data.data);
            } else {
                throw new Error(data.error || 'Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStatsError(error.message);
            // Fallback to empty data structure
            setDashboardData({
                stats: {
                    totalLeads: 0,
                    totalLeadsChange: 0,
                    totalEmails: 0,
                    totalEmailsChange: 0,
                    totalPhones: 0,
                    totalPhonesChange: 0,
                    totalCompanies: 0,
                    totalCompaniesChange: 0,
                    duplicateLeads: 0,
                    duplicateLeadsChange: 0,
                    junkLeads: 0,
                    junkLeadsChange: 0
                },
                recentActivity: []
            });
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        await logout();
        setShowLogoutModal(false);
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

    // Mock recent activity (you can replace this with real data later)
    const mockRecentActivity = [
        {
            id: 1,
            type: "import",
            icon: "📥",
            description: "New prospects imported from CSV",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: `${user?.firstName} ${user?.lastName}`
        },
        {
            id: 2,
            type: "update",
            icon: "✏️",
            description: "Updated prospect information",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            user: `${user?.firstName} ${user?.lastName}`
        }
    ];

    if (isLoading || !user) {
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
                {/* Header Component */}
                <Header
                    user={user}
                    onLogoutClick={handleLogoutClick}
                    onToggleRightPanel={() => setRightCollapsed(!rightCollapsed)}
                    rightCollapsed={rightCollapsed}
                />

                <main className={styles.mainContent}>
                    {/* Stats Grid */}
                    {statsError && (
                        <div className={styles.errorMessage}>
                            <p>Error loading dashboard stats: {statsError}</p>
                            <button onClick={fetchDashboardData} className={styles.retryButton}>
                                Retry
                            </button>
                        </div>
                    )}

                    {statsLoading ? (
                        <div className={styles.statsGrid}>
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <h3>Loading...</h3>
                                    </div>
                                    <div className={styles.statSkeleton}></div>
                                    <div className={styles.changeSkeleton}></div>
                                    <div className={styles.buttonSkeleton}></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.statsGrid}>
                            {/* Total Leads */}
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <h3>Total Leads</h3>
                                    <span className={styles.infoTooltip} title="All active prospects in the system">ℹ️</span>
                                </div>
                                <p className={styles.statValue}>{formatNumber(dashboardData?.stats?.totalLeads || 0)}</p>
                                <p className={styles.statDescription}>
                                    Active prospects in database
                                </p>
                                <p className={dashboardData?.stats?.totalLeadsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                    {dashboardData?.stats?.totalLeadsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.stats?.totalLeadsChange || 0)}% from last month
                                </p>
                                <button className={styles.moreInfoBtn}>View All Leads</button>
                            </div>

                            {/* Total Emails */}
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <h3>Unique Emails</h3>
                                    <span className={styles.infoTooltip} title="Distinct valid email addresses">ℹ️</span>
                                </div>
                                <p className={styles.statValue}>{formatNumber(dashboardData?.stats?.totalEmails || 0)}</p>
                                <p className={styles.statDescription}>
                                    Distinct valid email addresses
                                </p>
                                <p className={dashboardData?.stats?.totalEmailsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                    {dashboardData?.stats?.totalEmailsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.stats?.totalEmailsChange || 0)}% from last week
                                </p>
                                <button className={styles.moreInfoBtn}>Email Analytics</button>
                            </div>

                            {/* Total Phone Numbers */}
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <h3>Leads with Phones</h3>
                                    <span className={styles.infoTooltip} title="Prospects with at least one valid phone number">ℹ️</span>
                                </div>
                                <p className={styles.statValue}>{formatNumber(dashboardData?.stats?.totalPhones || 0)}</p>
                                <p className={styles.statDescription}>
                                    Have at least one valid phone
                                </p>
                                <p className={dashboardData?.stats?.totalPhonesChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                    {dashboardData?.stats?.totalPhonesChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.stats?.totalPhonesChange || 0)}% from yesterday
                                </p>
                                <button className={styles.moreInfoBtn}>Phone Report</button>
                            </div>

                            {/* Total Companies */}
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <h3>Unique Companies</h3>
                                    <span className={styles.infoTooltip} title="Distinct company names">ℹ️</span>
                                </div>
                                <p className={styles.statValue}>{formatNumber(dashboardData?.stats?.totalCompanies || 0)}</p>
                                <p className={styles.statDescription}>
                                    Distinct company names
                                </p>
                                <p className={dashboardData?.stats?.totalCompaniesChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                    {dashboardData?.stats?.totalCompaniesChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.stats?.totalCompaniesChange || 0)}% from last quarter
                                </p>
                                <button className={styles.moreInfoBtn}>Company View</button>
                            </div>

                            {/* Duplicate Leads */}
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <h3>Duplicate Records</h3>
                                    <span className={styles.infoTooltip} title="Individual records with duplicate emails">ℹ️</span>
                                </div>
                                <p className={styles.statValue}>{formatNumber(dashboardData?.stats?.duplicateLeads || 0)}</p>
                                <p className={styles.statDescription}>
                                    Across {dashboardData?.stats?.duplicateGroups || 0} email groups
                                </p>
                                <p className={dashboardData?.stats?.duplicateLeadsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                    {dashboardData?.stats?.duplicateLeadsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.stats?.duplicateLeadsChange || 0)}% from last month
                                </p>
                                <button className={styles.moreInfoBtn}>Manage Duplicates</button>
                            </div>

                            {/* Junk Leads */}
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <h3>Junk Leads</h3>
                                    <span className={styles.infoTooltip} title="Prospects with no valid email and no valid phone number">ℹ️</span>
                                </div>
                                <p className={styles.statValue}>{formatNumber(dashboardData?.stats?.junkLeads || 0)}</p>
                                <p className={styles.statDescription}>
                                    No email and no phone
                                </p>
                                <p className={dashboardData?.stats?.junkLeadsChange >= 0 ? styles.statChangePositive : styles.statChangeNegative}>
                                    {dashboardData?.stats?.junkLeadsChange >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.stats?.junkLeadsChange || 0)}% from last week
                                </p>
                                <button className={styles.moreInfoBtn}>Clean Up</button>
                            </div>
                        </div>
                    )}

                    {/* Data Quality Summary */}
                    {!statsLoading && dashboardData && (
                        <div className={styles.dataQualitySummary}>
                            <h3>Data Quality Overview</h3>
                            <div className={styles.qualityMetrics}>
                                <div className={styles.qualityMetric}>
                                    <span className={styles.metricLabel}>Email Coverage:</span>
                                    <span className={styles.metricValue}>
                                        {Math.round(((dashboardData?.stats?.totalEmails || 0) / (dashboardData?.stats?.totalLeads || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className={styles.qualityMetric}>
                                    <span className={styles.metricLabel}>Phone Coverage:</span>
                                    <span className={styles.metricValue}>
                                        {Math.round(((dashboardData?.stats?.totalPhones || 0) / (dashboardData?.stats?.totalLeads || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className={styles.qualityMetric}>
                                    <span className={styles.metricLabel}>Duplicate Rate:</span>
                                    <span className={styles.metricValue}>
                                        {Math.round(((dashboardData?.stats?.duplicateLeads || 0) / (dashboardData?.stats?.totalLeads || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className={styles.qualityMetric}>
                                    <span className={styles.metricLabel}>Data Quality Score:</span>
                                    <span className={styles.metricValue}>
                                        {Math.round(
                                            ((dashboardData?.stats?.totalEmails || 0) + (dashboardData?.stats?.totalPhones || 0)) /
                                            (dashboardData?.stats?.totalLeads || 1) * 50
                                        )}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.recentActivity}>
                        <h3>Recent Activity</h3>
                        <div className={styles.activityList}>
                            {mockRecentActivity.map(activity => (
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