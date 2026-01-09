import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, HelpCircle } from 'lucide-react';
import type { Header } from '@tanstack/react-table';

interface TableHeaderCellProps<T> {
  header: Header<T, unknown>;
  tooltip?: string;
}

export function TableHeaderCell<T>({ header, tooltip }: TableHeaderCellProps<T>) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const canSort = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted();

  const handleSort = () => {
    if (canSort) {
      header.column.toggleSorting();
    }
  };

  // Get header label from meta if available, otherwise use default
  const headerLabel = (header.column.columnDef.meta as any)?.headerLabel || 
    (typeof header.column.columnDef.header === 'function'
      ? header.column.columnDef.header(header.getContext())
      : header.column.columnDef.header);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSort}
        disabled={!canSort}
        className={`flex items-center gap-1 ${canSort ? 'cursor-pointer hover:text-blue-600' : ''}`}
      >
        {headerLabel}
        
        {canSort && (
          <span className="text-gray-400">
            {sortDirection === 'asc' && <ArrowUp size={14} />}
            {sortDirection === 'desc' && <ArrowDown size={14} />}
            {!sortDirection && <ArrowUpDown size={14} />}
          </span>
        )}
      </button>

      {tooltip && (
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <HelpCircle size={14} />
          </button>
          
          {showTooltip && (
            <div className="absolute left-0 top-full mt-1 z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
              {tooltip}
              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
