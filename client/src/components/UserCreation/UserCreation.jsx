//src/assets/components/UserCreation/UserCreation.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import UserTable from './UserTable';
import Pagination from './Pagination';
import BulkActions from './BulkActions';
import Controls from './Controls';
import UserCreateModal from '../Modals/UserCreateModal/UserCreateModal';
import styles from './UserCreation.module.css';
import useAuth from '../../hooks/useAuth';
import useUsers from '../../hooks/useUsers';
import { useUserManagement } from '../../hooks/useUserManagement';

const UserCreation = () => {
    const { user: authUser, isLoading: authLoading, logout } = useAuth();
    const { users, loading, error, refreshUsers } = useUsers();
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';

    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [showLeftToggle, setShowLeftToggle] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false); // Add this state

    const userManagement = useUserManagement(users);

    useEffect(() => {
        if (authUser) {
            refreshUsers();
        }
    }, [authUser, refreshUsers]);

    const handleLogoutClick = () => setShowLogoutModal(true);
    const handleLogoutConfirm = async () => {
        await logout();
        setShowLogoutModal(false);
    };
    const handleLogoutCancel = () => setShowLogoutModal(false);
    const handleToggleRightPanel = () => console.log('Right panel toggle disabled');

    const handleUserCreated = () => {
        refreshUsers();
    };

    if (authLoading || !authUser) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.userCreationContainer}>
            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                userName={`${authUser.firstName} ${authUser.lastName}`}
            />

            <UserCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={handleUserCreated}
            />

            <LeftPanel
                leftCollapsed={leftCollapsed}
                showLeftToggle={showLeftToggle}
                setShowLeftToggle={setShowLeftToggle}
                setLeftCollapsed={setLeftCollapsed}
            />

            <div className={`${styles.mainContentArea} ${leftCollapsed ? styles.leftCollapsed : ''}`}>
                <Header
                    user={authUser}
                    onLogoutClick={handleLogoutClick}
                    onToggleRightPanel={handleToggleRightPanel}
                    rightCollapsed={true}
                    showRightToggle={isDashboard}
                />

                <div className={styles.userCreation}>
                    <HeaderSection
                        loading={loading}
                        refreshUsers={refreshUsers}
                        onCreateUser={() => setShowCreateModal(true)} // Pass this prop
                    />

                    {error && (
                        <div className={styles.errorBanner}>
                            <span>{error}</span>
                            <button onClick={refreshUsers}>Try Again</button>
                        </div>
                    )}

                    <Controls
                        searchTerm={userManagement.searchTerm}
                        onSearchChange={userManagement.setSearchTerm}
                        itemsPerPage={userManagement.itemsPerPage}
                        onItemsPerPageChange={userManagement.handleItemsPerPageChange}
                    />

                    <UserTable
                        users={userManagement.currentUsers}
                        selectedUsers={userManagement.selectedUsers}
                        activeActionMenu={userManagement.activeActionMenu}
                        onSelectUser={userManagement.handleSelectUser}
                        onToggleActionMenu={userManagement.toggleActionMenu}
                        loading={loading}
                        refreshUsers={refreshUsers} // Add this prop
                    />

                    {userManagement.filteredUsers.length > 0 && (
                        <Pagination
                            currentPage={userManagement.currentPage}
                            totalPages={userManagement.totalPages}
                            totalItems={userManagement.filteredUsers.length}
                            itemsPerPage={userManagement.itemsPerPage}
                            onPageChange={userManagement.handlePageChange}
                        />
                    )}

                    <BulkActions
                        selectedCount={userManagement.selectedUsers.length}
                        onBulkEdit={() => console.log('Bulk edit')}
                        onBulkDelete={() => console.log('Bulk delete')}
                    />
                </div>
            </div>
        </div>
    );
};

const LeftPanel = ({ leftCollapsed, showLeftToggle, setShowLeftToggle, setLeftCollapsed }) => (
    <div
        className={`${styles.leftPanel} ${leftCollapsed ? styles.collapsed : ''}`}
        onMouseEnter={() => setShowLeftToggle(true)}
        onMouseLeave={() => setShowLeftToggle(false)}
    >
        <LeftDashboard collapsed={leftCollapsed} />
        <CollapseButton
            leftCollapsed={leftCollapsed}
            showLeftToggle={showLeftToggle}
            setLeftCollapsed={setLeftCollapsed}
            setShowLeftToggle={setShowLeftToggle}
        />
    </div>
);

const CollapseButton = ({ leftCollapsed, showLeftToggle, setLeftCollapsed, setShowLeftToggle }) => (
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
);

const HeaderSection = ({ loading, refreshUsers, onCreateUser }) => (
    <div className={styles.header}>
        <h2>User Management</h2>
        <div className={styles.headerActions}>
            <button className={styles.refreshButton} onClick={refreshUsers} disabled={loading}>
                <FiRefreshCw size={16} className={loading ? styles.spinning : ''} />
                Refresh
            </button>
            <button className={styles.createButton} onClick={onCreateUser}>
                <FiPlus size={16} />
                Create New User
            </button>
        </div>
    </div>
);

export default UserCreation;