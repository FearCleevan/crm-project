import React from 'react';
import {
  FiChevronUp,
  FiChevronDown,
  FiEye,
  FiEdit,
  FiArchive
} from 'react-icons/fi';

const ProspectsTable = ({
  currentLeads,
  columnVisibility,
  sortConfig,
  selectedLeads,
  handleSort,
  handleSelectAll,
  handleSelectLead,
  lookupData,
  getIndustryName, // Make sure this prop is received
  styles
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const SortableHeader = ({ columnKey, children }) => (
    <th
      className={styles.sortableHeader}
      onClick={() => handleSort(columnKey)}
    >
      <div className={styles.headerContent}>
        <span>{children}</span>
        {sortConfig.key === columnKey && (
          sortConfig.direction === 'ascending' ?
            <FiChevronUp size={14} /> : <FiChevronDown size={14} />
        )}
      </div>
    </th>
  );

  return (
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
                <SortableHeader columnKey="Fullname">Full Name</SortableHeader>
              )}

              {columnVisibility.jobtitle && (
                <SortableHeader columnKey="Jobtitle">Job Title</SortableHeader>
              )}

              {columnVisibility.company && (
                <SortableHeader columnKey="Company">Company</SortableHeader>
              )}

              {columnVisibility.email && (
                <SortableHeader columnKey="Email">Email</SortableHeader>
              )}

              {columnVisibility.companyphonenumber && (
                <SortableHeader columnKey="Companyphonenumber">Company Phone</SortableHeader>
              )}

              {columnVisibility.city && (
                <SortableHeader columnKey="City">City</SortableHeader>
              )}

              {columnVisibility.state && (
                <SortableHeader columnKey="State">State</SortableHeader>
              )}

              {columnVisibility.country && (
                <SortableHeader columnKey="Country">Country</SortableHeader>
              )}

              {columnVisibility.industry && (
                <SortableHeader columnKey="Industry">Industry</SortableHeader>
              )}

              {columnVisibility.employeesize && (
                <SortableHeader columnKey="Employeesize">Employee Size</SortableHeader>
              )}

              {columnVisibility.department && (
                <SortableHeader columnKey="Department">Department</SortableHeader>
              )}

              {columnVisibility.seniority && (
                <SortableHeader columnKey="Seniority">Seniority</SortableHeader>
              )}

              {columnVisibility.status && (
                <SortableHeader columnKey="Status">Status</SortableHeader>
              )}

              {columnVisibility.createdon && (
                <SortableHeader columnKey="CreatedOn">Created On</SortableHeader>
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
                  {columnVisibility.industry && <td>{getIndustryName ? getIndustryName(lead.Industry) : lead.Industry}</td>}
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
  );
};

export default ProspectsTable;