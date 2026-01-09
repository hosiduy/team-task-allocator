import { useState, useEffect } from 'react';
import type { SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';

interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  globalFilter: string;
}

const DEFAULT_STATE: TableState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  globalFilter: ''
};

export function useTableState(storageKey: string) {
  // Load initial state from localStorage
  const loadState = (): TableState => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load table state:', error);
    }
    return DEFAULT_STATE;
  };

  const initialState = loadState();

  const [sorting, setSorting] = useState<SortingState>(initialState.sorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState.columnFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState.columnVisibility);
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: TableState = {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save table state:', error);
    }
  }, [storageKey, sorting, columnFilters, columnVisibility, globalFilter]);

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    globalFilter,
    setGlobalFilter
  };
}
