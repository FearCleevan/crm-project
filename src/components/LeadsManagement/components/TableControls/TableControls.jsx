import React from 'react';
import {
  FiSearch,
  FiUpload,
  FiDownload,
  FiSettings,
  FiUser,
  FiX,
  FiArchive,
  FiTrash2
} from 'react-icons/fi';

const TableControls = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  lookupData,
  industries,
  countries,
  statuses,
  handleImport,
  exportToCSV,
  showAddModal,
  setShowAddModal,
  handleCreateProspect,
  downloadTemplate,
  columnVisibility,
  setColumnVisibility,
  showColumnMenu,
  setShowColumnMenu,
  selectedLeads,
  showBulkActionPopup,
  setShowBulkActionPopup,
  handleBulkAction,
  styles
}) => {
  return (
    <div className={styles.controls}>
      {/* Search Section */}
      <div className={styles.searchContainer}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name, job title, company, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.controlButtons}>
        {/* Filter Section */}
        <div className={styles.filterSection}>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            {statuses.filter(s => s !== 'all').map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.industry}
            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Industries</option>
            {lookupData.industries?.map(industry => (
              <option key={industry.IndustryCode} value={industry.IndustryName}>
                {industry.IndustryName}
              </option>
            ))}
          </select>

          <select
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Countries</option>
            {countries.filter(c => c !== 'all').map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className={styles.importButton}
            onClick={() => document.getElementById('csv-import').click()}
          >
            <FiUpload size={16} />
            Import
          </button>
          <input
            type="file"
            id="csv-import"
            accept=".csv"
            onChange={handleImport}
            style={{ display: 'none' }}
          />

          <button
            className={styles.exportButton}
            onClick={() => exportToCSV()}
          >
            <FiDownload size={16} />
            Export
          </button>

          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <FiUser size={16} />
            Add Prospect
          </button>

          <button
            className={styles.addButton}
            onClick={downloadTemplate}
          >
            <FiDownload size={16} />
            Download Template
          </button>

          {/* Column Visibility Menu */}
          <div className={styles.columnMenu}>
            <button
              className={styles.settingsButton}
              onClick={() => setShowColumnMenu(!showColumnMenu)}
            >
              <FiSettings size={16} />
              Columns
            </button>

            {showColumnMenu && (
              <div className={styles.columnMenuDropdown}>
                {Object.entries(columnVisibility).map(([key, visible]) => (
                  <label key={key} className={styles.columnMenuItem}>
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => setColumnVisibility(prev => ({
                        ...prev,
                        [key]: !prev[key]
                      }))}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Popup */}
      {selectedLeads.length > 0 && (
        <div className={`${styles.bulkActionsPopup} ${showBulkActionPopup ? styles.show : ''}`}>
          <div className={styles.bulkActionsPopupContent}>
            <div className={styles.bulkActionsPopupHeader}>
              <h3>Bulk Actions ({selectedLeads.length} selected)</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowBulkActionPopup(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.bulkActionsPopupButtons}>
              <button
                className={styles.bulkActionPopupButton}
                onClick={() => handleBulkAction('export')}
              >
                <FiDownload size={16} />
                Export Selected
              </button>
              <button
                className={styles.bulkActionPopupButton}
                onClick={() => handleBulkAction('archive')}
              >
                <FiArchive size={16} />
                Archive Selected
              </button>
              <button
                className={`${styles.bulkActionPopupButton} ${styles.deleteAction}`}
                onClick={() => handleBulkAction('delete')}
              >
                <FiTrash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Bulk Actions Button */}
      {selectedLeads.length > 0 && (
        <div className={styles.bulkActionsButtonContainer}>
          <button
            className={styles.showBulkActionsButton}
            onClick={() => setShowBulkActionPopup(true)}
          >
            {selectedLeads.length} Selected - Show Actions
          </button>
        </div>
      )}
    </div>
  );
};

export default TableControls;