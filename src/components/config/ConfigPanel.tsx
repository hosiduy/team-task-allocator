import React from 'react';
import { LevelRulesTable } from './LevelRulesTable';
import { SkillManager } from './SkillManager';

export function ConfigPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình Hệ thống</h2>
      </div>

      {/* Level Rules */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <LevelRulesTable />
      </div>

      {/* Skill Manager */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <SkillManager />
      </div>
    </div>
  );
}
