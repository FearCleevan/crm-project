//src/components/LeadsManagement/Prospects.jsx
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
  FiArchive,
  FiCheckSquare,
  FiSquare
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
    name: true,
    jobTitle: true,
    company: true,
    email: true,
    phone: true,
    status: true,
    source: true,
    created: true,
    lastContact: true,
    actions: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all'
  });

  // Mock data - replace with API call
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const mockLeads = Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            name: `Lead ${i + 1}`,
            jobTitle: ['Software Engineer', 'Marketing Manager', 'Sales Director', 'Product Manager', 'CEO'][i % 5],
            company: `Company ${(i % 10) + 1}`,
            email: `lead${i + 1}@example.com`,
            phone: `+1 (555) ${100 + (i % 900)}-${1000 + (i % 9000)}`,
            status: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'][i % 5],
            source: ['Website', 'Referral', 'Social Media', 'Event', 'Cold Call'][i % 5],
            created: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            lastContact: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
          }));
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
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || lead.status === filters.status;
      const matchesSource = filters.source === 'all' || lead.source === filters.source;
      
      return matchesSearch && matchesStatus && matchesSource;
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
    
    const headers = Object.keys(dataToExport[0] || {}).filter(key => key !== 'id');
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(lead => 
        headers.map(header => `"${lead[header]}"`).join(',')
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
        console.log('Importing CSV:', csvData);
        // setLeads(prev => [...prev, ...parsedData]);
        alert('CSV import functionality would be implemented here');
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
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className={styles.filterSelect}
            >
              <option value="all">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Event">Event</option>
              <option value="Cold Call">Cold Call</option>
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
              
              {columnVisibility.name && (
                <th 
                  className={styles.sortableHeader}
                  onClick={() => handleSort('name')}
                >
                  <div className={styles.headerContent}>
                    <span>Name</span>
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'ascending' ?
                        <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                    )}
                  </div>
                </th>
              )}
              
              {columnVisibility.jobTitle && (
                <th 
                  className={styles.sortableHeader}
                  onClick={() => handleSort('jobTitle')}
                >
                  <div className={styles.headerContent}>
                    <span>Job Title</span>
                    {sortConfig.key === 'jobTitle' && (
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
              
              {columnVisibility.phone && (
                <th 
                  className={styles.sortableHeader}
                  onClick={() => handleSort('phone')}
                >
                  <div className={styles.headerContent}>
                    <span>Phone</span>
                    {sortConfig.key === 'phone' && (
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
              
              {columnVisibility.source && (
                <th 
                  className={styles.sortableHeader}
                  onClick={() => handleSort('source')}
                >
                  <div className={styles.headerContent}>
                    <span>Source</span>
                    {sortConfig.key === 'source' && (
                      sortConfig.direction === 'ascending' ?
                        <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                    )}
                  </div>
                </th>
              )}
              
              {columnVisibility.created && (
                <th 
                  className={styles.sortableHeader}
                  onClick={() => handleSort('created')}
                >
                  <div className={styles.headerContent}>
                    <span>Created</span>
                    {sortConfig.key === 'created' && (
                      sortConfig.direction === 'ascending' ?
                        <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                    )}
                  </div>
                </th>
              )}
              
              {columnVisibility.lastContact && (
                <th 
                  className={styles.sortableHeader}
                  onClick={() => handleSort('lastContact')}
                >
                  <div className={styles.headerContent}>
                    <span>Last Contact</span>
                    {sortConfig.key === 'lastContact' && (
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
                  
                  {columnVisibility.name && (
                    <td>
                      <div className={styles.leadInfo}>
                        <div className={styles.avatar}>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={styles.leadName}>{lead.name}</div>
                      </div>
                    </td>
                  )}
                  
                  {columnVisibility.jobTitle && <td>{lead.jobTitle}</td>}
                  {columnVisibility.company && <td>{lead.company}</td>}
                  {columnVisibility.email && <td>{lead.email}</td>}
                  {columnVisibility.phone && <td>{lead.phone}</td>}
                  
                  {columnVisibility.status && (
                    <td>
                      <span className={`${styles.statusBadge} ${styles[lead.status.toLowerCase()]}`}>
                        {lead.status}
                      </span>
                    </td>
                  )}
                  
                  {columnVisibility.source && <td>{lead.source}</td>}
                  {columnVisibility.created && <td>{formatDate(lead.created)}</td>}
                  {columnVisibility.lastContact && <td>{formatDate(lead.lastContact)}</td>}
                  
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