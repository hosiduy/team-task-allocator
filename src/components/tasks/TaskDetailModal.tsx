import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { useStorage } from '../../context/StorageContext';
import { calculateTaskData } from '../../services/calculationService';
import type { Task, ComputedTaskData } from '../../types';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  const { state, updateTask } = useStorage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: task.name,
    link: task.link,
    finalSP: task.finalSP,
    assignee: task.assignee,
    complexity: { ...task.complexity }
  });

  // Recalculate computed data when form changes
  const assignedMember = state.members.find(m => m.name === formData.assignee);
  const assigneeLevel = state.configRules.find(r => r.levelName === assignedMember?.currentLevel);
  
  const tempTask: Task = {
    ...task,
    ...formData
  };
  
  const computed: ComputedTaskData | null = assignedMember && assigneeLevel
    ? calculateTaskData(
        tempTask,
        state.members,
        state.configRules,
        state.skillMeta
      )
    : null;

  useEffect(() => {
    setFormData({
      name: task.name,
      link: task.link,
      finalSP: task.finalSP,
      assignee: task.assignee,
      complexity: { ...task.complexity }
    });
    setIsEditing(false);
  }, [task]);

  const handleSave = () => {
    updateTask(task.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: task.name,
      link: task.link,
      finalSP: task.finalSP,
      assignee: task.assignee,
      complexity: { ...task.complexity }
    });
    setIsEditing(false);
  };

  const handleComplexityChange = (skillId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      complexity: {
        ...prev.complexity,
        [skillId]: Math.max(0, Math.min(5, value))
      }
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center justify-between">
          <span>Task Details</span>
          {!isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          {isEditing ? (
            <>
              <Input
                label="Task Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Link/Jira Key"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              />
              <Input
                label="Story Points"
                type="number"
                value={formData.finalSP}
                onChange={(e) => setFormData(prev => ({ ...prev, finalSP: parseFloat(e.target.value) || 0 }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {state.members.map(member => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Task Name</label>
                <p className="text-sm font-medium text-gray-900">{formData.name}</p>
              </div>
              {formData.link && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                  <p className="text-sm text-blue-600">{formData.link}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Story Points</label>
                  <p className="text-sm font-medium text-gray-900">{formData.finalSP}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
                  <p className="text-sm font-medium text-gray-900">{formData.assignee}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Computed Fields (Read-only) */}
        {computed && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Calculated Values</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Complexity</label>
                <p className="text-sm font-bold text-purple-600">{computed.maxComplexity}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Suitability Score</label>
                <p className={`text-sm font-bold ${computed.suitabilityScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {computed.suitabilityScore}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <StatusBadge status={computed.status} />
            </div>

            {computed.skillGaps.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Skill Gaps</label>
                <div className="flex flex-wrap gap-1">
                  {computed.skillGaps.map((gap, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {computed.reviewer && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Suggested Reviewer</label>
                <p className="text-sm font-medium text-gray-900">{computed.reviewer}</p>
              </div>
            )}

            {computed.reviewFocus && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Review Focus</label>
                <p className="text-sm text-gray-700">{computed.reviewFocus}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reviewer Matching</label>
              <p className={`text-sm font-medium ${computed.reviewerMatching === '✅ Hợp lệ' ? 'text-emerald-600' : 'text-gray-400'}`}>
                {computed.reviewerMatching}
              </p>
            </div>
          </div>
        )}

        {/* Complexity Requirements */}
        <div className="border-t pt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Complexity Requirements {isEditing ? '(Editable)' : ''}
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {state.skillMeta.map(skill => (
              <div key={skill.id} className="flex items-center gap-2">
                <label className="text-sm text-gray-700 min-w-0 flex-1">
                  {skill.shortName}
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.complexity[skill.id] || 0}
                    onChange={(e) => handleComplexityChange(skill.id, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span className="w-16 text-center text-sm font-medium text-gray-900">
                    {formData.complexity[skill.id] || 0}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
