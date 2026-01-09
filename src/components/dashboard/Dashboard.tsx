import React from 'react';
import { StatsOverview } from './StatsOverview';
import { ImportSection } from './ImportSection';
import { Button } from '../common/Button';
import { Download } from 'lucide-react';
import { useStorage } from '../../context/StorageContext';

export function Dashboard() {
  const { exportAll, exportToCSV } = useStorage();

  const handleExportJSON = () => {
    const data = exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tta-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (type: 'members' | 'tasks' | 'config-rules') => {
    const data = exportToCSV(type);
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tta-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Task Allocator</h1>
          <p className="mt-2 text-gray-600">Quản lý phân bổ công việc dựa trên kỹ năng</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportJSON}>
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExportCSV('members')}>
            <Download size={16} className="mr-2" />
            Export Members
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExportCSV('tasks')}>
            <Download size={16} className="mr-2" />
            Export Tasks
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExportCSV('config-rules')}>
            <Download size={16} className="mr-2" />
            Export Rules
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsOverview />

      {/* Import Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <ImportSection />
      </div>
    </div>
  );
}
