import React, { useState } from 'react';
import { StorageProvider } from './context/StorageContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { MemberTable } from './components/members/MemberTable';
import { TaskGrid } from './components/tasks/TaskGrid';
import { ConfigPanel } from './components/config/ConfigPanel';
import { Home, Users, ClipboardList, Settings } from 'lucide-react';
import './index.css';

type Page = 'dashboard' | 'members' | 'tasks' | 'config';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigation = [
    { id: 'dashboard' as Page, name: 'Dashboard', icon: Home },
    { id: 'members' as Page, name: 'Thành viên', icon: Users },
    { id: 'tasks' as Page, name: 'Công việc', icon: ClipboardList },
    { id: 'config' as Page, name: 'Cấu hình', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">TTA</h1>
              </div>
              <div className="ml-6 flex space-x-4">
                {navigation.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={18} className="mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'members' && <MemberTable />}
        {currentPage === 'tasks' && <TaskGrid />}
        {currentPage === 'config' && <ConfigPanel />}
      </main>
    </div>
  );
}

function App() {
  return (
    <StorageProvider>
      <AppContent />
    </StorageProvider>
  );
}

export default App;
