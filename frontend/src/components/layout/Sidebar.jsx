import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Bot,
  Database
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Compliance overview'
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: FileText,
    description: 'Document analysis hub'
  },
  {
    path: '/controls-new',
    label: 'SOA Generator',
    icon: FileCheck,
    description: 'Statement of Applicability'
  },
  {
    path: '/ragtest',
    label: 'RAG Test',
    icon: Bot,
    description: 'Live query debug'
  },
  {
    path: '/ragtest/data',
    label: 'RAG Test Data',
    icon: Database,
    description: 'Query run history'
  }
];

export default function Sidebar() {
  const { isCollapsed } = useSidebar();

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-60'} h-[calc(100vh-4rem)] fixed top-16 left-0 bg-white/80 backdrop-blur-glass border-r border-gray-200/50 overflow-y-auto transition-all duration-300`}>
      <nav className={`${isCollapsed ? 'p-3' : 'p-6'} flex flex-col gap-2`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex ${isCollapsed ? 'items-center justify-center' : 'items-start gap-4'} p-3 rounded-lg transition-all duration-200 border ${
                isActive
                  ? 'bg-cyan-600/8 border-cyan-600/35 text-gray-900 shadow-soft'
                  : 'border-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98]'
              }`
            }
            title={isCollapsed ? item.label : ''}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`flex-shrink-0 ${isCollapsed ? '' : 'mt-0.5'} transition-colors ${
                    isActive ? 'text-cyan-600' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="text-sm font-medium leading-tight">{item.label}</div>
                    <div className="text-xs text-gray-400 leading-tight font-normal">{item.description}</div>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
