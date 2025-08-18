//src/assets/components/Dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch('/api/auth/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Not authenticated');
                }

                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            });
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    if (!user) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.logo}>CRM Dashboard</h1>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                        <span className={styles.userRole}>{user.role}</span>
                    </div>
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
    );
};

export default Dashboard;