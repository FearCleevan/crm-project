// src/components/Permissions/Permissions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiFilter, FiSettings, FiEdit, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import styles from './Permissions.module.css';

// Mock data for permissions - backend ready structure
const mockPermissionsData = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: 'JD',
    status: 'online',
    lastLogin: '2023-10-15T14:30:25Z',
    permissions: ['Dashboard', 'Leads Management', 'User Management', 'Reports']
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    avatar: 'JS',
    status: 'offline',
    lastLogin: '2023-10-14T09:15:42Z',
    permissions: ['Dashboard', 'Contacts', 'Calendar', 'Tasks']
  },
  {
    id: 3,
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@example.com',
    avatar: 'RJ',
    status: 'online',
    lastLogin: '2023-10-16T11:20:33Z',
    permissions: ['Dashboard', 'Leads Management', 'Deals', 'Analytics']
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@example.com',
    avatar: 'SW',
    status: 'offline',
    lastLogin: '2023-10-13T16:45:19Z',
    permissions: ['Dashboard', 'Email', 'Reports', 'Settings']
  },
  {
    id: 5,
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@example.com',
    avatar: 'MB',
    status: 'online',
    lastLogin: '2023-10-16T08:55:07Z',
    permissions: ['Dashboard', 'Leads Management', 'User Management', 'Permissions']
  },
  {
    id: 6,
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.d@example.com',
    avatar: 'ED',
    status: 'offline',
    lastLogin: '2023-10-12T13:10:54Z',
    permissions: ['Dashboard', 'Contacts', 'Calendar', 'Tasks', 'Email']
  },
  {
    id: 7,
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.w@example.com',
    avatar: 'DW',
    status: 'online',
    lastLogin: '2023-10-15T17:35:28Z',
    permissions: ['Dashboard', 'Deals', 'Analytics', 'Reports']
  },
  {
    id: 8,
    firstName: 'Lisa',
    lastName: 'Taylor',
    email: 'lisa.t@example.com',
    avatar: 'LT',
    status: 'offline',
    lastLogin: '2023-10-11T10:25:37Z',
    permissions: ['Dashboard', 'Leads Management', 'Contacts']
  },
  {
    id: 9,
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.a@example.com',
    avatar: 'JA',
    status: 'online',
    lastLogin: '2023-10-16T09:40:12Z',
    permissions: ['Dashboard', 'User Management', 'Permissions', 'Settings']
  },
  {
    id: 10,
    firstName: 'Karen',
    lastName: 'Thomas',
    email: 'karen.t@example.com',
    avatar: 'KT',
    status: 'offline',
    lastLogin: '2023-10-10T15:20:45Z',
    permissions: ['Dashboard', 'Calendar', 'Tasks', 'Email']
  }
];

// All available permissions for reference
const allAvailablePermissions = [
  'Dashboard', 'Leads Management', 'Contacts', 'Accounts', 'Deals', 
  'Calendar', 'Tasks', 'Email', 'Analytics', 'Reports', 
  'User Management', 'Permissions', 'Settings'
];

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  // Fetch permissions data (simulating API call)
  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPermissions(mockPermissionsData);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermissions();
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return permissions;
    
    return permissions.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.permissions.some(permission => 
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Format date for display
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

  // Handle modify roles (placeholder for backend integration)
  const handleModifyRoles = (userId) => {
    console.log('Modify roles for user:', userId);
    // This would open a modal or navigate to a role modification page
  };

  // Handle remove user (placeholder for backend integration)
  const handleRemoveUser = (userId) => {
    console.log('Remove user:', userId);
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
                          {user.avatar}
                        </div>
                        <div className={`${styles.statusIndicator} ${styles[user.status]}`}></div>
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
                    <div className={styles.permissionsList}>
                      {user.permissions.map(permission => (
                        <span key={permission} className={styles.permissionBadge}>
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleModifyRoles(user.id)}
                        title="Modify Roles"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleRemoveUser(user.id)}
                        title="Remove User"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
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
    </div>
  );
};

export default Permissions;