const API_BASE = '/api/prospects';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

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

  return await response.json();
};

// Prospect CRUD operations
export const fetchProspectsAPI = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  return await apiCall(`?${queryParams}`);
};

export const fetchLookupDataAPI = async () => {
  return await apiCall('/lookup/data');
};

export const createProspectAPI = async (prospectData) => {
  return await apiCall('', {
    method: 'POST',
    body: JSON.stringify(prospectData),
  });
};

export const bulkDeleteProspectsAPI = async (ids) => {
  return await apiCall('/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

// Export functions
export const exportToCSVAPI = async (leadIds = []) => {
  const token = localStorage.getItem('token');
  const url = leadIds.length > 0
    ? `${API_BASE}/export/csv?ids=${leadIds.join(',')}`
    : `${API_BASE}/export/csv`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Export failed');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `prospects_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Import functions
export const handleImportAPI = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/import/csv`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (parseError) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const downloadTemplateAPI = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/import/template`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download template');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'prospects_import_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};