import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useStorage } from '../../context/StorageContext';
import type { Task } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { state, addTask } = useStorage();
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    finalSP: 0,
    assignee: ''
  });
  const [complexity, setComplexity] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize complexity from SkillMeta
  React.useEffect(() => {
    const initialComplexity: Record<string, number> = {};
    state.skillMeta.forEach(skill => {
      initialComplexity[skill.id] = 0;
    });
    setComplexity(initialComplexity);
  }, [state.skillMeta]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      link: formData.link.trim(),
      finalSP: formData.finalSP,
      assignee: formData.assignee,
      complexity
    };

    addTask(newTask);
    
    // Reset form
    setFormData({ name: '', link: '', finalSP: 0, assignee: '' });
    const resetComplexity: Record<string, number> = {};
    state.skillMeta.forEach(skill => {
      resetComplexity[skill.id] = 0;
    });
    setComplexity(resetComplexity);
    setErrors({});
    onClose();
  };

  const handleComplexityChange = (skillId: string, value: number) => {
    setComplexity(prev => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(5, value))
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />

        <Input
          label="Link/Jira Key"
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          placeholder="e.g., XCOR-18024"
        />

        <Input
          label="Story Points"
          type="number"
          min="0"
          value={formData.finalSP}
          onChange={(e) => setFormData(prev => ({ ...prev, finalSP: parseFloat(e.target.value) || 0 }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.assignee}
            onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Assignee</option>
            {state.members.map(member => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.assignee && (
            <p className="mt-1 text-sm text-red-600">{errors.assignee}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complexity Requirements (0-5)
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {state.skillMeta.map(skill => (
              <div key={skill.id} className="flex items-center gap-2">
                <label className="text-sm text-gray-700 min-w-0 flex-1">
                  {skill.shortName}
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={complexity[skill.id] || 0}
                  onChange={(e) => handleComplexityChange(skill.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
