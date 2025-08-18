//src/assets/components/LoginPage/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Attempting login...');
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Login failed:', responseData.error);
                throw new Error(responseData.error || 'Login failed');
            }

            console.log('Login successful:', responseData.user);

            // Store auth data
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('user', JSON.stringify(responseData.user));

            // Redirect
            navigate('/dashboard');

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.logoSection}>
                    <h1 className={styles.logoText}>CRM</h1>
                    <p className={styles.tagline}>Customer Relationship Management</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <h2 className={styles.formTitle}>Sign In</h2>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.inputLabel}>Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.inputLabel}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className={styles.forgotPassword}>
                        <a href="#" className={styles.forgotLink}>Forgot password?</a>
                    </div>
                </form>

                <div className={styles.footer}>
                    <p className={styles.footerText}>Don't have an account? <a href="#" className={styles.footerLink}>Contact Admin</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;