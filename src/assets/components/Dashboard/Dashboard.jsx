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
                const storedUser = localStorage.getItem('user');

                if (!token || !storedUser) {
                    throw new Error('No authentication data');
                }

                // Show stored user immediately while verifying
                setUser(JSON.parse(storedUser));

                const response = await fetch('/api/auth/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Protected route error:', data);
                    throw new Error(data.error || 'Failed to verify session');
                }

                // Update with fresh user data if needed
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            } catch (err) {
                console.error('Authentication error:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login', { state: { error: err.message } });
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