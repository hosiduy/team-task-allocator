import React from 'react';
import { Users, ClipboardList, Settings, Database } from 'lucide-react';
import { useStorage } from '../../context/StorageContext';

export function StatsOverview() {
  const { state } = useStorage();

  const stats = [
    {
      label: 'Thành viên',
      value: state.members.length,
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Công việc',
      value: state.tasks.length,
      icon: ClipboardList,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Kỹ năng',
      value: state.skillMeta.length,
      icon: Database,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Quy tắc',
      value: state.configRules.length,
      icon: Settings,
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
