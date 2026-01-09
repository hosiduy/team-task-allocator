
import { Users, ClipboardList, Settings, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';

export function StatsOverview() {
  const { state } = useStorage();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Thành viên',
      value: state.members.length,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      path: '/members'
    },
    {
      label: 'Công việc',
      value: state.tasks.length,
      icon: ClipboardList,
      color: 'bg-emerald-50 text-emerald-600',
      path: '/tasks'
    },
    {
      label: 'Kỹ năng',
      value: state.skillMeta.length,
      icon: Database,
      color: 'bg-purple-50 text-purple-600',
      path: '/config'
    },
    {
      label: 'Quy tắc',
      value: state.configRules.length,
      icon: Settings,
      color: 'bg-amber-50 text-amber-600',
      path: '/config'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <button
            key={stat.label}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer text-left w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
