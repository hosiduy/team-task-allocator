import { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { ConfigRule } from '../../types';

export function LevelRulesTable() {
  const { state, dispatch } = useStorage();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ConfigRule | null>(null);

  const handleAdd = () => {
    const levelId = state.configRules.length > 0 
      ? Math.max(...state.configRules.map(r => r.levelId)) + 1 
      : 1;
    
    const newRule: ConfigRule = {
      levelId,
      levelName: '',
      maxSPSelf: 0,
      reviewAuthority: 0
    };
    
    setEditingId(levelId);
    setEditForm(newRule);
    dispatch({ type: 'ADD_CONFIG_RULE', payload: newRule });
  };

  const handleEdit = (rule: ConfigRule) => {
    setEditingId(rule.levelId);
    setEditForm({ ...rule });
  };

  const handleSave = () => {
    if (editForm) {
      dispatch({ type: 'UPDATE_CONFIG_RULE', payload: editForm });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (levelId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) {
      dispatch({ type: 'DELETE_CONFIG_RULE', payload: levelId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quy tắc cấp độ</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus size={16} className="mr-2" />
          Thêm quy tắc
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Level ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Level Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Max SP Self</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Review Authority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {state.configRules.map(rule => (
              <tr key={rule.levelId} className="hover:bg-gray-50">
                {editingId === rule.levelId && editForm ? (
                  <>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={editForm.levelId}
                        onChange={e => setEditForm({ ...editForm, levelId: parseInt(e.target.value) })}
                        disabled
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editForm.levelName}
                        onChange={e => setEditForm({ ...editForm, levelName: e.target.value })}
                        placeholder="Ví dụ: Junior, Senior..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={0}
                        value={editForm.maxSPSelf}
                        onChange={e => setEditForm({ ...editForm, maxSPSelf: parseFloat(e.target.value) })}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={0}
                        value={editForm.reviewAuthority}
                        onChange={e => setEditForm({ ...editForm, reviewAuthority: parseFloat(e.target.value) })}
                        className="w-24"
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
                    <td className="px-4 py-3 text-sm text-gray-900">{rule.levelId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{rule.levelName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rule.maxSPSelf}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rule.reviewAuthority}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.levelId)}
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

      {state.configRules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có quy tắc. Hãy import file CSV hoặc thêm thủ công.
        </div>
      )}
    </div>
  );
}
