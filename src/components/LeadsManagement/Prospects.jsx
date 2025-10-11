import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiCheck,
    FiXCircle
} from 'react-icons/fi';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';
import AddNewProspects from './Modals/AddNewProspects';
import styles from './Prospects.module.css';
import ImportProcessingModal from './ImportProcessingModal';

const FilterAccordion = ({ title, children, isOpen, onToggle, id }) => {
    return (
        <div className={styles.zpAccordion}>
            <div
                className={styles.zpAccordionHeader}
                onClick={onToggle}
                role="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${id}`}
                id={`accordion-header-${id}`}
            >
                <span className={styles.accordionTitleWrapper}>
                    <div className={styles.accordionTitle}><span>{title}</span></div>
                    <i className={`${styles.zpChevron} ${isOpen ? styles.chevronOpen : styles.chevronClosed}`}>
                        <FiChevronLeft size={14} />
                    </i>
                </span>
            </div>
            <div
                className={`${styles.zpAccordionContent} ${isOpen ? styles.accordionOpen : styles.accordionClosed}`}
                id={`accordion-content-${id}`}
                aria-labelledby={`accordion-header-${id}`}
            >
                {children}
            </div>
        </div>
    );
};

// Enhanced SearchableDropdown Component
const SearchableDropdown = ({ 
    field, 
    selectedValues, 
    onSelectionChange, 
    placeholder = "Type to search...",
    disabled = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setError(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchSuggestions = useCallback(async (search) => {
        if (!search.trim()) {
            setSuggestions([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            console.log(`🔍 Fetching suggestions for ${field}:`, search);
            
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/prospects/filter/options?field=${encodeURIComponent(field)}&search=${encodeURIComponent(search)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Server error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Response data:', data);

            if (data.success) {
                // Filter out already selected values and empty/null values
                const filteredSuggestions = (data.options || [])
                    .filter(option => 
                        option && 
                        option.trim() !== '' && 
                        !selectedValues.includes(option)
                    );
                
                console.log(`🎯 Filtered suggestions for ${field}:`, filteredSuggestions);
                setSuggestions(filteredSuggestions);
            } else {
                throw new Error(data.error || 'Failed to fetch suggestions from server');
            }
        } catch (error) {
            console.error(`💥 Error fetching ${field} suggestions:`, error);
            setError(error.message);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [field, selectedValues]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim() && isOpen) {
                fetchSuggestions(searchTerm);
            } else {
                setSuggestions([]);
                setError(null);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isOpen, fetchSuggestions]);

    const handleSelect = (value) => {
        console.log(`✅ Selected ${field}:`, value);
        if (!selectedValues.includes(value)) {
            onSelectionChange([...selectedValues, value]);
        }
        setSearchTerm('');
        setSuggestions([]);
        setError(null);
        setIsOpen(false);
    };

    const handleRemove = (valueToRemove) => {
        console.log(`❌ Removing ${field}:`, valueToRemove);
        onSelectionChange(selectedValues.filter(value => value !== valueToRemove));
    };

    const handleInputFocus = () => {
        console.log(`👁️ Input focused for ${field}`);
        setIsOpen(true);
        setError(null);
        if (searchTerm.trim()) {
            fetchSuggestions(searchTerm);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        console.log(`⌨️ Input changed for ${field}:`, value);
        setSearchTerm(value);
        setError(null);
        if (value.trim()) {
            setIsOpen(true);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() && suggestions.length > 0) {
            e.preventDefault();
            handleSelect(suggestions[0]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setError(null);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setError(null);
        setIsOpen(false);
    };

    return (
        <div className={styles.searchableDropdown} ref={dropdownRef}>
            {/* Selected Tags */}
            <div className={styles.selectedTags}>
                {selectedValues.map(value => (
                    <span key={value} className={styles.selectedTag}>
                        {value}
                        <button
                            type="button"
                            onClick={() => handleRemove(value)}
                            className={styles.removeTag}
                            disabled={disabled}
                            title={`Remove ${value}`}
                        >
                            <FiX size={12} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Search Input */}
            <div className={styles.searchInputContainer}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleInputKeyDown}
                    className={styles.searchInput}
                    disabled={disabled}
                />
                
                {searchTerm && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className={styles.clearSearchButton}
                        title="Clear search"
                    >
                        <FiX size={14} />
                    </button>
                )}

                {/* Suggestions Dropdown */}
                {isOpen && (
                    <div className={styles.suggestionsDropdown}>
                        {error ? (
                            <div className={styles.suggestionError}>
                                <FiXCircle size={16} />
                                <span>Error: {error}</span>
                            </div>
                        ) : loading ? (
                            <div className={styles.suggestionLoading}>
                                <div className={styles.loadingSpinner}></div>
                                <span>Searching...</span>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <>
                                <div className={styles.suggestionHeader}>
                                    Found {suggestions.length} results
                                </div>
                                {suggestions.map(suggestion => (
                                    <div
                                        key={suggestion}
                                        className={styles.suggestionItem}
                                        onClick={() => handleSelect(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </>
                        ) : searchTerm.trim() ? (
                            <div className={styles.suggestionEmpty}>
                                No results found for "{searchTerm}"
                            </div>
                        ) : (
                            <div className={styles.suggestionEmpty}>
                                Start typing to search...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Prospects = () => {
    // State management with localStorage persistence
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = localStorage.getItem('prospects_currentPage');
        return saved ? parseInt(saved) : 1;
    });
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = localStorage.getItem('prospects_itemsPerPage');
        return saved ? parseInt(saved) : 10;
    });
    const [sortConfig, setSortConfig] = useState(() => {
        const saved = localStorage.getItem('prospects_sortConfig');
        return saved ? JSON.parse(saved) : { key: null, direction: 'ascending' };
    });
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState(() => {
        const saved = localStorage.getItem('prospects_columnVisibility');
        return saved ? JSON.parse(saved) : {
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
        };
    });

    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showBulkActionPopup, setShowBulkActionPopup] = useState(false);

    // Enhanced filter state with localStorage
    const [openAccordions, setOpenAccordions] = useState(() => {
        const saved = localStorage.getItem('prospects_openAccordions');
        return saved ? JSON.parse(saved) : {};
    });

    const [filterValues, setFilterValues] = useState(() => {
        const saved = localStorage.getItem('prospects_filterValues');
        return saved ? JSON.parse(saved) : {
            exportHeaders: '1',
            jobTitles: [],
            industries: [],
            departments: [],
            seniorities: [],
            employeeSizeMin: '',
            employeeSizeMax: '',
            annualRevenueMin: '',
            annualRevenueMax: '',
            fullname: '',
            firstname: '',
            lastname: '',
            company: '',
            state: '',
            country: '',
            altPhoneNumber: '',
            companyNumber: '',
            email: '',
            website: '',
            sicCode: '',
            naicsCode: ''
        };
    });

    const [importProcessing, setImportProcessing] = useState({
        isOpen: false,
        stats: null
    });

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
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        action: null,
        message: '',
        count: 0
    });

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem('prospects_currentPage', currentPage.toString());
    }, [currentPage]);

    useEffect(() => {
        localStorage.setItem('prospects_itemsPerPage', itemsPerPage.toString());
    }, [itemsPerPage]);

    useEffect(() => {
        localStorage.setItem('prospects_sortConfig', JSON.stringify(sortConfig));
    }, [sortConfig]);

    useEffect(() => {
        localStorage.setItem('prospects_columnVisibility', JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    useEffect(() => {
        localStorage.setItem('prospects_openAccordions', JSON.stringify(openAccordions));
    }, [openAccordions]);

    useEffect(() => {
        localStorage.setItem('prospects_filterValues', JSON.stringify(filterValues));
    }, [filterValues]);

    // Check if any filter is active
    const isFilterActive = useMemo(() => {
        return Object.entries(filterValues).some(([key, value]) => {
            if (key === 'exportHeaders') return false; // Skip export headers
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return value !== 0;
            return false;
        });
    }, [filterValues]);

    // Toggle accordion
    const toggleAccordion = (id) => {
        setOpenAccordions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Enhanced filter change handlers
    const handleFilterChange = (field, value) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayFilterChange = (field, values) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: values
        }));
    };

    // Enhanced fetch prospects with comprehensive filtering
    const fetchProspects = useCallback(async () => {
        // Don't fetch if no filters are active
        if (!isFilterActive) {
            setLeads([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Build query parameters with all filters
            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                ...(searchTerm && { search: searchTerm }),
                ...(filterValues.jobTitles.length > 0 && { jobTitles: filterValues.jobTitles.join(',') }),
                ...(filterValues.industries.length > 0 && { industries: filterValues.industries.join(',') }),
                ...(filterValues.departments.length > 0 && { departments: filterValues.departments.join(',') }),
                ...(filterValues.seniorities.length > 0 && { seniorities: filterValues.seniorities.join(',') }),
                ...(filterValues.employeeSizeMin && { employeeSizeMin: filterValues.employeeSizeMin }),
                ...(filterValues.employeeSizeMax && { employeeSizeMax: filterValues.employeeSizeMax }),
                ...(filterValues.annualRevenueMin && { annualRevenueMin: filterValues.annualRevenueMin }),
                ...(filterValues.annualRevenueMax && { annualRevenueMax: filterValues.annualRevenueMax }),
                ...(filterValues.fullname && { fullname: filterValues.fullname }),
                ...(filterValues.firstname && { firstname: filterValues.firstname }),
                ...(filterValues.lastname && { lastname: filterValues.lastname }),
                ...(filterValues.company && { company: filterValues.company }),
                ...(filterValues.state && { state: filterValues.state }),
                ...(filterValues.country && { country: filterValues.country }),
                ...(filterValues.email && { email: filterValues.email })
            });

            const response = await fetch(`/api/prospects?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

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
    }, [isFilterActive, currentPage, itemsPerPage, searchTerm, filterValues]);

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
    }, []);

    useEffect(() => {
        fetchProspects();
    }, [fetchProspects]);

    // Handle search with filters
    const handleFilterSearch = () => {
        setCurrentPage(1);
        fetchProspects();
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilterValues({
            exportHeaders: '1',
            jobTitles: [],
            industries: [],
            departments: [],
            seniorities: [],
            employeeSizeMin: '',
            employeeSizeMax: '',
            annualRevenueMin: '',
            annualRevenueMax: '',
            fullname: '',
            firstname: '',
            lastname: '',
            company: '',
            state: '',
            country: '',
            altPhoneNumber: '',
            companyNumber: '',
            email: '',
            website: '',
            sicCode: '',
            naicsCode: ''
        });
        setOpenAccordions({});
        setCurrentPage(1);
    };

    // Filter leads based on search and filters
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = searchTerm === '' ||
                (lead.Fullname && lead.Fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Jobtitle && lead.Jobtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Company && lead.Company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.Email && lead.Email.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesSearch;
        });
    }, [leads, searchTerm]);

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

    // Update the handleImport function in Prospects.jsx
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
            showNotification('File size too large. Maximum 100MB allowed.', 'error');
            e.target.value = '';
            return;
        }

        // Validate file type
        if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
            showNotification('Only CSV files are allowed.', 'error');
            e.target.value = '';
            return;
        }

        // Show processing modal immediately
        setImportProcessing({
            isOpen: true,
            stats: {
                stage: 'preparing',
                totalRows: 0,
                validRows: 0,
                insertedRows: 0,
                errorCount: 0,
                logs: [
                    {
                        type: 'info',
                        message: 'Starting import process...',
                        timestamp: new Date()
                    },
                    {
                        type: 'info',
                        message: `Processing file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
                        timestamp: new Date()
                    },
                    {
                        type: 'info',
                        message: 'Validating file format and contents...',
                        timestamp: new Date()
                    }
                ],
                errors: [],
                sessionId: null
            }
        });

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

            // Check for HTTP errors
            if (!response.ok) {
                let errorMessage = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.success) {
                // Start polling for progress
                const sessionId = data.sessionId;
                setImportProcessing(prev => ({
                    ...prev,
                    stats: {
                        ...prev.stats,
                        sessionId: sessionId,
                        totalRows: data.totalProspects,
                        validRows: data.totalProspects - (data.validationErrorCount || 0),
                        stage: 'processing',
                        logs: [
                            ...prev.stats.logs,
                            {
                                type: 'info',
                                message: `Import started. Processing ${data.totalProspects} prospects in ${data.totalChunks} chunks`,
                                timestamp: new Date()
                            },
                            ...(data.validationErrorCount > 0 ? [{
                                type: 'warning',
                                message: `${data.validationErrorCount} rows failed validation and will be skipped`,
                                timestamp: new Date()
                            }] : []),
                            {
                                type: 'info',
                                message: 'Starting background processing...',
                                timestamp: new Date()
                            }
                        ]
                    }
                }));

                // Poll for progress
                pollImportProgress(sessionId);
            } else {
                throw new Error(data.error || 'Import failed');
            }
        } catch (error) {
            console.error('Import error:', error);

            // Determine error type for better user messaging
            let userFriendlyError = error.message;
            if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
                userFriendlyError = 'Network error: Unable to connect to server. Please check your connection.';
            } else if (error.message.includes('413')) {
                userFriendlyError = 'File too large. Please use a smaller file or split your data.';
            } else if (error.message.includes('415') || error.message.includes('Unsupported Media Type')) {
                userFriendlyError = 'Invalid file type. Please upload a valid CSV file.';
            }

            setImportProcessing(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    stage: 'completed',
                    logs: [
                        ...prev.stats.logs,
                        {
                            type: 'error',
                            message: `Import failed: ${userFriendlyError}`,
                            timestamp: new Date()
                        },
                        {
                            type: 'info',
                            message: 'Please try again with a valid CSV file.',
                            timestamp: new Date()
                        }
                    ],
                    errors: [userFriendlyError]
                }
            }));

            // Auto-close error modal after 8 seconds
            setTimeout(() => {
                setImportProcessing({ isOpen: false, stats: null });
            }, 8000);
        }

        // Reset file input
        e.target.value = '';
    };

    // Add polling function
    const pollImportProgress = async (sessionId, attempt = 0) => {
        const maxAttempts = 15; // Increased maximum polling attempts
        const baseDelay = 2000; // Base delay in ms
        const maxDelay = 30000; // Maximum delay in ms

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/prospects/import/progress/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Handle 500 errors specifically
                if (response.status === 500) {
                    console.warn('Progress endpoint returned 500, will retry...');
                    // Don't throw error, just retry
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } else {
                const data = await response.json();

                if (data.success) {
                    const progress = data.progress;

                    setImportProcessing(prev => ({
                        ...prev,
                        stats: {
                            ...prev.stats,
                            stage: progress.status === 'completed' ? 'completed' : 'processing',
                            insertedRows: progress.successfulImports,
                            errorCount: progress.failedImports,
                            logs: [
                                ...prev.stats.logs.filter(log =>
                                    !log.message.includes('Processing chunk') &&
                                    !log.message.includes('Progress update') &&
                                    !log.message.includes('Retrying')
                                ),
                                ...(progress.status === 'processing' ? [{
                                    type: 'info',
                                    message: `Processing chunk ${progress.processedChunks}/${progress.totalChunks} (${progress.progressPercentage}%)`,
                                    timestamp: new Date()
                                }] : [])
                            ].slice(-100),
                            errors: progress.chunkErrors || []
                        }
                    }));

                    if (progress.status === 'completed') {
                        // Add completion log
                        setImportProcessing(prev => ({
                            ...prev,
                            stats: {
                                ...prev.stats,
                                logs: [
                                    ...prev.stats.logs,
                                    {
                                        type: 'success',
                                        message: `Import completed! ${progress.successfulImports} prospects imported successfully, ${progress.failedImports} failed.`,
                                        timestamp: new Date()
                                    }
                                ]
                            }
                        }));

                        // Auto-close after 5 seconds if successful
                        setTimeout(() => {
                            setImportProcessing({ isOpen: false, stats: null });
                            fetchProspects(); // Refresh the list
                            showNotification(`Imported ${progress.successfulImports} prospects successfully`, 'success');
                        }, 5000);

                        return; // Stop polling
                    }
                } else {
                    throw new Error(data.error || 'Failed to check progress');
                }
            }

            // Continue polling if not completed and within attempt limits
            if (attempt < maxAttempts) {
                const delay = Math.min(baseDelay * Math.pow(1.5, attempt) + Math.random() * 1000, maxDelay);

                // Add retry log
                setImportProcessing(prev => ({
                    ...prev,
                    stats: {
                        ...prev.stats,
                        logs: [
                            ...prev.stats.logs,
                            {
                                type: 'info',
                                message: `Retrying progress check... (attempt ${attempt + 1}/${maxAttempts})`,
                                timestamp: new Date()
                            }
                        ].slice(-100)
                    }
                }));

                setTimeout(() => pollImportProgress(sessionId, attempt + 1), delay);
            } else {
                throw new Error('Progress polling timeout - import may still be processing in background');
            }

        } catch (error) {
            console.error('Progress polling error:', error);

            if (attempt < maxAttempts) {
                const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
                setTimeout(() => pollImportProgress(sessionId, attempt + 1), delay);
            } else {
                setImportProcessing(prev => ({
                    ...prev,
                    stats: {
                        ...prev.stats,
                        stage: 'completed',
                        logs: [
                            ...prev.stats.logs,
                            {
                                type: 'warning',
                                message: 'Unable to track progress, but import may still be processing in background.',
                                timestamp: new Date()
                            }
                        ]
                    }
                }));

                // Auto-close after 10 seconds
                setTimeout(() => {
                    setImportProcessing({ isOpen: false, stats: null });
                    fetchProspects(); // Refresh the list anyway
                    showNotification('Import processing completed (progress tracking failed)', 'warning');
                }, 10000);
            }
        }
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
            <div className={styles.prospectsLayout}>
                {/* Filter Sidebar */}
                <div className={styles.filterSidebar}>
                    <div className={styles.filterCard}>
                        <div className={styles.cardHeader}>
                            <FiFilter className={styles.filterIcon} />
                            Filter
                            {isFilterActive && (
                                <span className={styles.activeFilterBadge}>
                                    Active
                                </span>
                            )}
                        </div>
                        <div className={styles.prospectsCardBody}>
                            {/* Export Options */}
                            <FilterAccordion
                                title="Export Options"
                                isOpen={openAccordions.export}
                                onToggle={() => toggleAccordion('export')}
                                id="export"
                            >
                                <label className={styles.dBlock}>Export Include Headers</label>
                                <div className={styles.radioGroup}>
                                    <div className={styles.formCheck}>
                                        <input
                                            type="radio"
                                            id="withHeaders"
                                            name="exportHeaders"
                                            value="1"
                                            checked={filterValues.exportHeaders === '1'}
                                            onChange={(e) => handleFilterChange('exportHeaders', e.target.value)}
                                        />
                                        <label htmlFor="withHeaders">With Headers</label>
                                    </div>
                                    <div className={styles.formCheck}>
                                        <input
                                            type="radio"
                                            id="noHeaders"
                                            name="exportHeaders"
                                            value="0"
                                            checked={filterValues.exportHeaders === '0'}
                                            onChange={(e) => handleFilterChange('exportHeaders', e.target.value)}
                                        />
                                        <label htmlFor="noHeaders">No Headers</label>
                                    </div>
                                </div>
                            </FilterAccordion>

                            {/* Job Title */}
                            <FilterAccordion
                                title="Job Title"
                                isOpen={openAccordions.jobTitle}
                                onToggle={() => toggleAccordion('jobTitle')}
                                id="jobTitle"
                            >
                                <div className={styles.formGroup}>
                                    <label>Search Suggestion/Dropdown</label>
                                    <SearchableDropdown
                                        field="Jobtitle"
                                        selectedValues={filterValues.jobTitles}
                                        onSelectionChange={(values) => handleArrayFilterChange('jobTitles', values)}
                                        placeholder="Type job title..."
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Industry */}
                            <FilterAccordion
                                title="Industry"
                                isOpen={openAccordions.industry}
                                onToggle={() => toggleAccordion('industry')}
                                id="industry"
                            >
                                <div className={styles.formGroup}>
                                    <label>Search Suggestion/Dropdown</label>
                                    <SearchableDropdown
                                        field="Industry"
                                        selectedValues={filterValues.industries}
                                        onSelectionChange={(values) => handleArrayFilterChange('industries', values)}
                                        placeholder="Type industry..."
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Department */}
                            <FilterAccordion
                                title="Department"
                                isOpen={openAccordions.department}
                                onToggle={() => toggleAccordion('department')}
                                id="department"
                            >
                                <div className={styles.formGroup}>
                                    <label>Search Suggestion/Dropdown</label>
                                    <SearchableDropdown
                                        field="Department"
                                        selectedValues={filterValues.departments}
                                        onSelectionChange={(values) => handleArrayFilterChange('departments', values)}
                                        placeholder="Type department..."
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Seniority */}
                            <FilterAccordion
                                title="Seniority"
                                isOpen={openAccordions.seniority}
                                onToggle={() => toggleAccordion('seniority')}
                                id="seniority"
                            >
                                <div className={styles.formGroup}>
                                    <label>Search Suggestion/Dropdown</label>
                                    <SearchableDropdown
                                        field="Seniority"
                                        selectedValues={filterValues.seniorities}
                                        onSelectionChange={(values) => handleArrayFilterChange('seniorities', values)}
                                        placeholder="Type seniority..."
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Employee Size */}
                            <FilterAccordion
                                title="Employee Size"
                                isOpen={openAccordions.employeeSize}
                                onToggle={() => toggleAccordion('employeeSize')}
                                id="employeeSize"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="EmployeeSizeMin" className={styles.empsizelabelmin}>Min</label>
                                    <input
                                        type="number"
                                        name="employeesize_min"
                                        className={styles.formControl}
                                        placeholder="(e.g 1)"
                                        id="EmployeeSizeMin"
                                        value={filterValues.employeeSizeMin}
                                        onChange={(e) => handleFilterChange('employeeSizeMin', e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="EmployeeSizeMax" className={styles.empsizelabelmax}>Max</label>
                                    <input
                                        type="number"
                                        name="employeesize_max"
                                        className={styles.formControl}
                                        placeholder="(e.g 10)"
                                        id="EmployeeSizeMax"
                                        value={filterValues.employeeSizeMax}
                                        onChange={(e) => handleFilterChange('employeeSizeMax', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Annual Revenue */}
                            <FilterAccordion
                                title="Annual Revenue"
                                isOpen={openAccordions.annualRevenue}
                                onToggle={() => toggleAccordion('annualRevenue')}
                                id="annualRevenue"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="AnnualRevenueMin" className={styles.annsizelabelmin}>Min</label>
                                    <input
                                        type="number"
                                        name="annualrevenue_min"
                                        className={styles.formControl}
                                        placeholder="(e.g 1)"
                                        id="AnnualRevenueMin"
                                        value={filterValues.annualRevenueMin}
                                        onChange={(e) => handleFilterChange('annualRevenueMin', e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="AnnualRevenueMax" className={styles.annsizelabelmax}>Max</label>
                                    <input
                                        type="number"
                                        name="annualrevenue_max"
                                        className={styles.formControl}
                                        placeholder="(e.g 10)"
                                        id="AnnualRevenueMax"
                                        value={filterValues.annualRevenueMax}
                                        onChange={(e) => handleFilterChange('annualRevenueMax', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Fullname */}
                            <FilterAccordion
                                title="Fullname"
                                isOpen={openAccordions.fullname}
                                onToggle={() => toggleAccordion('fullname')}
                                id="fullname"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SFullname" className={styles.fullnamelabel}>Input</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        className={styles.formControl}
                                        placeholder="(e.g John Doe)"
                                        id="SFullname"
                                        value={filterValues.fullname}
                                        onChange={(e) => handleFilterChange('fullname', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Firstname */}
                            <FilterAccordion
                                title="Firstname"
                                isOpen={openAccordions.firstname}
                                onToggle={() => toggleAccordion('firstname')}
                                id="firstname"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SFirstname" className={styles.firstnamelabel}>Input</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className={styles.formControl}
                                        placeholder="(e.g John)"
                                        id="SFirstname"
                                        value={filterValues.firstname}
                                        onChange={(e) => handleFilterChange('firstname', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Lastname */}
                            <FilterAccordion
                                title="Lastname"
                                isOpen={openAccordions.lastname}
                                onToggle={() => toggleAccordion('lastname')}
                                id="lastname"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SLastname" className={styles.lastnamelabel}>Input</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className={styles.formControl}
                                        placeholder="(e.g Doe)"
                                        id="SLastname"
                                        value={filterValues.lastname}
                                        onChange={(e) => handleFilterChange('lastname', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Company */}
                            <FilterAccordion
                                title="Company"
                                isOpen={openAccordions.company}
                                onToggle={() => toggleAccordion('company')}
                                id="company"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SCompany" className={styles.companylabel}>Input</label>
                                    <input
                                        type="text"
                                        name="s_company"
                                        className={styles.formControl}
                                        placeholder="(e.g ABC Corporation)"
                                        id="SCompany"
                                        value={filterValues.company}
                                        onChange={(e) => handleFilterChange('company', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* State */}
                            <FilterAccordion
                                title="State"
                                isOpen={openAccordions.state}
                                onToggle={() => toggleAccordion('state')}
                                id="state"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SState" className={styles.statelabel}>Input</label>
                                    <input
                                        type="text"
                                        name="s_state"
                                        className={styles.formControl}
                                        placeholder="(e.g ABC State)"
                                        id="SState"
                                        value={filterValues.state}
                                        onChange={(e) => handleFilterChange('state', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Country */}
                            <FilterAccordion
                                title="Country"
                                isOpen={openAccordions.country}
                                onToggle={() => toggleAccordion('country')}
                                id="country"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SCountry" className={styles.countrylabel}>Input</label>
                                    <input
                                        type="text"
                                        name="s_country"
                                        className={styles.formControl}
                                        placeholder="(e.g ABC Country)"
                                        id="SCountry"
                                        value={filterValues.country}
                                        onChange={(e) => handleFilterChange('country', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                            {/* Email Address */}
                            <FilterAccordion
                                title="Email Address"
                                isOpen={openAccordions.email}
                                onToggle={() => toggleAccordion('email')}
                                id="email"
                            >
                                <div className={styles.formGroup}>
                                    <label htmlFor="SEmail" className={styles.emaillabel}>Input</label>
                                    <input
                                        type="text"
                                        name="s_emailaddress"
                                        className={styles.formControl}
                                        placeholder="(e.g abc@example.com)"
                                        id="SEmail"
                                        value={filterValues.email}
                                        onChange={(e) => handleFilterChange('email', e.target.value)}
                                    />
                                </div>
                            </FilterAccordion>

                        </div>
                        <div className={styles.cardFooter}>
                            <div className={styles.row}>
                                <div className={styles.colMd12}>
                                    <button
                                        type="button"
                                        onClick={handleFilterSearch}
                                        className={styles.filterSearchButton}
                                        disabled={!isFilterActive}
                                    >
                                        <FiSearch />
                                        Search
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAllFilters}
                                        className={styles.clearFiltersButton}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={styles.mainContent}>
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

                    {/* No Data Message */}
                    {!isFilterActive && (
                        <div className={styles.noFilterMessage}>
                            <div className={styles.noFilterContent}>
                                <FiFilter size={48} className={styles.noFilterIcon} />
                                <h3>No Filters Applied</h3>
                                <p>Please apply filters to see prospect data. Use the filter panel on the left to specify your search criteria.</p>
                                <div className={styles.filterTips}>
                                    <h4>Filter Tips:</h4>
                                    <ul>
                                        <li>Use the searchable dropdowns to find specific values</li>
                                        <li>Combine multiple filters for precise results</li>
                                        <li>Use range filters for numerical values like Employee Size</li>
                                        <li>Your filter selections are saved automatically</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table - Only show when filters are active */}
                    {isFilterActive && (
                        <>
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
                                                        No leads found matching your filters
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination - Only show when filters are active and data exists */}
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
                        </>
                    )}
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

            {importProcessing.isOpen && (
                <ImportProcessingModal
                    isOpen={importProcessing.isOpen}
                    onClose={() => setImportProcessing({ isOpen: false, stats: null })}
                    processingStats={importProcessing.stats}
                />
            )}

            {notification.show && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Prospects;