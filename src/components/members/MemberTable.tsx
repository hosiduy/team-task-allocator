import { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { useTableState } from '../../hooks/useTableState';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { MemberProfile } from './MemberProfile';
import { CreateMemberModal } from './CreateMemberModal';
import { SyncSkillsButton } from './SyncSkillsButton';
import { ColumnVisibility } from '../table/ColumnVisibility';
import { TableFilter } from '../table/TableFilter';
import { TableHeaderCell } from '../table/TableHeaderCell';
import type { Member } from '../../types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';

export function MemberTable() {
  const { state, dispatch } = useStorage();
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility
  } = useTableState('memberTableState');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ memberId: string; field: string } | null>(null);

  const columnHelper = createColumnHelper<Member>();

  const handleUpdate = (member: Member, field: keyof Member, value: string | number) => {
    const updated: Member = {
      ...member,
      [field]: value,
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_MEMBER', payload: updated });
  };

  const handleUpdateSkill = (member: Member, skillId: string, value: number) => {
    const updated: Member = {
      ...member,
      skills: {
        ...member.skills,
        [skillId]: value
      },
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_MEMBER', payload: updated });
  };

  const handleDelete = (memberId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      dispatch({ type: 'DELETE_MEMBER', payload: memberId });
    }
  };

  const handleAddMember = () => {
    setShowCreateModal(true);
  };

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('name', {
        header: 'Tên',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell?.memberId === row.original.id && editingCell.field === 'name';
          
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
                className="min-w-[150px]"
              />
            );
          }
          
          return (
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => setEditingCell({ memberId: row.original.id, field: 'name' })}
            >
              {getValue()}
            </div>
          );
        }
      }),
      columnHelper.accessor('currentLevel', {
        header: 'Cấp độ',
        cell: ({ row, getValue }) => {
          const isEditing = editingCell?.memberId === row.original.id && editingCell.field === 'currentLevel';
          
          if (isEditing) {
            return (
              <Input
                defaultValue={getValue()}
                onBlur={(e) => {
                  handleUpdate(row.original, 'currentLevel', e.target.value);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdate(row.original, 'currentLevel', e.currentTarget.value);
                    setEditingCell(null);
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
                autoFocus
                className="min-w-[120px]"
              />
            );
          }
          
          return (
            <div
              className="cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => setEditingCell({ memberId: row.original.id, field: 'currentLevel' })}
            >
              {getValue()}
            </div>
          );
        }
      }),
      columnHelper.accessor('lastReviewDate', {
        header: 'Ngày đánh giá cuối',
        cell: ({ getValue }) => getValue() || '—'
      })
    ];

    // Add skill columns dynamically
    const skillColumns = state.skillMeta.map(skill =>
      columnHelper.display({
        id: `skill_${skill.id}`,
        header: ({ header }) => (
          <TableHeaderCell 
            header={header} 
            tooltip={skill.memberDescription}
          />
        ),
        meta: {
          headerLabel: skill.shortName
        },
        cell: ({ row }) => {
          const isEditing = editingCell?.memberId === row.original.id && editingCell.field === `skill_${skill.id}`;
          const value = row.original.skills[skill.id] || 0;
          
          if (isEditing) {
            return (
              <Input
                type="number"
                min={0}
                max={5}
                defaultValue={value}
                onBlur={(e) => {
                  const newValue = Math.min(5, Math.max(0, parseInt(e.target.value) || 0));
                  handleUpdateSkill(row.original, skill.id, newValue);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newValue = Math.min(5, Math.max(0, parseInt(e.currentTarget.value) || 0));
                    handleUpdateSkill(row.original, skill.id, newValue);
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
              onClick={() => setEditingCell({ memberId: row.original.id, field: `skill_${skill.id}` })}
            >
              {value}/5
            </div>
          );
        }
      })
    );

    // Add actions column
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMember(row.original)}
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

    return [...baseColumns, ...skillColumns, actionsColumn];
  }, [state.skillMeta, editingCell]);

  const table = useReactTable({
    data: state.members,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    enableFilters: true,
    initialState: {
      pagination: {
        pageSize: 20
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Thành viên</h2>
        <div className="flex gap-3">
          <SyncSkillsButton />
          <Button onClick={handleAddMember} size="sm">
            <Plus size={16} className="mr-2" />
            Thêm thành viên
          </Button>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center gap-3">
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

      {state.members.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Chưa có thành viên. Hãy import file CSV hoặc thêm thủ công.
        </div>
      )}

      {/* Pagination */}
      {state.members.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Hiển thị {table.getRowModel().rows.length} / {table.getFilteredRowModel().rows.length} thành viên
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

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfile
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Create Member Modal */}
      <CreateMemberModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
