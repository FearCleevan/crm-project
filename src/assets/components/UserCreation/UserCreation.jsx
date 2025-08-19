// src/components/UserCreation/UserCreation.jsx
import React, { useState } from 'react';
import { FiMoreVertical, FiEye, FiEdit, FiSearch, FiFilter, FiSettings, FiPlus } from 'react-icons/fi';
import styles from './UserCreation.module.css';

// Mock data for users
const mockUsers = [
  {
    user_id: 1,
    first_name: 'John',
    middle_name: 'Michael',
    last_name: 'Doe',
    profile: '/profiles/john.jpg',
    birthday: '1985-05-15',
    phone_no: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    role: 'IT Admin',
    email: 'john.doe@example.com',
    username: 'johndoe',
    permissions: '{"users": ["read", "write"], "reports": ["read"]}',
    created_at: '2023-01-15T08:30:00Z',
    updated_at: '2023-05-20T14:25:00Z'
  },
  {
    user_id: 2,
    first_name: 'Jane',
    middle_name: 'Elizabeth',
    last_name: 'Smith',
    profile: '/profiles/jane.jpg',
    birthday: '1990-08-22',
    phone_no: '+1 (555) 987-6543',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    role: 'Data Analyst',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    permissions: '{"users": ["read"], "reports": ["read", "write"]}',
    created_at: '2023-02-10T10:15:00Z',
    updated_at: '2023-06-05T09:45:00Z'
  },
  {
    user_id: 3,
    first_name: 'Robert',
    middle_name: 'James',
    last_name: 'Johnson',
    profile: '/profiles/robert.jpg',
    birthday: '1988-12-03',
    phone_no: '+1 (555) 456-7890',
    address: '789 Pine Rd, Chicago, IL 60601',
    role: 'Data Analyst',
    email: 'robert.j@example.com',
    username: 'robertj',
    permissions: '{"reports": ["read", "write"], "dashboard": ["read"]}',
    created_at: '2023-03-05T14:20:00Z',
    updated_at: '2023-04-18T16:30:00Z'
  },
  {
    user_id: 4,
    first_name: 'Sarah',
    middle_name: 'Marie',
    last_name: 'Williams',
    profile: '/profiles/sarah.jpg',
    birthday: '1992-04-18',
    phone_no: '+1 (555) 789-0123',
    address: '321 Elm St, Houston, TX 77001',
    role: 'IT Admin',
    email: 'sarah.w@example.com',
    username: 'sarahw',
    permissions: '{"users": ["read", "write", "delete"], "reports": ["read", "write"], "settings": ["read"]}',
    created_at: '2023-04-22T11:05:00Z',
    updated_at: '2023-07-10T13:15:00Z'
  },
  {
    user_id: 5,
    first_name: 'Michael',
    middle_name: 'Thomas',
    last_name: 'Brown',
    profile: '/profiles/michael.jpg',
    birthday: '1987-07-30',
    phone_no: '+1 (555) 234-5678',
    address: '654 Cedar Ln, Phoenix, AZ 85001',
    role: 'Data Analyst',
    email: 'michael.b@example.com',
    username: 'michaelb',
    permissions: '{"reports": ["read"], "dashboard": ["read"]}',
    created_at: '2023-05-30T09:40:00Z',
    updated_at: '2023-08-12T15:20:00Z'
  }
];

const UserCreation = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className={styles.userCreation}>
      <div className={styles.header}>
        <h2>User Management</h2>
        <button className={styles.createButton}>
          <FiPlus size={16} />
          Create New User
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users..."
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
        </div>
      </div>

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
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
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
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${user.role === 'IT Admin' ? styles.admin : styles.analyst}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.phone_no}</td>
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
            ))}
          </tbody>
        </table>
      </div>

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
  );
};

export default UserCreation;