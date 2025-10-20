// Update UserTable.jsx to use separate modals
import React, { useState } from 'react';
import { FiEye, FiEdit } from 'react-icons/fi';
import styles from './UserCreation.module.css';
import { formatDate } from '../../utils/dateFormatter';
import ViewUserModal from '../Modals/ViewUserModal/ViewUserModal';
import UserEditModal from '../Modals/UserEditModal/UserEditModal';

const UserTable = ({
    users,
    selectedUsers,
    onSelectUser,
    loading,
    refreshUsers
}) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleUserUpdated = () => {
        refreshUsers();
        setIsEditModalOpen(false);
    };

    const handleEditFromView = () => {
        setIsViewModalOpen(false);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className={styles.loadingTable}>
                <div className={styles.spinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <>
            <ViewUserModal
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                user={selectedUser}
                onEdit={handleEditFromView}
            />

            <UserEditModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                user={selectedUser}
                onUserUpdated={handleUserUpdated}
            />

            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={(e) => onSelectUser('all', e.target.checked)}
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
                        {users.length > 0 ? (
                            users.map(user => (
                                <UserTableRow
                                    key={user.user_id}
                                    user={user}
                                    isSelected={selectedUsers.includes(user.user_id)}
                                    onSelectUser={onSelectUser}
                                    onViewUser={handleViewUser}
                                    onEditUser={handleEditUser}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className={styles.noData}>
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const UserTableRow = ({ user, isSelected, onSelectUser, onViewUser, onEditUser }) => (
    <tr className={styles.tableRow}>
        <td>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectUser(user.user_id, !isSelected)}
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
            <div className={styles.actionButtons}>
                <button 
                    className={styles.actionButton}
                    onClick={() => onViewUser(user)}
                    title="View user"
                >
                    <FiEye size={16} />
                </button>
                <button 
                    className={styles.actionButton}
                    onClick={() => onEditUser(user)}
                    title="Edit user"
                >
                    <FiEdit size={16} />
                </button>
            </div>
        </td>
    </tr>
);

export default UserTable;