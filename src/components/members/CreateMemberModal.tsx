import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useStorage } from '../../context/StorageContext';
import type { Member } from '../../types';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMemberModal({ isOpen, onClose }: CreateMemberModalProps) {
  const { state, addMember } = useStorage();
  const [formData, setFormData] = useState({
    name: '',
    currentLevel: '',
    lastReviewDate: ''
  });
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize skills from SkillMeta
  React.useEffect(() => {
    const initialSkills: Record<string, number> = {};
    state.skillMeta.forEach(skill => {
      initialSkills[skill.id] = 0;
    });
    setSkills(initialSkills);
  }, [state.skillMeta]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.currentLevel) {
      newErrors.currentLevel = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const newMember: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      currentLevel: formData.currentLevel,
      lastReviewDate: formData.lastReviewDate,
      skills
    };

    addMember(newMember);
    
    // Reset form
    setFormData({ name: '', currentLevel: '', lastReviewDate: '' });
    const resetSkills: Record<string, number> = {};
    state.skillMeta.forEach(skill => {
      resetSkills[skill.id] = 0;
    });
    setSkills(resetSkills);
    setErrors({});
    onClose();
  };

  const handleSkillChange = (skillId: string, value: number) => {
    setSkills(prev => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(5, value))
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.currentLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Level</option>
            {state.configRules
              .sort((a, b) => a.levelId - b.levelId)
              .map(rule => (
                <option key={rule.levelId} value={rule.levelName}>
                  {rule.levelName}
                </option>
              ))}
          </select>
          {errors.currentLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.currentLevel}</p>
          )}
        </div>

        <Input
          label="Last Review Date"
          type="date"
          value={formData.lastReviewDate}
          onChange={(e) => setFormData(prev => ({ ...prev, lastReviewDate: e.target.value }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills (0-5)
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
                  value={skills[skill.id] || 0}
                  onChange={(e) => handleSkillChange(skill.id, parseInt(e.target.value) || 0)}
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
            Create Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
