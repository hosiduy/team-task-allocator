import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { SkillRadarChart } from './SkillRadarChart';
import type { Member } from '../../types';
import { useStorage } from '../../context/StorageContext';

interface MemberProfileProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberProfile({ member, isOpen, onClose }: MemberProfileProps) {
  const { state, updateMember } = useStorage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name,
    currentLevel: member.currentLevel,
    lastReviewDate: member.lastReviewDate,
    skills: { ...member.skills }
  });

  // Create a temporary member object for the radar chart during editing
  const displayMember: Member = isEditing 
    ? { ...member, ...formData }
    : member;

  useEffect(() => {
    setFormData({
      name: member.name,
      currentLevel: member.currentLevel,
      lastReviewDate: member.lastReviewDate,
      skills: { ...member.skills }
    });
    setIsEditing(false);
  }, [member]);

  const handleSave = () => {
    updateMember(member.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: member.name,
      currentLevel: member.currentLevel,
      lastReviewDate: member.lastReviewDate,
      skills: { ...member.skills }
    });
    setIsEditing(false);
  };

  const handleSkillChange = (skillId: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
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
          <span>Hồ sơ: {formData.name}</span>
          {!isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* General Info */}
        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <Input
                label="Tên"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cấp độ
                </label>
                <select
                  value={formData.currentLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {state.configRules
                    .sort((a, b) => a.levelId - b.levelId)
                    .map(rule => (
                      <option key={rule.levelId} value={rule.levelName}>
                        {rule.levelName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-span-2">
                <Input
                  label="Ngày đánh giá cuối"
                  type="date"
                  value={formData.lastReviewDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastReviewDate: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formData.currentLevel}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ngày đánh giá cuối</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formData.lastReviewDate || 'Chưa có'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Skills Table/Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Kỹ năng {isEditing && '(0-5)'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {state.skillMeta.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{skill.name}</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.skills[skill.id] || 0}
                    onChange={(e) => handleSkillChange(skill.id, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-lg font-bold text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {formData.skills[skill.id] || 0}/5
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart - Updates in real-time during editing */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ năng lực {isEditing && '(Real-time preview)'}
          </h3>
          <SkillRadarChart member={displayMember} />
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

