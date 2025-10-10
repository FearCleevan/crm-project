import React from 'react';
import { useProspects } from './hooks/useProspects';
import TableControls from './components/TableControls';
import ProspectsTable from './components/ProspectsTable';
import Pagination from './components/Pagination';
import ImportProcessingModal from './ImportProcessingModal';
import AddNewProspects from './Modals/AddNewProspects';
import styles from './Prospects.module.css';

const Prospects = () => {
  const {
    // State
    leads,
    loading,
    searchTerm,
    currentPage,
    itemsPerPage,
    sortConfig,
    selectedLeads,
    columnVisibility,
    showColumnMenu,
    showBulkActionPopup,
    filters,
    importProcessing,
    showAddModal,
    lookupData,
    notification,
    confirmationModal,
    
    // Handlers
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    setSortConfig,
    setSelectedLeads,
    setColumnVisibility,
    setShowColumnMenu,
    setShowBulkActionPopup,
    setFilters,
    setImportProcessing,
    setShowAddModal,
    setConfirmationModal,
    
    // API Functions
    fetchProspects,
    handleSort,
    handleSelectAll,
    handleSelectLead,
    handleBulkAction,
    handleConfirmedAction,
    exportToCSV,
    handleImport,
    handleCreateProspect,
    downloadTemplate,
    
    // Data
    filteredLeads,
    sortedLeads,
    currentLeads,
    totalPages,
    startItem,
    endItem,
    totalItems,
    industries,
    countries,
    statuses,
    getIndustryName // Make sure this is included
  } = useProspects();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className={styles.prospects}>
      {/* Controls Section */}
      <TableControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        lookupData={lookupData}
        industries={industries}
        countries={countries}
        statuses={statuses}
        handleImport={handleImport}
        exportToCSV={exportToCSV}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        handleCreateProspect={handleCreateProspect}
        downloadTemplate={downloadTemplate}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        showColumnMenu={showColumnMenu}
        setShowColumnMenu={setShowColumnMenu}
        selectedLeads={selectedLeads}
        showBulkActionPopup={showBulkActionPopup}
        setShowBulkActionPopup={setShowBulkActionPopup}
        handleBulkAction={handleBulkAction}
        styles={styles}
      />

      {/* Confirmation Modal */}
      {confirmationModal.show && (
        <div className={styles.confirmationModalOverlay}>
          <div className={styles.confirmationModal}>
            <div className={styles.confirmationModalContent}>
              <h3>Confirm Action</h3>
              <p>{confirmationModal.message}</p>
              <div className={styles.confirmationModalButtons}>
                <button
                  className={styles.confirmationCancelButton}
                  onClick={() => setConfirmationModal({ show: false, action: null, message: '', count: 0 })}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmationConfirmButton}
                  onClick={handleConfirmedAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* Table Section */}
      <ProspectsTable
        currentLeads={currentLeads}
        columnVisibility={columnVisibility}
        sortConfig={sortConfig}
        selectedLeads={selectedLeads}
        handleSort={handleSort}
        handleSelectAll={handleSelectAll}
        handleSelectLead={handleSelectLead}
        lookupData={lookupData}
        sortedLeads={sortedLeads}
        getIndustryName={getIndustryName} // Add this line
        styles={styles}
      />

      {/* Import Processing Modal */}
      {importProcessing.isOpen && (
        <ImportProcessingModal
          isOpen={importProcessing.isOpen}
          onClose={() => setImportProcessing({ isOpen: false, stats: null })}
          processingStats={importProcessing.stats}
        />
      )}

      {/* Add Prospect Modal */}
      <AddNewProspects
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateProspect}
        lookupData={lookupData}
      />

      {/* Pagination Section */}
      {sortedLeads.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          startItem={startItem}
          endItem={endItem}
          totalItems={totalItems}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          styles={styles}
        />
      )}
    </div>
  );
};

export default Prospects;