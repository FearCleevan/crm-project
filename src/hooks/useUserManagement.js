import { useState, useCallback } from 'react';
import { filterUsers } from '../utils/userFilter';


export const useUserManagement = (users) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    const filteredUsers = filterUsers(users, searchTerm);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleSelectUser = useCallback((userId, isSelected) => {
        if (userId === 'all') {
            setSelectedUsers(isSelected ? currentUsers.map(user => user.user_id) : []);
        } else {
            setSelectedUsers(prev => 
                isSelected 
                    ? [...prev, userId]
                    : prev.filter(id => id !== userId)
            );
        }
    }, [currentUsers]);

    const toggleActionMenu = useCallback((userId) => {
        setActiveActionMenu(prev => prev === userId ? null : userId);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        selectedUsers,
        currentPage,
        itemsPerPage,
        activeActionMenu,
        filteredUsers,
        currentUsers,
        totalPages,
        handleSelectUser,
        toggleActionMenu,
        handlePageChange,
        handleItemsPerPageChange
    };
};