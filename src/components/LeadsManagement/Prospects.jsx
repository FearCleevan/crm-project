import React, { useState, useEffect, useMemo } from 'react';
import {
    FiSearch,
    FiFilter,
    FiSettings,
    FiDownload,
    FiUpload,
    FiMoreVertical,
    FiChevronUp,
    FiChevronDown,
    FiEye,
    FiEdit,
    FiTrash2,
    FiArchive,
    FiUser,
    FiX
} from 'react-icons/fi';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';
import AddNewProspects from './Modals/AddNewProspects';
import styles from './Prospects.module.css';

const Prospects = () => {
    // State management
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({
        fullname: true,
        jobtitle: true,
        company: true,
        email: true,
        companyphonenumber: true,
        city: true,
        state: true,
        country: true,
        industry: true,
        employeesize: true,
        department: true,
        seniority: true,
        status: true,
        createdon: true,
        actions: true
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showBulkActionPopup, setShowBulkActionPopup] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        industry: 'all',
        country: 'all'
    });

    // Add these state variables
    const [showAddModal, setShowAddModal] = useState(false);
    const [lookupData, setLookupData] = useState({
        dispositions: [],
        emailStatuses: [],
        providers: [],
        industries: [],
        countries: [],
        statuses: []
    });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Add this to your state variables
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        action: null,
        message: '',
        count: 0
    });

    // Fetch prospects from API
    const fetchProspects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching prospects with token:', token ? 'Token exists' : 'No token');

            const response = await fetch(`/api/prospects?page=${currentPage}&limit=${itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                // Try to get the error message from the response
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If we can't parse JSON, use the status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Received data:', data);

            if (data.success) {
                setLeads(data.prospects || []);
            } else {
                throw new Error(data.error || 'Failed to fetch prospects');
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            showNotification('Failed to load prospects: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch lookup data
    const fetchLookupData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/prospects/lookup/data', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setLookupData(data.data);
            } else {
                throw new Error(data.error || 'Failed to fetch lookup data');
            }
        } catch (error) {
            console.error('Error fetching lookup data:', error);
            showNotification('Failed to load dropdown data: ' + error.message, 'error');
        }
    };

    useEffect(() => {
        fetchLookupData();
        fetchProspects();
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        // Reset to first page when filters or search term change
        setCurrentPage(1);
    }, [searchTerm, filters.status, filters.industry, filters.country]);

    // In the useMemo for filteredLeads, update the industry filter condition:
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = searchTerm === '' ||
                (lead.Fullname && lead.Fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Jobtitle && lead.Jobtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Company && lead.Company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Email && lead.Email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filters.status === 'all' || lead.Status === filters.status;
            // Change from lead.Industry to lead.Industry (assuming your lead data uses IndustryCode)
            const matchesIndustry = filters.industry === 'all' || lead.Industry === filters.industry;
            const matchesCountry = filters.country === 'all' || lead.Country === filters.country;

            return matchesSearch && matchesStatus && matchesIndustry && matchesCountry;
        });
    }, [leads, searchTerm, filters]);

    const getIndustryName = (industryCode) => {
        const industry = lookupData.industries?.find(ind => ind.IndustryCode === industryCode);
        return industry ? industry.IndustryName : industryCode;
    };

    // Sort leads
    const sortedLeads = useMemo(() => {
        if (!sortConfig.key) return filteredLeads;

        return [...filteredLeads].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredLeads, sortConfig]);

    // Pagination
    const currentLeads = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedLeads.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, itemsPerPage, sortedLeads]);

    const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);

    // Handlers
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedLeads(currentLeads.map(lead => lead.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectLead = (leadId) => {
        setSelectedLeads(prev =>
            prev.includes(leadId)
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
        );
    };

    const handleBulkAction = async (action) => {
        switch (action) {
            case 'export':
                exportToCSV(selectedLeads);
                break;
            case 'delete':
                setConfirmationModal({
                    show: true,
                    action: 'delete',
                    message: `Are you sure you want to delete ${selectedLeads.length} leads?`,
                    count: selectedLeads.length
                });
                break;
            case 'archive':
                // Implement archive functionality if needed
                showNotification('Archive functionality not implemented yet', 'info');
                break;
            default:
                break;
        }
        setShowBulkActionPopup(false);
    };

    // Add this function to handle the confirmed action
    const handleConfirmedAction = async () => {
        if (confirmationModal.action === 'delete') {
            try {
                const response = await fetch('/api/prospects/bulk-delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ ids: selectedLeads })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(`${data.message}`, 'success');
                    fetchProspects(); // Refresh the list
                    setSelectedLeads([]);
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                console.error('Bulk delete error:', error);
                showNotification('Failed to delete prospects', 'error');
            }
        }

        setConfirmationModal({ show: false, action: null, message: '', count: 0 });
    };

    // Update the exportToCSV function to use the backend
    const exportToCSV = async (leadIds = []) => {
        try {
            const token = localStorage.getItem('token');
            const url = leadIds.length > 0
                ? `/api/prospects/export/csv?ids=${leadIds.join(',')}`
                : '/api/prospects/export/csv';

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `prospects_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                showNotification(`Exported ${leadIds.length || filteredLeads.length} prospects successfully`, 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            showNotification(error.message || 'Failed to export prospects', 'error');
        }
    };

    // Update the handleImport function in Prospects.js
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/prospects/import/csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showNotification(`Successfully imported ${data.importedCount} prospects`, 'success');
                if (data.errors && data.errors.length > 0) {
                    // Show detailed errors
                    console.error('Import errors:', data.errors);
                    showNotification(`Import completed with ${data.errors.length} errors. Check console for details.`, 'warning');
                }
                fetchProspects();
            } else {
                showNotification(data.error || 'Import failed', 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import prospects', 'error');
        }

        e.target.value = '';
    };

    // Handle creating new prospect
    const handleCreateProspect = async (prospectData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/prospects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(prospectData)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Prospect created successfully', 'success');
                fetchProspects();
                return true;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Create prospect error:', error);
            showNotification(error.message || 'Failed to create prospect', 'error');
            throw error;
        }
    };

    // Notification function
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const downloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/prospects/import/template', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', 'prospects_import_template.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
                showNotification('Template downloaded successfully', 'success');
            } else {
                throw new Error('Failed to download template');
            }
        } catch (error) {
            console.error('Download template error:', error);
            showNotification('Failed to download template', 'error');
        }
    };

    // Get unique values for filter dropdowns
    const industries = useMemo(() => {
        const uniqueIndustries = [...new Set(leads.map(lead => lead.Industry).filter(Boolean))];
        return ['all', ...uniqueIndustries];
    }, [leads]);

    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(leads.map(lead => lead.Country).filter(Boolean))];
        return ['all', ...uniqueCountries];
    }, [leads]);

    const statuses = useMemo(() => {
        const uniqueStatuses = [...new Set(leads.map(lead => lead.Status).filter(Boolean))];
        return ['all', ...uniqueStatuses];
    }, [leads]);

    // Calculate pagination values
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, sortedLeads.length);
    const totalItems = sortedLeads.length;

    // Generate page numbers array
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

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
            <div className={styles.controls}>
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

                        <AddNewProspects
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onSave={handleCreateProspect}
                            lookupData={lookupData}
                        />

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
            </div>

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

            {notification.show && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {notification.message}
                </div>
            )}

            {/* Table */}
            <div className={styles.tableWrapper}>
                <div className={styles.tableContainer}>
                    <table className={styles.leadsTable}>
                        <thead>
                            <tr>
                                <th className={styles.checkboxCell}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLeads.length === currentLeads.length && currentLeads.length > 0}
                                        onChange={handleSelectAll}
                                        className={styles.checkbox}
                                    />
                                </th>

                                {columnVisibility.fullname && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Fullname')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Full Name</span>
                                            {sortConfig.key === 'Fullname' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.jobtitle && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Jobtitle')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Job Title</span>
                                            {sortConfig.key === 'Jobtitle' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.company && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Company')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Company</span>
                                            {sortConfig.key === 'Company' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.email && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Email')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Email</span>
                                            {sortConfig.key === 'Email' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.companyphonenumber && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Companyphonenumber')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Company Phone</span>
                                            {sortConfig.key === 'Companyphonenumber' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.city && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('City')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>City</span>
                                            {sortConfig.key === 'City' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.state && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('State')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>State</span>
                                            {sortConfig.key === 'State' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.country && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Country')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Country</span>
                                            {sortConfig.key === 'Country' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.industry && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Industry')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Industry</span>
                                            {sortConfig.key === 'Industry' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.employeesize && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Employeesize')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Employee Size</span>
                                            {sortConfig.key === 'Employeesize' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.department && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Department')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Department</span>
                                            {sortConfig.key === 'Department' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.seniority && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Seniority')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Seniority</span>
                                            {sortConfig.key === 'Seniority' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.status && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('Status')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Status</span>
                                            {sortConfig.key === 'Status' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.createdon && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('CreatedOn')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Created On</span>
                                            {sortConfig.key === 'CreatedOn' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.actions && (
                                    <th className={styles.actionsHeader}>Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeads.length > 0 ? (
                                currentLeads.map(lead => (
                                    <tr key={lead.id} className={styles.tableRow}>
                                        <td className={styles.checkboxCell}>
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={() => handleSelectLead(lead.id)}
                                                className={styles.checkbox}
                                            />
                                        </td>

                                        {columnVisibility.fullname && (
                                            <td>
                                                <div className={styles.leadInfo}>
                                                    {/* <div className={styles.avatar}>
                                                        {lead.Firstname?.[0]}{lead.Lastname?.[0]}
                                                    </div> */}
                                                    <div className={styles.leadName}>{lead.Fullname}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.jobtitle && <td>{lead.Jobtitle}</td>}
                                        {columnVisibility.company && <td>{lead.Company}</td>}
                                        {columnVisibility.email && <td>{lead.Email}</td>}
                                        {columnVisibility.companyphonenumber && <td>{lead.Companyphonenumber}</td>}
                                        {columnVisibility.city && <td>{lead.City}</td>}
                                        {columnVisibility.state && <td>{lead.State}</td>}
                                        {columnVisibility.country && <td>{lead.Country}</td>}
                                        {columnVisibility.industry && <td>{getIndustryName(lead.Industry)}</td>}
                                        {columnVisibility.employeesize && <td>{lead.Employeesize}</td>}
                                        {columnVisibility.department && <td>{lead.Department}</td>}
                                        {columnVisibility.seniority && <td>{lead.Seniority}</td>}

                                        {columnVisibility.status && (
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[lead.Status?.toLowerCase()]}`}>
                                                    {lead.Status}
                                                </span>
                                            </td>
                                        )}

                                        {columnVisibility.createdon && <td>{formatDate(lead.CreatedOn)}</td>}

                                        {columnVisibility.actions && (
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button className={styles.actionButton} title="View">
                                                        <FiEye size={14} />
                                                    </button>
                                                    <button className={styles.actionButton} title="Edit">
                                                        <FiEdit size={14} />
                                                    </button>
                                                    <button className={styles.actionButton} title="Archive">
                                                        <FiArchive size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={Object.values(columnVisibility).filter(v => v).length + 1}
                                        className={styles.noData}
                                    >
                                        No leads found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {sortedLeads.length > 0 && (
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        Showing {startItem} to {endItem} of {totalItems} entries
                    </div>

                    <div className={styles.paginationControls}>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                            <option value={200}>200 per page</option>
                            <option value={500}>500 per page</option>
                            <option value={1000}>1000 per page</option>
                            <option value={2000}>2000 per page</option>
                        </select>

                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={styles.paginationButton}
                        >
                            Previous
                        </button>

                        {pageNumbers.map(page => (
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
            )}
        </div>
    );
};

export default Prospects;