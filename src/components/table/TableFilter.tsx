import React from 'react';
import { Filter, X } from 'lucide-react';
import type { Column, Table } from '@tanstack/react-table';

interface TableFilterProps<T> {
  table: Table<T>;
}

export function TableFilter<T>({ table }: TableFilterProps<T>) {
  const [showFilters, setShowFilters] = React.useState(false);
  const hasActiveFilters = table.getState().columnFilters.length > 0;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 relative ${
          hasActiveFilters
            ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter size={16} className="mr-2" />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
            {table.getState().columnFilters.length}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {table.getAllLeafColumns().map((column) => {
              if (!column.getCanFilter() || column.id === 'actions') {
                return null;
              }

              return (
                <ColumnFilter key={column.id} column={column} />
              );
            })}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => table.resetColumnFilters()}
              className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
            >
              <X size={14} className="mr-1" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnFilter<T>({ column }: { column: Column<T, unknown> }) {
  const columnName = typeof column.columnDef.header === 'string' 
    ? column.columnDef.header 
    : column.id;

  const columnFilterValue = column.getFilterValue();

  // Determine column type based on the first non-null value
  const firstValue = column.getFacetedRowModel().flatRows[0]?.getValue(column.id);
  const isNumber = typeof firstValue === 'number';

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {columnName}
      </label>
      
      {isNumber ? (
        <div className="flex gap-2">
          <input
            type="number"
            value={((columnFilterValue as any)?.[0] ?? '') as string}
            onChange={(e) => 
              column.setFilterValue((old: any) => [e.target.value, old?.[1]])
            }
            placeholder="Min"
            className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            value={((columnFilterValue as any)?.[1] ?? '') as string}
            onChange={(e) =>
              column.setFilterValue((old: any) => [old?.[0], e.target.value])
            }
            placeholder="Max"
            className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ) : (
        <input
          type="text"
          value={(columnFilterValue ?? '') as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Filter ${columnName}...`}
          className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  );
}
