import { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { useTableState } from '../../hooks/useTableState';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StatusBadge } from '../common/StatusBadge';
import { Plus, Trash2, Search, Eye, User } from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { MemberProfileModal } from '../members/MemberProfileModal';
import { ColumnVisibility } from '../table/ColumnVisibility';
import { TableFilter } from '../table/TableFilter';
import { TableHeaderCell } from '../table/TableHeaderCell';
import { calculateTaskData } from '../../services/calculationService';
import type { Task, ComputedTaskData } from '../../types';
import {
  useReactTable,
  getCoreRowModel,    
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';

type TaskWithComputed = Task & { computed: ComputedTaskData };

export function TaskGrid() {
  const { state, dispatch } = useStorage();
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    globalFilter,
    setGlobalFilter
  } = useTableState('taskGridState');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);

  const columnHelper = createColumnHelper<TaskWithComputed>();

  // Calculate computed data for all tasks
  const tasksWithComputed: TaskWithComputed[] = useMemo(() => {
    const allTasks = state.tasks.map(task => ({
      ...task,
      computed: calculateTaskData(task, state.members, state.configRules, state.skillMeta)
    }));
    
    // Filter by completion status
    return showCompleted ? allTasks : allTasks.filter(t => !t.completed);
  }, [state.tasks, state.members, state.configRules, state.skillMeta, showCompleted]);

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

  const handleToggleComplete = (task: Task) => {
    const updated: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_TASK', payload: updated });
  };

  const handleAddTask = () => {
    setShowCreateModal(true);
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
        cell: ({ getValue }) => {
          const link = getValue();
          if (!link) return '—';
          const fullUrl = link.startsWith('http') ? link : `https://xperc.xcorp.app/en/task-mgmt/tasks/${link}`;
          return (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {link}
            </a>
          );
        }
      })
    ];

    // Add complexity columns dynamically
    const complexityColumns = state.skillMeta.map(skill =>
      columnHelper.display({
        id: `complexity_${skill.id}`,
        header: ({ header }) => (
          <TableHeaderCell 
            header={header} 
            tooltip={skill.taskDescription}
          />
        ),
        meta: {
          headerLabel: skill.shortName
        },
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
          const assigneeName = getValue();
          
          if (isEditing) {
            return (
              <select
                defaultValue={assigneeName}
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
            <div className="flex items-center gap-2">
              <div
                className="cursor-pointer hover:bg-gray-50 p-2 rounded flex-1"
                onClick={() => setEditingCell({ taskId: row.original.id, field: 'assignee' })}
              >
                {assigneeName || '—'}
              </div>
              {assigneeName && (
                <button
                  onClick={() => setSelectedMemberName(assigneeName)}
                  className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                  title="Xem profile"
                >
                  <User size={16} />
                </button>
              )}
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
        cell: ({ row }) => {
          const isEditing = editingCell?.taskId === row.original.id && editingCell.field === 'reviewer';
          // Prioritize manual reviewer over computed
          const currentReviewer = row.original.reviewer || row.original.computed.reviewer || '';
          
          if (isEditing) {
            return (
              <select
                defaultValue={currentReviewer}
                onBlur={(e) => {
                  handleUpdate(row.original, 'reviewer', e.target.value);
                  setEditingCell(null);
                }}
                onChange={(e) => {
                  handleUpdate(row.original, 'reviewer', e.target.value);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
                autoFocus
                className="w-full p-1 border rounded"
              >
                <option value="">-- Chọn reviewer --</option>
                {state.members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            );
          }
          
          return (
            <div className="flex items-center gap-2">
              <div
                className="cursor-pointer hover:bg-gray-50 p-2 rounded flex-1"
                onClick={() => setEditingCell({ taskId: row.original.id, field: 'reviewer' })}
              >
                {currentReviewer || '—'}
              </div>
              {currentReviewer && (
                <button
                  onClick={() => setSelectedMemberName(currentReviewer)}
                  className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                  title="Xem profile"
                >
                  <User size={16} />
                </button>
              )}
            </div>
          );
        }
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
        header: 'Review Status',
        cell: ({ row }) => {
          const matching = row.original.computed.reviewerMatching;
          if (!matching) return <span className="text-gray-400">—</span>;
          
          if (matching === '✅ Hợp lệ') {
            return <span className="text-emerald-600 font-medium">{matching}</span>;
          }
          if (matching === '❌ Không hợp lệ') {
            return <span className="text-red-600 font-medium">{matching}</span>;
          }
          if (matching === '⚠️ Thiếu reviewer') {
            return <span className="text-amber-600 font-medium">{matching}</span>;
          }
          return <span className="text-gray-400">{matching}</span>;
        }
      })
    ];

    // Add actions column
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleComplete(row.original)}
            className={`p-1 rounded ${
              row.original.completed 
                ? 'text-gray-600 hover:bg-gray-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={row.original.completed ? 'Mở lại' : 'Hoàn thành'}
          >
            {row.original.completed ? '↺' : '✓'}
          </button>
          <button
            onClick={() => setSelectedTask(row.original)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
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
      columnVisibility,
      globalFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    enableFilters: true,
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
      <div className="flex gap-4 items-center">
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
        
        {/* Show Completed Toggle */}
        <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Hiện đã hoàn thành</span>
        </label>
        
        <TableFilter table={table} />
        <ColumnVisibility table={table} />
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
      {tasksWithComputed.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Hiển thị {table.getRowModel().rows.length} / {table.getFilteredRowModel().rows.length} công việc
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Số dòng:</label>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                ««
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ‹
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                ›
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                »»
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Member Profile Modal */}
      {selectedMemberName && (() => {
        const member = state.members.find(m => m.name === selectedMemberName);
        return member ? (
          <MemberProfileModal
            member={member}
            skillMeta={state.skillMeta}
            onClose={() => setSelectedMemberName(null)}
          />
        ) : null;
      })()}
    </div>
  );
}
