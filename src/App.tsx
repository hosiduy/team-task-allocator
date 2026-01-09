import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { StorageProvider } from './context/StorageContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { MemberTable } from './components/members/MemberTable';
import { ConfigPanel } from './components/config/ConfigPanel';
import { TaskGrid } from './components/tasks/TaskGrid';
import { Home, Users, ClipboardList, Settings } from 'lucide-react';
import './index.css';

function AppContent() {
  const navigation = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/members', name: 'Thành viên', icon: Users },
    { path: '/tasks', name: 'Công việc', icon: ClipboardList },
    { path: '/config', name: 'Cấu hình', icon: Settings }
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
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) => 
                        `inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`
                      }
                    >
                      <Icon size={18} className="mr-2" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<MemberTable />} />
          <Route path="/tasks" element={<TaskGrid />} />
          <Route path="/config" element={<ConfigPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StorageProvider>
        <AppContent />
      </StorageProvider>
    </BrowserRouter>
  );
}

export default App;
