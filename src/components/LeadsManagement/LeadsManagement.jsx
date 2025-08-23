// src/components/LeadsManagement/LeadsManagement.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import LeftDashboard from '../LeftDashboard/LeftDashboard';
import LogoutConfirmationModal from '../UserCreation/LogoutConfirmationModal';
import Prospects from './Prospects';
import useAuth from '../../hooks/useAuth';
import styles from './LeadsManagement.module.css';

const LeadsManagement = () => {
    const { user: authUser, isLoading: authLoading, logout } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('prospects');
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
        <div className={styles.leadsManagementContainer}>
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

                <div className={styles.leadsManagementContent}>
                    <HeaderSection />
                    
                    <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    <div className={styles.tabContent}>
                        {activeTab === 'prospects' && <Prospects />}
                        {activeTab === 'converted' && <ConvertedLeads />}
                        {activeTab === 'archived' && <ArchivedLeads />}
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
        <h2>Leads Management</h2>
        <p>Manage and track your sales prospects and leads</p>
    </div>
);

const TabNavigation = ({ activeTab, setActiveTab }) => (
    <div className={styles.tabNavigation}>
        <button 
            className={`${styles.tab} ${activeTab === 'prospects' ? styles.active : ''}`}
            onClick={() => setActiveTab('prospects')}
        >
            Prospects
        </button>
        <button 
            className={`${styles.tab} ${activeTab === 'converted' ? styles.active : ''}`}
            onClick={() => setActiveTab('converted')}
        >
            Converted
        </button>
        <button 
            className={`${styles.tab} ${activeTab === 'archived' ? styles.active : ''}`}
            onClick={() => setActiveTab('archived')}
        >
            Archived
        </button>
    </div>
);

// Placeholder components for other tabs
const ConvertedLeads = () => (
    <div className={styles.placeholderTab}>
        <h3>Converted Leads</h3>
        <p>This section will display leads that have been converted to customers.</p>
    </div>
);

const ArchivedLeads = () => (
    <div className={styles.placeholderTab}>
        <h3>Archived Leads</h3>
        <p>This section will display archived or inactive leads.</p>
    </div>
);

export default LeadsManagement;