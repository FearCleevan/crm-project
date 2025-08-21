// src/components/Permissions/Permissions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiFilter, FiSettings, FiEdit, FiTrash2, FiChevronUp, FiChevronDown, FiCheck, FiX } from 'react-icons/fi';
import styles from './Permissions.module.css';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch permissions data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // console.log('Fetching with token:', token);

        // Fetch users with permissions
        const usersResponse = await fetch('http://localhost:5001/api/permissions/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // console.log('Users response status:', usersResponse.status);

        if (!usersResponse.ok) {
          const errorText = await usersResponse.text();
          console.error('Users response error text:', errorText);
          throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
        }

        const usersData = await usersResponse.json();
        // console.log('Users data received:', usersData);

        // Fetch available roles
        const rolesResponse = await fetch('http://localhost:5001/api/permissions/roles', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // console.log('Roles response status:', rolesResponse.status);

        if (!rolesResponse.ok) {
          const errorText = await rolesResponse.text();
          console.error('Roles response error text:', errorText);
          throw new Error(`Failed to fetch roles: ${rolesResponse.status} ${usersResponse.statusText}`);
        }

        const rolesData = await rolesResponse.json();
        // console.log('Roles data received:', rolesData);

        setPermissions(usersData.users);
        setRoles(rolesData.roles);

      } catch (error) {
        console.error('Failed to fetch permissions data:', error);
        alert(`Error: ${error.message}. Using mock data for demonstration.`);
        // Fallback to mock data
        setPermissions(mockPermissionsData);
        setRoles([
          { id: 1, name: 'IT Admin', description: 'Full system access', isSystemRole: true },
          { id: 2, name: 'Data Analyst', description: 'Basic access', isSystemRole: true },
          { id: 3, name: 'Sales Manager', description: 'Sales team management', isSystemRole: false },
          { id: 4, name: 'Marketing Specialist', description: 'Marketing tools access', isSystemRole: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return permissions;

    return permissions.filter(user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.roles && user.roles.some(role =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (user.permissions && user.permissions.some(permission =>
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }, [permissions, searchTerm]);

  // Sort users
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Get current users for pagination
  const currentUsers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage, sortedUsers]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  // Handle sort request
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle modify roles
  const handleModifyRoles = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setShowRoleModal(true);
  };

  // Handle role selection
  const handleRoleSelection = (roleName, isSelected) => {
    if (isSelected) {
      setSelectedRoles(prev => [...prev, roleName]);
    } else {
      setSelectedRoles(prev => prev.filter(role => role !== roleName));
    }
  };

  // Save role changes
  const saveRoleChanges = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      // Convert role names to role IDs
      const roleIds = roles
        .filter(role => selectedRoles.includes(role.name))
        .map(role => role.id);

      const response = await fetch(`http://localhost:5001/api/permissions/users/${selectedUser.id}/roles`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleIds })
      });

      if (!response.ok) throw new Error('Failed to update user roles');

      // Update local state
      setPermissions(prev => prev.map(user =>
        user.id === selectedUser.id
          ? { ...user, roles: selectedRoles }
          : user
      ));

      setShowRoleModal(false);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);

    } catch (error) {
      console.error('Error updating user roles:', error);
      alert('Failed to update user roles. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle remove user
  const handleRemoveUser = (userId) => {
    // console.log('Remove user:', userId);
    // This would show a confirmation modal and then call an API to remove the user
  };

  if (loading) {
    return (
      <div className={styles.loadingTable}>
        <div className={styles.spinner}></div>
        <p>Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className={styles.permissions}>
      <div className={styles.header}>
        <h3>Permissions Management</h3>
        <p>Manage user permissions and access levels</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name, email, or permissions..."
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
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className={styles.itemsPerPageSelect}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.permissionsTable}>
          <thead>
            <tr>
              <th
                className={styles.sortableHeader}
                onClick={() => handleSort('firstName')}
              >
                <div className={styles.headerContent}>
                  <span>Name</span>
                  {sortConfig.key === 'firstName' && (
                    sortConfig.direction === 'ascending' ?
                      <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                  )}
                </div>
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => handleSort('lastLogin')}
              >
                <div className={styles.headerContent}>
                  <span>Last Login</span>
                  {sortConfig.key === 'lastLogin' && (
                    sortConfig.direction === 'ascending' ?
                      <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                  )}
                </div>
              </th>
              <th>User Roles</th>
              <th>User Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                      </div>
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className={styles.userEmail}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.lastLogin}>
                      {formatDate(user.lastLogin)}
                    </div>
                  </td>
                  <td>
                    <div className={styles.rolesList}>
                      {user.roles && user.roles.map(role => (
                        <span key={role} className={styles.roleBadge}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className={styles.permissionsList}>
                      {user.permissions && user.permissions.slice(0, 3).map(permission => (
                        <span key={permission} className={styles.permissionBadge}>
                          {permission.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {user.permissions && user.permissions.length > 3 && (
                        <span className={styles.moreBadge}>
                          +{user.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleModifyRoles(user)}
                        title="Modify Roles"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleRemoveUser(user.id)}
                        title="Remove User"
                        disabled={user.roles && user.roles.includes('IT Admin')}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Assign Roles to {selectedUser.firstName} {selectedUser.lastName}</h3>
              <button className={styles.closeButton} onClick={() => setShowRoleModal(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.userInfoModal}>
                <div className={styles.avatarModal}>
                  {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                </div>
                <div>
                  <div className={styles.userNameModal}>{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className={styles.userEmailModal}>{selectedUser.email}</div>
                </div>
              </div>

              <div className={styles.rolesSection}>
                <h4>Available Roles</h4>
                <div className={styles.rolesListModal}>
                  {roles.map(role => (
                    <div key={role.id} className={styles.roleItem}>
                      <label className={styles.roleCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.name)}
                          onChange={(e) => handleRoleSelection(role.name, e.target.checked)}
                          disabled={role.isSystemRole && !selectedUser.roles.includes(role.name)}
                        />
                        <span className={styles.checkmark}></span>
                        <div className={styles.roleInfo}>
                          <div className={styles.roleName}>{role.name}</div>
                          <div className={styles.roleDescription}>{role.description}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={saveRoleChanges}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Message */}
      {showConfirmation && (
        <div className={styles.confirmationMessage}>
          <FiCheck size={20} />
          <span>User roles updated successfully!</span>
        </div>
      )}
    </div>
  );
};

// Mock data fallback
const mockPermissionsData = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    lastLogin: '2023-10-15T14:30:25Z',
    roles: ['IT Admin'],
    permissions: ['dashboard_view', 'leads_view', 'leads_create', 'leads_edit', 'leads_delete']
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    lastLogin: '2023-10-14T09:15:42Z',
    roles: ['Data Analyst'],
    permissions: ['dashboard_view', 'leads_view', 'contacts_view']
  }
];

export default Permissions;