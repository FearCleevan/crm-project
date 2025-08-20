// src/components/PermissionAndRequest/PermissionAndRequest.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import LogoutConfirmationModal from '../UserCreation/LogoutConfirmationModal';
import Permissions from '../Permissions/Permissions';
import Request from '../Request/Request';
import useAuth from '../../hooks/useAuth';
import styles from './PermissionAndRequest.module.css';

const PermissionAndRequest = () => {
    const { user: authUser, isLoading: authLoading, logout } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('permissions');
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => setShowLogoutModal(true);
    const handleLogoutConfirm = async () => {
        await logout();
        setShowLogoutModal(false);
    };
    const handleLogoutCancel = () => setShowLogoutModal(false);

    if (authLoading || !authUser) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.permissionRequestContainer}>
            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                userName={`${authUser.firstName} ${authUser.lastName}`}
            />

            <LeftPanel leftCollapsed={leftCollapsed} setLeftCollapsed={setLeftCollapsed} />

            <div className={`${styles.mainContentArea} ${leftCollapsed ? styles.leftCollapsed : ''}`}>
                <Header
                    user={authUser}
                    onLogoutClick={handleLogoutClick}
                    onToggleRightPanel={() => {}}
                    rightCollapsed={true}
                    showRightToggle={false}
                />

                <div className={styles.permissionRequestContent}>
                    <HeaderSection />
                    
                    <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    <div className={styles.tabContent}>
                        {activeTab === 'permissions' ? <Permissions /> : <Request />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeftPanel = ({ leftCollapsed, setLeftCollapsed }) => {
    const [showLeftToggle, setShowLeftToggle] = useState(false);
    
    return (
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
};

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

const HeaderSection = () => (
    <div className={styles.header}>
        <h2>Permissions & Requests</h2>
    </div>
);

const TabNavigation = ({ activeTab, setActiveTab }) => (
    <div className={styles.tabNavigation}>
        <button 
            className={`${styles.tab} ${activeTab === 'permissions' ? styles.active : ''}`}
            onClick={() => setActiveTab('permissions')}
        >
            Permissions
        </button>
        <button 
            className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
            onClick={() => setActiveTab('requests')}
        >
            Requests
        </button>
    </div>
);

export default PermissionAndRequest;