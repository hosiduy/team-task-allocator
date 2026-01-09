import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StatusBadge } from '../common/StatusBadge';
import { Plus, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateTaskData } from '../../services/calculationService';
import type { Task, ComputedTaskData } from '../../types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table';

type TaskWithComputed = Task & { computed: ComputedTaskData };

export function TaskGrid() {
  const { state, dispatch } = useStorage();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);

  const columnHelper = createColumnHelper<TaskWithComputed>();

  // Calculate computed data for all tasks
  const tasksWithComputed: TaskWithComputed[] = useMemo(() => {
    return state.tasks.map(task => ({
      ...task,
      computed: calculateTaskData(task, state.members, state.configRules, state.skillMeta)
    }));
  }, [state.tasks, state.members, state.configRules, state.skillMeta]);

  const handleUpdate = (task: Task, field: keyof Task, value: string | number) => {
    const updated: Task = {
      ...task,
      [field]: value,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_TASK', payload: updated });
  };

  const handleUpdateComplexity = (task: Task, skillId: string, value: number) => {
    const updated: Task = {
      ...task,
      complexity: {
        ...task.complexity,
        [skillId]: value
      },
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_TASK', payload: updated });
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    }
  };

  const handleAddTask = () => {
    const name = prompt('Tên công việc:');
    if (!name) return;

    const link = prompt('Link (ví dụ: XCOR-123):') || '';
    const finalSP = parseFloat(prompt('Story Points:') || '0') || 0;

    const complexity: Record<string, number> = {};
    state.skillMeta.forEach(skill => {
      complexity[skill.id] = 0;
    });

    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      link,
      finalSP,
      assignee: '',
      complexity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('name', {
        header: 'Công việc',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell?.taskId === row.original.id && editingCell.field === 'name';
          
          if (isEditing) {
            return (
              <Input
                defaultValue={getValue()}
                onBlur={(e) => {
                  handleUpdate(row.original, 'name', e.target.value);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdate(row.original, 'name', e.currentTarget.value);
                    setEditingCell(null);
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
                autoFocus
                className="min-w-[200px]"
              />
            );
          }
          
          return (
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => setEditingCell({ taskId: row.original.id, field: 'name' })}
            >
              {getValue()}
            </div>
          );
        }
      }),
      columnHelper.accessor('link', {
        header: 'Link',
        cell: ({ row, getValue }) => {
          const link = getValue();
          return link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {link}
            </a>
          ) : '—';
        }
      })
    ];

    // Add complexity columns dynamically
    const complexityColumns = state.skillMeta.map(skill =>
      columnHelper.display({
        id: `complexity_${skill.id}`,
        header: skill.shortName,
        cell: ({ row }) => {
          const isEditing = editingCell?.taskId === row.original.id && editingCell.field === `complexity_${skill.id}`;
          const value = row.original.complexity[skill.id] || 0;
          
          if (isEditing) {
            return (
              <Input
                type="number"
                min={0}
                max={5}
                defaultValue={value}
                onBlur={(e) => {
                  const newValue = Math.min(5, Math.max(0, parseInt(e.target.value) || 0));
                  handleUpdateComplexity(row.original, skill.id, newValue);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newValue = Math.min(5, Math.max(0, parseInt(e.currentTarget.value) || 0));
                    handleUpdateComplexity(row.original, skill.id, newValue);
                    setEditingCell(null);
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
                autoFocus
                className="w-16"
              />
            );
          }
          
          return (
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded text-center font-semibold"
              onClick={() => setEditingCell({ taskId: row.original.id, field: `complexity_${skill.id}` })}
            >
              {value}
            </div>
          );
        }
      })
    );

    // Add final columns
    const finalColumns = [
      columnHelper.accessor('finalSP', {
        header: 'SP',
        cell: ({ getValue }) => getValue() || 0
      }),
      columnHelper.accessor('assignee', {
        header: 'Người thực hiện',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell?.taskId === row.original.id && editingCell.field === 'assignee';
          
          if (isEditing) {
            return (
              <select
                defaultValue={getValue()}
                onBlur={(e) => {
                  handleUpdate(row.original, 'assignee', e.target.value);
                  setEditingCell(null);
                }}
                onChange={(e) => {
                  handleUpdate(row.original, 'assignee', e.target.value);
                  setEditingCell(null);
                }}
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn --</option>
                {state.members.map(member => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            );
          }
          
          return (
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => setEditingCell({ taskId: row.original.id, field: 'assignee' })}
            >
              {getValue() || '—'}
            </div>
          );
        }
      })
    ];

    // Add computed columns
    const computedColumns = [
      columnHelper.display({
        id: 'maxComplexity',
        header: 'Max',
        cell: ({ row }) => (
          <div className="text-center font-bold text-purple-600">
            {row.original.computed.maxComplexity}
          </div>
        )
      }),
      columnHelper.display({
        id: 'skillGaps',
        header: 'Lỗ hổng',
        cell: ({ row }) => {
          const gaps = row.original.computed.skillGaps;
          if (gaps.length === 0) return <span className="text-gray-400">—</span>;
          
          return (
            <div className="flex flex-wrap gap-1">
              {gaps.map((gap, idx) => (
                <span key={idx} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded">
                  {gap}
                </span>
              ))}
            </div>
          );
        }
      }),
      columnHelper.display({
        id: 'suitabilityScore',
        header: 'Điểm',
        cell: ({ row }) => {
          const score = row.original.computed.suitabilityScore;
          const color = score >= 0 ? 'text-emerald-600' : 'text-rose-600';
          return <div className={`text-center font-semibold ${color}`}>{score}</div>;
        }
      }),
      columnHelper.display({
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge status={row.original.computed.status} />
      }),
      columnHelper.display({
        id: 'reviewer',
        header: 'Reviewer',
        cell: ({ row }) => row.original.computed.reviewer || '—'
      }),
      columnHelper.display({
        id: 'reviewFocus',
        header: 'Review Focus',
        cell: ({ row }) => {
          const focus = row.original.computed.reviewFocus;
          if (!focus) return <span className="text-gray-400">—</span>;
          
          return <span className="text-sm text-blue-600">{focus}</span>;
        }
      }),
      columnHelper.display({
        id: 'reviewerMatching',
        header: 'Hợp lệ',
        cell: ({ row }) => {
          const matching = row.original.computed.reviewerMatching;
          if (matching === '✅ Hợp lệ') {
            return <span className="text-emerald-600">{matching}</span>;
          }
          return <span className="text-gray-400">{matching}</span>;
        }
      })
    ];

    // Add actions column
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
          title="Xóa"
        >
          <Trash2 size={16} />
        </button>
      )
    });

    return [...baseColumns, ...complexityColumns, ...finalColumns, ...computedColumns, actionsColumn];
  }, [state.skillMeta, state.members, editingCell]);

  const table = useReactTable({
    data: tasksWithComputed,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Công việc</h2>
        <Button onClick={handleAddTask} size="sm">
          <Plus size={16} className="mr-2" />
          Thêm công việc
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="ml-2">
                          {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tasksWithComputed.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Chưa có công việc. Hãy import file CSV hoặc thêm thủ công.
        </div>
      )}

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            {' - '}
            Tổng {table.getFilteredRowModel().rows.length} công việc
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
