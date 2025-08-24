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
    FiUser
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
    const [showActionMenu, setShowActionMenu] = useState(null);
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

    const [fixedColumns] = useState(['fullname', 'jobtitle', 'company']);

    // Add function to fetch prospects from API
    const fetchProspects = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/prospects', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setLeads(data.prospects);
            } else {
                throw new Error(data.error || 'Failed to fetch prospects');
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            showNotification('Failed to load prospects', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add useEffect for fetching lookup data - FIXED ENDPOINT
    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const response = await fetch('/api/prospects/lookup/data', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                showNotification('Failed to load dropdown data', 'error');
            }
        };

        fetchLookupData();
        fetchProspects(); // Fetch prospects on component mount
    }, []);

    // Filter leads based on search term and filters
    const filteredLeads = useMemo(() => {
        if (!leads.length) return [];

        return leads.filter(lead => {
            const matchesSearch =
                (lead.Fullname && lead.Fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Jobtitle && lead.Jobtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Company && lead.Company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Email && lead.Email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filters.status === 'all' || lead.Status === filters.status;
            const matchesIndustry = filters.industry === 'all' || lead.Industry === filters.industry;
            const matchesCountry = filters.country === 'all' || lead.Country === filters.country;

            return matchesSearch && matchesStatus && matchesIndustry && matchesCountry;
        });
    }, [leads, searchTerm, filters]);

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
                if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
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
                break;
            case 'archive':
                // Implement archive functionality if needed
                showNotification('Archive functionality not implemented yet', 'info');
                break;
            default:
                break;
        }
        setShowActionMenu(null);
    };

    // Update the exportToCSV function to use the backend
    const exportToCSV = async (leadIds = []) => {
        try {
            const url = leadIds.length > 0
                ? `/api/prospects/export/csv?ids=${leadIds.join(',')}`
                : '/api/prospects/export/csv';

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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

    // Update the handleImport function to use the backend
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/prospects/import/csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showNotification(`Successfully imported ${data.importedCount} prospects`, 'success');
                // Refresh the prospects list
                fetchProspects();
            } else {
                showNotification(data.error || 'Import failed', 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import prospects', 'error');
        }
        
        // Reset the file input
        e.target.value = '';
    };

    // Add function to handle creating new prospect
    const handleCreateProspect = async (prospectData) => {
        try {
            const response = await fetch('/api/prospects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(prospectData)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Prospect created successfully', 'success');
                // Refresh the prospects list
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

    // Add notification function
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
                            {industries.filter(i => i !== 'all').map(industry => (
                                <option key={industry} value={industry}>{industry}</option>
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

            {/* Bulk Actions Bar */}
            {selectedLeads.length > 0 && (
                <div className={styles.bulkActions}>
                    <div className={styles.bulkActionsInfo}>
                        <span>{selectedLeads.length} selected</span>
                    </div>
                    <div className={styles.bulkActionsButtons}>
                        <div className={styles.actionMenu}>
                            <button
                                className={styles.bulkActionButton}
                                onClick={() => setShowActionMenu(!showActionMenu)}
                            >
                                <span>Actions</span>
                                <FiChevronDown size={16} />
                            </button>

                            {showActionMenu && (
                                <div className={styles.actionMenuDropdown}>
                                    <button onClick={() => handleBulkAction('export')}>
                                        <FiDownload size={14} />
                                        Export Selected
                                    </button>
                                    <button onClick={() => handleBulkAction('archive')}>
                                        <FiArchive size={14} />
                                        Archive Selected
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className={styles.deleteAction}
                                    >
                                        <FiTrash2 size={14} />
                                        Delete Selected
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
                                                    <div className={styles.avatar}>
                                                        {lead.Firstname?.[0]}{lead.Lastname?.[0]}
                                                    </div>
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
                                        {columnVisibility.industry && <td>{lead.Industry}</td>}
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
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button className={styles.actionButton} title="Edit">
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button className={styles.actionButton} title="Archive">
                                                        <FiArchive size={16} />
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
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedLeads.length)} to {Math.min(currentPage * itemsPerPage, sortedLeads.length)} of {sortedLeads.length} entries
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
                        </select>

                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={styles.paginationButton}
                        >
                            Previous
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`${styles.paginationButton} ${currentPage === pageNum ? styles.active : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className={styles.paginationEllipsis}>...</span>
                        )}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={styles.paginationButton}
                            >
                                {totalPages}
                            </button>
                        )}

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