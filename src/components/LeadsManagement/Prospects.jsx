// src/components/LeadsManagement/Prospects.jsx
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
    FiArchive
} from 'react-icons/fi';
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

    const [fixedColumns] = useState(['fullname', 'jobtitle', 'company']);

    // Mock data based on the provided format
    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            try {
                // Simulate API call
                setTimeout(() => {
                    const mockLeads = [
                        {
                            id: 1,
                            fullname: 'John Smith',
                            firstname: 'John',
                            lastname: 'Smith',
                            jobtitle: 'IT Manager',
                            company: 'TechNova Inc',
                            website: 'https://technova.com',
                            personallinkedin: 'https://linkedin.com/in/johnsmith',
                            companylinkedin: 'https://linkedin.com/company/technova',
                            altphonenumber: '555-234-5678',
                            companyphonenumber: '555-111-2222',
                            email: 'john.smith@technova.com',
                            emailcode: 'JS123',
                            address: '123 Main St',
                            street: 'Main St',
                            city: 'San Francisco',
                            state: 'CA',
                            postalcode: '94105',
                            country: 'USA',
                            annualrevenue: 5000000,
                            industry: 'Technology',
                            employeesize: 250,
                            siccode: '7372',
                            naicscode: '541511',
                            dispositioncode: 'DISC001',
                            providercode: 'PROV01',
                            comments: 'Interested in cloud solutions',
                            isactive: true,
                            createdby: 'Admin',
                            createdon: '2025-08-20',
                            updatedby: 'Admin',
                            updatedon: '2025-08-21',
                            department: 'IT',
                            seniority: 'Manager',
                            status: 'New'
                        },
                        {
                            id: 2,
                            fullname: 'Sarah Johnson',
                            firstname: 'Sarah',
                            lastname: 'Johnson',
                            jobtitle: 'Marketing Director',
                            company: 'BrandSphere',
                            website: 'https://brandsphere.io',
                            personallinkedin: 'https://linkedin.com/in/sarahjohnson',
                            companylinkedin: 'https://linkedin.com/company/brandsphere',
                            altphonenumber: '555-789-1234',
                            companyphonenumber: '555-333-4444',
                            email: 's.johnson@brandsphere.io',
                            emailcode: 'SJ456',
                            address: '456 Oak Ave',
                            street: 'Oak Ave',
                            city: 'New York',
                            state: 'NY',
                            postalcode: '10001',
                            country: 'USA',
                            annualrevenue: 20000000,
                            industry: 'Marketing',
                            employeesize: 120,
                            siccode: '8742',
                            naicscode: '541613',
                            dispositioncode: 'DISC002',
                            providercode: 'PROV02',
                            comments: 'Requested brochure',
                            isactive: true,
                            createdby: 'Admin',
                            createdon: '2025-08-20',
                            updatedby: 'Admin',
                            updatedon: '2025-08-21',
                            department: 'Marketing',
                            seniority: 'Director',
                            status: 'Contacted'
                        },
                        {
                            id: 3,
                            fullname: 'David Lee',
                            firstname: 'David',
                            lastname: 'Lee',
                            jobtitle: 'CFO',
                            company: 'FinTrust Corp',
                            website: 'https://fintrust.com',
                            personallinkedin: 'https://linkedin.com/in/davidlee',
                            companylinkedin: 'https://linkedin.com/company/fintrust',
                            altphonenumber: '555-678-9876',
                            companyphonenumber: '555-222-8888',
                            email: 'david.lee@fintrust.com',
                            emailcode: 'DL789',
                            address: '789 Pine Rd',
                            street: 'Pine Rd',
                            city: 'Chicago',
                            state: 'IL',
                            postalcode: '60601',
                            country: 'USA',
                            annualrevenue: 100000000,
                            industry: 'Finance',
                            employeesize: 500,
                            siccode: '6211',
                            naicscode: '522110',
                            dispositioncode: 'DISC003',
                            providercode: 'PROV03',
                            comments: 'Needs pricing details',
                            isactive: false,
                            createdby: 'Admin',
                            createdon: '2025-08-20',
                            updatedby: 'Admin',
                            updatedon: '2025-08-21',
                            department: 'Finance',
                            seniority: 'Executive',
                            status: 'Qualified'
                        },
                        {
                            id: 4,
                            fullname: 'Emily Davis',
                            firstname: 'Emily',
                            lastname: 'Davis',
                            jobtitle: 'HR Director',
                            company: 'PeopleFirst Ltd',
                            website: 'https://peoplefirst.com',
                            personallinkedin: 'https://linkedin.com/in/emilydavis',
                            companylinkedin: 'https://linkedin.com/company/peoplefirst',
                            altphonenumber: '555-345-6789',
                            companyphonenumber: '555-444-5555',
                            email: 'emily.davis@peoplefirst.com',
                            emailcode: 'ED321',
                            address: '321 Market St',
                            street: 'Market St',
                            city: 'Boston',
                            state: 'MA',
                            postalcode: '2110',
                            country: 'USA',
                            annualrevenue: 15000000,
                            industry: 'Human Resources',
                            employeesize: 75,
                            siccode: '8748',
                            naicscode: '541612',
                            dispositioncode: 'DISC004',
                            providercode: 'PROV04',
                            comments: 'Interested in HR software',
                            isactive: true,
                            createdby: 'Admin',
                            createdon: '2025-08-20',
                            updatedby: 'Admin',
                            updatedon: '2025-08-21',
                            department: 'HR',
                            seniority: 'Director',
                            status: 'Proposal'
                        },
                        {
                            id: 5,
                            fullname: 'Michael Brown',
                            firstname: 'Michael',
                            lastname: 'Brown',
                            jobtitle: 'CEO',
                            company: 'NextStack LLC',
                            website: 'https://nextstack.com',
                            personallinkedin: 'https://linkedin.com/in/michaelbrown',
                            companylinkedin: 'https://linkedin.com/company/nextstack',
                            altphonenumber: '555-987-1234',
                            companyphonenumber: '555-555-6666',
                            email: 'michael.brown@nextstack.com',
                            emailcode: 'MB654',
                            address: '654 Elm St',
                            street: 'Elm St',
                            city: 'Austin',
                            state: 'TX',
                            postalcode: '73301',
                            country: 'USA',
                            annualrevenue: 75000000,
                            industry: 'Software',
                            employeesize: 350,
                            siccode: '7371',
                            naicscode: '541511',
                            dispositioncode: 'DISC005',
                            providercode: 'PROV05',
                            comments: 'Follow-up next week',
                            isactive: true,
                            createdby: 'Admin',
                            createdon: '2025-08-20',
                            updatedby: 'Admin',
                            updatedon: '2025-08-21',
                            department: 'Executive',
                            seniority: 'CEO',
                            status: 'Closed'
                        }
                    ];
                    setLeads(mockLeads);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Failed to fetch leads:', error);
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    // Filter leads based on search term and filters
    const filteredLeads = useMemo(() => {
        if (!leads.length) return [];

        return leads.filter(lead => {
            const matchesSearch =
                lead.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.jobtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filters.status === 'all' || lead.status === filters.status;
            const matchesIndustry = filters.industry === 'all' || lead.industry === filters.industry;
            const matchesCountry = filters.country === 'all' || lead.country === filters.country;

            return matchesSearch && matchesStatus && matchesIndustry && matchesCountry;
        });
    }, [leads, searchTerm, filters]);

    // Sort leads
    const sortedLeads = useMemo(() => {
        if (!sortConfig.key) return filteredLeads;

        return [...filteredLeads].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
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

    const handleBulkAction = (action) => {
        switch (action) {
            case 'export':
                exportToCSV(selectedLeads);
                break;
            case 'delete':
                if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
                    // API call to delete leads
                    setLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.id)));
                    setSelectedLeads([]);
                }
                break;
            case 'archive':
                if (window.confirm(`Are you sure you want to archive ${selectedLeads.length} leads?`)) {
                    // API call to archive leads
                    setSelectedLeads([]);
                }
                break;
            default:
                break;
        }
        setShowActionMenu(null);
    };

    const exportToCSV = (leadIds = []) => {
        const dataToExport = leadIds.length
            ? leads.filter(lead => leadIds.includes(lead.id))
            : filteredLeads;

        // Get all possible headers from the first lead object
        const allHeaders = leads.length > 0 ? Object.keys(leads[0]) : [];

        const csvContent = [
            allHeaders.join(','),
            ...dataToExport.map(lead =>
                allHeaders.map(header => {
                    const value = lead[header];
                    // Handle values that might contain commas or quotes
                    if (value === null || value === undefined) return '""';
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Process CSV import
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvData = event.target.result;
                // Parse CSV and add to leads
                const lines = csvData.split('\n');
                const headers = lines[0].split(',').map(header => header.trim());

                const importedLeads = lines.slice(1).map(line => {
                    const values = line.split(',').map(value =>
                        value.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
                    );

                    const lead = {};
                    headers.forEach((header, index) => {
                        lead[header] = values[index] || '';
                    });
                    return lead;
                }).filter(lead => lead.id); // Filter out empty rows

                // Add imported leads to existing leads
                setLeads(prev => [...prev, ...importedLeads]);
                alert(`Successfully imported ${importedLeads.length} leads`);
            };
            reader.readAsText(file);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get unique values for filter dropdowns
    const industries = useMemo(() => {
        const uniqueIndustries = [...new Set(leads.map(lead => lead.industry))].filter(Boolean);
        return ['all', ...uniqueIndustries];
    }, [leads]);

    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(leads.map(lead => lead.country))].filter(Boolean);
        return ['all', ...uniqueCountries];
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
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Closed">Closed</option>
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
                                <FiMoreVertical size={16} />
                                Actions
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
                                        onClick={() => handleSort('fullname')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Full Name</span>
                                            {sortConfig.key === 'fullname' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.jobtitle && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('jobtitle')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Job Title</span>
                                            {sortConfig.key === 'jobtitle' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.company && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('company')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Company</span>
                                            {sortConfig.key === 'company' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.email && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('email')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Email</span>
                                            {sortConfig.key === 'email' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.companyphonenumber && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('companyphonenumber')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Company Phone</span>
                                            {sortConfig.key === 'companyphonenumber' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.city && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('city')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>City</span>
                                            {sortConfig.key === 'city' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.state && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('state')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>State</span>
                                            {sortConfig.key === 'state' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.country && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('country')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Country</span>
                                            {sortConfig.key === 'country' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.industry && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('industry')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Industry</span>
                                            {sortConfig.key === 'industry' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.employeesize && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('employeesize')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Employee Size</span>
                                            {sortConfig.key === 'employeesize' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.department && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('department')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Department</span>
                                            {sortConfig.key === 'department' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.seniority && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('seniority')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Seniority</span>
                                            {sortConfig.key === 'seniority' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.status && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Status</span>
                                            {sortConfig.key === 'status' && (
                                                sortConfig.direction === 'ascending' ?
                                                    <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.createdon && (
                                    <th
                                        className={styles.sortableHeader}
                                        onClick={() => handleSort('createdon')}
                                    >
                                        <div className={styles.headerContent}>
                                            <span>Created On</span>
                                            {sortConfig.key === 'createdon' && (
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
                                                        {lead.firstname?.[0]}{lead.lastname?.[0]}
                                                    </div>
                                                    <div className={styles.leadName}>{lead.fullname}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.jobtitle && <td>{lead.jobtitle}</td>}
                                        {columnVisibility.company && <td>{lead.company}</td>}
                                        {columnVisibility.email && <td>{lead.email}</td>}
                                        {columnVisibility.companyphonenumber && <td>{lead.companyphonenumber}</td>}
                                        {columnVisibility.city && <td>{lead.city}</td>}
                                        {columnVisibility.state && <td>{lead.state}</td>}
                                        {columnVisibility.country && <td>{lead.country}</td>}
                                        {columnVisibility.industry && <td>{lead.industry}</td>}
                                        {columnVisibility.employeesize && <td>{lead.employeesize}</td>}
                                        {columnVisibility.department && <td>{lead.department}</td>}
                                        {columnVisibility.seniority && <td>{lead.seniority}</td>}

                                        {columnVisibility.status && (
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[lead.status?.toLowerCase()]}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                        )}

                                        {columnVisibility.createdon && <td>{formatDate(lead.createdon)}</td>}

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