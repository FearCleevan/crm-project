import { useState, useEffect, useMemo } from 'react';
import { 
  fetchProspectsAPI, 
  fetchLookupDataAPI, 
  bulkDeleteProspectsAPI,
  exportToCSVAPI,
  handleImportAPI,
  createProspectAPI,
  downloadTemplateAPI
} from '../api/prospectsAPI';

export const useProspects = () => {
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

  // Fetch data on component mount
  useEffect(() => {
    fetchLookupData();
    fetchProspects();
  }, []);

  // Fetch prospects when pagination or filters change
  useEffect(() => {
    fetchProspects();
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  // Reset to first page when filters or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.status, filters.industry, filters.country]);

  // API Functions
  const fetchProspects = async () => {
    setLoading(true);
    try {
      const data = await fetchProspectsAPI({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: filters.status !== 'all' ? filters.status : undefined,
        industry: filters.industry !== 'all' ? filters.industry : undefined,
        country: filters.country !== 'all' ? filters.country : undefined
      });
      setLeads(data.prospects || []);
    } catch (error) {
      showNotification('Failed to load prospects: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const data = await fetchLookupDataAPI();
      setLookupData(data.data);
    } catch (error) {
      showNotification('Failed to load dropdown data: ' + error.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const data = await bulkDeleteProspectsAPI(selectedLeads);
      showNotification(`${data.message}`, 'success');
      fetchProspects();
      setSelectedLeads([]);
    } catch (error) {
      showNotification('Failed to delete prospects', 'error');
    }
  };

  const exportToCSV = async (leadIds = []) => {
    try {
      await exportToCSVAPI(leadIds);
      showNotification(`Exported ${leadIds.length || filteredLeads.length} prospects successfully`, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to export prospects', 'error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 100 * 1024 * 1024) {
      showNotification('File size too large. Maximum 100MB allowed.', 'error');
      e.target.value = '';
      return;
    }

    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      showNotification('Only CSV files are allowed.', 'error');
      e.target.value = '';
      return;
    }

    // Show processing modal
    setImportProcessing({
      isOpen: true,
      stats: {
        stage: 'preparing',
        totalRows: 0,
        validRows: 0,
        insertedRows: 0,
        errorCount: 0,
        logs: [
          { type: 'info', message: 'Starting import process...', timestamp: new Date() },
          { type: 'info', message: `Processing file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, timestamp: new Date() },
          { type: 'info', message: 'Validating file format and contents...', timestamp: new Date() }
        ],
        errors: [],
        sessionId: null
      }
    });

    try {
      const data = await handleImportAPI(file);
      // Start polling for progress (implementation would continue here)
      // ... rest of import logic
    } catch (error) {
      // Error handling
    }

    e.target.value = '';
  };

  const handleCreateProspect = async (prospectData) => {
    try {
      await createProspectAPI(prospectData);
      showNotification('Prospect created successfully', 'success');
      fetchProspects();
      return true;
    } catch (error) {
      showNotification(error.message || 'Failed to create prospect', 'error');
      throw error;
    }
  };

  const downloadTemplate = async () => {
    try {
      await downloadTemplateAPI();
      showNotification('Template downloaded successfully', 'success');
    } catch (error) {
      showNotification('Failed to download template', 'error');
    }
  };

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

  const handleConfirmedAction = async () => {
    if (confirmationModal.action === 'delete') {
      await handleBulkDelete();
    }
    setConfirmationModal({ show: false, action: null, message: '', count: 0 });
  };

  // Data processing
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === '' ||
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

  const currentLeads = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedLeads.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage, sortedLeads]);

  // Helper functions
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const getIndustryName = (industryCode) => {
    const industry = lookupData.industries?.find(ind => ind.IndustryCode === industryCode);
    return industry ? industry.IndustryName : industryCode;
  };

  // Computed values
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, sortedLeads.length);
  const totalItems = sortedLeads.length;

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

  return {
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
    
    // Setters
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
    
    // Handlers
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
    getIndustryName
  };
};