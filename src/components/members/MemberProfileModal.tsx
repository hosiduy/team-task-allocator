import { X } from 'lucide-react';
import type { Member, SkillMeta } from '../../types';

interface MemberProfileModalProps {
  member: Member;
  skillMeta: SkillMeta[];
  onClose: () => void;
}

export function MemberProfileModal({ member, skillMeta, onClose }: MemberProfileModalProps) {
  const skillLevelLabels = ['N/A', 'Biết', 'Hiểu', 'Vận dụng', 'Thành thạo', 'Tinh thông'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div>
            <h2 className="text-2xl font-bold text-white">{member.name}</h2>
            <p className="text-blue-100 text-sm mt-1">Level: {member.currentLevel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin cơ bản</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-600 w-40">Ngày review gần nhất:</span>
                <span className="text-gray-800">{member.lastReviewDate || 'Chưa có'}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Kỹ năng</h3>
            <div className="space-y-3">
              {skillMeta.map((skill) => {
                const level = member.skills[skill.id] || 0;
                const levelLabel = skillLevelLabels[level] || 'N/A';
                const percentage = (level / 5) * 100;

                return (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-700">{skill.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({skill.shortName})</span>
                      </div>
                      <span className={`text-sm font-semibold ${
                        level >= 4 ? 'text-green-600' : level >= 3 ? 'text-blue-600' : level >= 2 ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {levelLabel} ({level}/5)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          level >= 4 ? 'bg-green-500' : level >= 3 ? 'bg-blue-500' : level >= 2 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {skill.memberDescription && (
                      <p className="text-xs text-gray-500 italic">{skill.memberDescription}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
