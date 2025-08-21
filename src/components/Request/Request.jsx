// src/components/Request/Request.jsx
import React, { useState, useEffect } from 'react';
import { FiEye, FiCheck, FiX, FiMail, FiRefreshCw } from 'react-icons/fi';
import styles from './Request.module.css';

const Request = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [filter, setFilter] = useState('all');

    // the useEffect hook in Request.jsx to fetch from database
    useEffect(() => {
        const loadRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/requests?filter=${filter}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }

                const data = await response.json();
                setRequests(data.requests);
            } catch (error) {
                console.error('Error loading requests:', error);
                // Fallback to localStorage if API fails
                const storedRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
                setRequests(storedRequests);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();

        // Set up interval to check for new requests
        const interval = setInterval(loadRequests, 10000);
        return () => clearInterval(interval);
    }, [filter]);

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        if (filter === 'pending') return request.status === 'pending';
        if (filter === 'completed') return request.status === 'completed';
        return true;
    });

    const handleAction = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setShowActionModal(true);

        if (type === 'password_reset') {
            // Generate a random password for demo purposes
            setNewPassword(Math.random().toString(36).slice(-8));
        }
    };

    // the confirmAction function to use database
    const confirmAction = async () => {
        if (!selectedRequest) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/requests/${selectedRequest.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'completed',
                    adminNotes: actionType === 'password_reset' ? 'Password reset completed' : 'Account created',
                    newPassword: actionType === 'password_reset' ? newPassword : null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update request');
            }

            // Update local state
            const updatedRequests = requests.map(req => {
                if (req.id === selectedRequest.id) {
                    return {
                        ...req,
                        status: 'completed',
                        completedAt: new Date().toISOString(),
                        action: actionType
                    };
                }
                return req;
            });

            setRequests(updatedRequests);
            setShowActionModal(false);
            setSelectedRequest(null);
            setActionType('');
            setNewPassword('');
        } catch (error) {
            console.error('Error updating request:', error);
            // Fallback to localStorage if API fails
            const updatedRequests = requests.map(req => {
                if (req.id === selectedRequest.id) {
                    const updatedRequest = {
                        ...req,
                        status: 'completed',
                        completedAt: new Date().toISOString(),
                        action: actionType
                    };

                    if (actionType === 'password_reset') {
                        updatedRequest.newPassword = newPassword;
                        updatedRequest.message = 'Password has been reset';
                    } else if (actionType === 'account_created') {
                        updatedRequest.message = 'Account has been created';
                    }

                    return updatedRequest;
                }
                return req;
            });

            setRequests(updatedRequests);
            localStorage.setItem('userRequests', JSON.stringify(updatedRequests));
            setShowActionModal(false);
            setSelectedRequest(null);
            setActionType('');
            setNewPassword('');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const refreshRequests = () => {
        setLoading(true);
        const storedRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
        setRequests(storedRequests);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className={styles.loadingTable}>
                <div className={styles.spinner}></div>
                <p>Loading requests...</p>
            </div>
        );
    }

    return (
        <div className={styles.request}>
            <div className={styles.header}>
                <h3>Request Management</h3>
                <p>Manage user account and password reset requests</p>
            </div>

            <div className={styles.controls}>
                <div className={styles.filterButtons}>
                    <button
                        className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Requests
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                </div>

                <button className={styles.refreshButton} onClick={refreshRequests}>
                    <FiRefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.requestsTable}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Type</th>
                            <th>Submitted</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map(request => (
                                <tr key={request.id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.userDetails}>
                                                <div className={styles.userName}>
                                                    {request.firstName} {request.lastName}
                                                </div>
                                                <div className={styles.userEmail}>
                                                    {request.email}
                                                </div>
                                                <div className={styles.userUsername}>
                                                    @{request.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.typeBadge} ${request.type === 'password_reset'
                                            ? styles.passwordReset
                                            : styles.accountCreation
                                            }`}>
                                            {request.type === 'password_reset' ? 'Password Reset' : 'Account Creation'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.date}>
                                            {formatDate(request.submittedAt)}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${request.status === 'pending'
                                            ? styles.pending
                                            : styles.completed
                                            }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {request.status === 'pending' && (
                                                <>
                                                    {request.type === 'password_reset' && (
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleAction(request, 'password_reset')}
                                                            title="Reset Password"
                                                        >
                                                            <FiCheck size={16} />
                                                        </button>
                                                    )}
                                                    {request.type === 'account_creation' && (
                                                        <button
                                                            className={styles.actionButton}
                                                            onClick={() => handleAction(request, 'account_created')}
                                                            title="Create Account"
                                                        >
                                                            <FiCheck size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowActionModal(true);
                                                }}
                                                title="View Details"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.noData}>
                                    No requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showActionModal && (
                <ActionModal
                    request={selectedRequest}
                    actionType={actionType}
                    newPassword={newPassword}
                    onClose={() => {
                        setShowActionModal(false);
                        setSelectedRequest(null);
                        setActionType('');
                        setNewPassword('');
                    }}
                    onConfirm={confirmAction}
                />
            )}
        </div>
    );
};

const ActionModal = ({ request, actionType, newPassword, onClose, onConfirm }) => {
    if (!request) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>
                        {actionType ?
                            (actionType === 'password_reset' ? 'Reset Password' : 'Create Account')
                            : 'Request Details'
                        }
                    </h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.requestDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>User:</span>
                            <span className={styles.detailValue}>
                                {request.firstName} {request.lastName}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Email:</span>
                            <span className={styles.detailValue}>{request.email}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Username:</span>
                            <span className={styles.detailValue}>{request.username}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Type:</span>
                            <span className={styles.detailValue}>
                                {request.type === 'password_reset' ? 'Password Reset' : 'Account Creation'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Submitted:</span>
                            <span className={styles.detailValue}>
                                {new Date(request.submittedAt).toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Status:</span>
                            <span className={`${styles.detailValue} ${request.status === 'pending' ? styles.statusPending : styles.statusCompleted
                                }`}>
                                {request.status}
                            </span>
                        </div>
                    </div>

                    {actionType === 'password_reset' && (
                        <div className={styles.passwordSection}>
                            <label className={styles.inputLabel}>New Password</label>
                            <input
                                type="text"
                                value={newPassword}
                                readOnly
                                className={styles.passwordInput}
                            />
                            <p className={styles.passwordNote}>
                                This password will be sent to the user's email address.
                            </p>
                        </div>
                    )}

                    {actionType === 'account_created' && (
                        <div className={styles.accountSection}>
                            <p className={styles.confirmationText}>
                                Confirm that you want to create an account for this user.
                                Login credentials will be sent to their email address.
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    {actionType && (
                        <button className={styles.confirmButton} onClick={onConfirm}>
                            {actionType === 'password_reset' ? 'Reset Password' : 'Create Account'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Request;