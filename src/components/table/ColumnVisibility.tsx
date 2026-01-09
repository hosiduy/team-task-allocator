import React from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

interface ColumnVisibilityProps<T> {
  table: Table<T>;
}

export function ColumnVisibility<T>({ table }: ColumnVisibilityProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const columns = table.getAllLeafColumns().filter(col => {
    // Exclude actions column from visibility toggle
    return col.id !== 'actions';
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Eye size={16} className="mr-2" />
        View Columns
        <ChevronDown size={16} className="ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Toggle Columns
            </div>
            <div className="py-2 space-y-1">
              {columns.map((column) => {
                const isVisible = column.getIsVisible();
                // Try to get column name from meta first, then header, then id
                const columnName = (column.columnDef.meta as any)?.headerLabel ||
                  (typeof column.columnDef.header === 'string' 
                    ? column.columnDef.header 
                    : column.id);

                return (
                  <label
                    key={column.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={column.getToggleVisibilityHandler()}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 flex items-center">
                      {isVisible ? (
                        <Eye size={14} className="mr-2 text-gray-400" />
                      ) : (
                        <EyeOff size={14} className="mr-2 text-gray-400" />
                      )}
                      {columnName}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
