import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-wrapper">
      <div>
        Showing page <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{page}</span> of{' '}
        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{totalPages}</span> ({total} items total)
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
