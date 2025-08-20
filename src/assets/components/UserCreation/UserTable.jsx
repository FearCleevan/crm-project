import React from 'react';
import { FiMoreVertical, FiEye, FiEdit } from 'react-icons/fi';
import styles from './UserCreation.module.css';
import { formatDate } from '../../../utils/dateFormatter';

const UserTable = ({
    users,
    selectedUsers,
    activeActionMenu,
    onSelectUser,
    onToggleActionMenu,
    loading
}) => {
    if (loading) {
        return (
            <div className={styles.loadingTable}>
                <div className={styles.spinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
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
                                isActiveMenu={activeActionMenu === user.user_id}
                                onSelectUser={onSelectUser}
                                onToggleActionMenu={onToggleActionMenu}
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
    );
};

const UserTableRow = ({ user, isSelected, isActiveMenu, onSelectUser, onToggleActionMenu }) => (
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
            <ActionMenu
                userId={user.user_id}
                isActive={isActiveMenu}
                onToggle={onToggleActionMenu}
            />
        </td>
    </tr>
);

const ActionMenu = ({ userId, isActive, onToggle }) => (
    <div className={styles.actions}>
        <button
            className={styles.actionButton}
            onClick={() => onToggle(userId)}
        >
            <FiMoreVertical size={16} />
        </button>
        {isActive && (
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
);

export default UserTable;