import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  startItem,
  endItem,
  totalItems,
  setCurrentPage,
  setItemsPerPage,
  styles
}) => {
  // Generate page numbers array
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
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
          <option value={50000}>50000 per page</option>
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
  );
};

export default Pagination;