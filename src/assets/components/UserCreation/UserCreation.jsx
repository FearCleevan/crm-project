import React, { useState, useEffect } from 'react';
import { FiMoreVertical, FiEye, FiEdit, FiSearch, FiFilter, FiSettings, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import styles from './UserCreation.module.css';
import useAuth from '../../../hooks/useAuth';

const UserCreation = () => {
    const { user: authUser, isLoading: authLoading, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [showLeftToggle, setShowLeftToggle] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';

    // Fetch users from the database
    useEffect(() => {
        // In your UserCreation component
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:5001/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Check if response is HTML (indicating a 404 page)
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('text/html') !== -1) {
                    throw new Error('Server route not found. Please check if the server is running correctly.');
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Server error: ${response.status}`);
                }

                const data = await response.json();
                setUsers(data.users);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (authUser) {
            fetchUsers();
        }
    }, [authUser]);

    // Refresh users data
    const refreshUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5001/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
            setError(null);
        } catch (err) {
            console.error('Error refreshing users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Handle checkbox selection
    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedUsers.length === currentUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentUsers.map(user => user.user_id));
        }
    };

    // Toggle action menu
    const toggleActionMenu = (userId) => {
        if (activeActionMenu === userId) {
            setActiveActionMenu(null);
        } else {
            setActiveActionMenu(userId);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle logout
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

    // Handle right panel toggle (disabled for this component)
    const handleToggleRightPanel = () => {
        console.log('Right panel toggle is disabled on this page');
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

    if (authLoading || !authUser) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.userCreationContainer}>
            {/* Logout Confirmation Modal */}
            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                userName={`${authUser.firstName} ${authUser.lastName}`}
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
            <div className={`${styles.mainContentArea} ${leftCollapsed ? styles.leftCollapsed : ''}`}>
                {/* Header Component */}
                <Header
                    user={authUser}
                    onLogoutClick={handleLogoutClick}
                    onToggleRightPanel={handleToggleRightPanel}
                    rightCollapsed={true}
                    showRightToggle={isDashboard}
                />

                <div className={styles.userCreation}>
                    <div className={styles.header}>
                        <h2>User Management</h2>
                        <div className={styles.headerActions}>
                            <button className={styles.refreshButton} onClick={refreshUsers} disabled={loading}>
                                <FiRefreshCw size={16} className={loading ? styles.spinning : ''} />
                                Refresh
                            </button>
                            <button className={styles.createButton}>
                                <FiPlus size={16} />
                                Create New User
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorBanner}>
                            <span>{error}</span>
                            <button onClick={refreshUsers}>Try Again</button>
                        </div>
                    )}

                    <div className={styles.controls}>
                        <div className={styles.searchContainer}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search users by name, email, role, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        <div className={styles.controlButtons}>
                            <button className={styles.filterButton}>
                                <FiFilter size={16} />
                                Filter
                            </button>
                            <button className={styles.settingsButton}>
                                <FiSettings size={16} />
                                Columns
                            </button>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className={styles.itemsPerPageSelect}
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingTable}>
                            <div className={styles.spinner}></div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableContainer}>
                                <table className={styles.usersTable}>
                                    <thead>
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                                    onChange={handleSelectAll}
                                                    className={styles.checkbox}
                                                />
                                            </th>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Phone</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.length > 0 ? (
                                            currentUsers.map(user => (
                                                <tr key={user.user_id} className={styles.tableRow}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.user_id)}
                                                            onChange={() => handleSelectUser(user.user_id)}
                                                            className={styles.checkbox}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className={styles.userInfo}>
                                                            <div className={styles.avatar}>
                                                                {user.first_name[0]}{user.last_name[0]}
                                                            </div>
                                                            <div className={styles.name}>
                                                                {user.first_name} {user.middle_name && `${user.middle_name} `}{user.last_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`${styles.roleBadge} ${user.role === 'IT Admin' ? styles.admin : styles.analyst}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>{user.phone_no || 'N/A'}</td>
                                                    <td>{formatDate(user.created_at)}</td>
                                                    <td>
                                                        <div className={styles.actions}>
                                                            <button
                                                                className={styles.actionButton}
                                                                onClick={() => toggleActionMenu(user.user_id)}
                                                            >
                                                                <FiMoreVertical size={16} />
                                                            </button>
                                                            {activeActionMenu === user.user_id && (
                                                                <div className={styles.actionMenu}>
                                                                    <button className={styles.menuItem}>
                                                                        <FiEye size={14} />
                                                                        View
                                                                    </button>
                                                                    <button className={styles.menuItem}>
                                                                        <FiEdit size={14} />
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className={styles.noData}>
                                                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length > 0 && (
                                <div className={styles.pagination}>
                                    <div className={styles.paginationInfo}>
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
                                    </div>
                                    <div className={styles.paginationControls}>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={styles.paginationButton}
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={styles.paginationButton}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {selectedUsers.length > 0 && (
                        <div className={styles.bulkActions}>
                            <div className={styles.bulkActionsContent}>
                                <span>{selectedUsers.length} user(s) selected</span>
                                <div className={styles.bulkButtons}>
                                    <button className={styles.bulkButton}>Edit</button>
                                    <button className={styles.bulkButton}>Delete</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCreation;