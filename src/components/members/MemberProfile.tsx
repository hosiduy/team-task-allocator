import React from 'react';
import { Modal } from '../common/Modal';
import { SkillRadarChart } from './SkillRadarChart';
import type { Member } from '../../types';
import { useStorage } from '../../context/StorageContext';

interface MemberProfileProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberProfile({ member, isOpen, onClose }: MemberProfileProps) {
  const { state } = useStorage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hồ sơ: ${member.name}`} size="lg">
      <div className="space-y-6">
        {/* General Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{member.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{member.currentLevel}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ngày đánh giá cuối</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {member.lastReviewDate || 'Chưa có'}
            </p>
          </div>
        </div>

        {/* Skills Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kỹ năng</h3>
          <div className="grid grid-cols-2 gap-4">
            {state.skillMeta.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{skill.name}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {member.skills[skill.id] || 0}/5
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ năng lực</h3>
          <SkillRadarChart member={member} />
        </div>
      </div>
    </Modal>
  );
}
