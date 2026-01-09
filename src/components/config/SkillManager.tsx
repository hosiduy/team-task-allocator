import { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { syncSkills, syncTaskComplexity } from '../../services/calculationService';
import type { SkillMeta } from '../../types';

export function SkillManager() {
  const { state, dispatch } = useStorage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SkillMeta | null>(null);

  const handleAdd = () => {
    const newSkill: SkillMeta = {
      id: crypto.randomUUID(),
      name: '',
      shortName: '',
      csvColumnName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setEditingId(newSkill.id);
    setEditForm(newSkill);
    dispatch({ type: 'ADD_SKILL_META', payload: newSkill });
  };

  const handleEdit = (skill: SkillMeta) => {
    setEditingId(skill.id);
    setEditForm({ ...skill });
  };

  const handleSave = () => {
    if (editForm) {
      const updated = {
        ...editForm,
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: 'UPDATE_SKILL_META', payload: updated });
      
      // Sync members and tasks with updated skills
      const syncedMembers = syncSkills(state.members, state.skillMeta);
      dispatch({ type: 'SET_MEMBERS', payload: syncedMembers });
      
      const syncedTasks = syncTaskComplexity(state.tasks, state.skillMeta);
      dispatch({ type: 'SET_TASKS', payload: syncedTasks });
      
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    // If it's a new skill with empty name, delete it
    if (editForm && !editForm.name) {
      dispatch({ type: 'DELETE_SKILL_META', payload: editForm.id });
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (skillId: string) => {
    const skill = state.skillMeta.find(s => s.id === skillId);
    if (!skill) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa kỹ năng "${skill.name}"?\n\nThao tác này sẽ xóa kỹ năng khỏi tất cả thành viên và công việc.`)) {
      // Remove skill from all members
      const updatedMembers = state.members.map(member => {
        const { [skillId]: _, ...remainingSkills } = member.skills;
        return {
          ...member,
          skills: remainingSkills,
          updatedAt: new Date().toISOString()
        };
      });
      dispatch({ type: 'SET_MEMBERS', payload: updatedMembers });
      
      // Remove skill from all tasks
      const updatedTasks = state.tasks.map(task => {
        const { [skillId]: _, ...remainingComplexity } = task.complexity;
        return {
          ...task,
          complexity: remainingComplexity,
          updatedAt: new Date().toISOString()
        };
      });
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      // Delete skill meta
      dispatch({ type: 'DELETE_SKILL_META', payload: skillId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý Kỹ năng</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus size={16} className="mr-2" />
          Thêm kỹ năng
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tên đầy đủ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tên ngắn</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mô tả (Member)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mô tả (Task)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tên cột CSV</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {state.skillMeta.map(skill => (
              <tr key={skill.id} className="hover:bg-gray-50">
                {editingId === skill.id && editForm ? (
                  <>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Ví dụ: Requirement Elicitation"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.shortName}
                        onChange={e => setEditForm({ ...editForm, shortName: e.target.value })}
                        placeholder="Ví dụ: Req"
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.memberDescription || ''}
                        onChange={e => setEditForm({ ...editForm, memberDescription: e.target.value })}
                        placeholder="Mô tả cho bảng Member"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.taskDescription || ''}
                        onChange={e => setEditForm({ ...editForm, taskDescription: e.target.value })}
                        placeholder="Mô tả cho bảng Task"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.csvColumnName}
                        onChange={e => setEditForm({ ...editForm, csvColumnName: e.target.value })}
                        placeholder="Tên cột trong CSV"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>Lưu</Button>
                        <Button size="sm" variant="secondary" onClick={handleCancel}>Hủy</Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{skill.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        {skill.shortName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{skill.memberDescription || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{skill.taskDescription || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{skill.csvColumnName}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.skillMeta.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có kỹ năng. Hãy import file CSV để tự động phát hiện kỹ năng hoặc thêm thủ công.
        </div>
      )}
    </div>
  );
}
