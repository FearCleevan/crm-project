import React from 'react';
import { FiSearch, FiFilter, FiSettings } from 'react-icons/fi';
import styles from './UserCreation.module.css';

const Controls = ({
    searchTerm,
    onSearchChange,
    itemsPerPage,
    onItemsPerPageChange
}) => {
    return (
        <div className={styles.controls}>
            <div className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search users by name, email, role, or username..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
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
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className={styles.itemsPerPageSelect}
                >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                </select>
            </div>
        </div>
    );
};

export default Controls;