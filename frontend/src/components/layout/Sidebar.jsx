import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Shield,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

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
    path: '/interviews',
    label: 'Interviews',
    icon: MessageSquare,
    description: 'Qualitative evidence'
  },
  {
    path: '/controls',
    label: 'Annex A Controls',
    icon: Shield,
    description: 'ISO 27001 controls'
  },
  {
    path: '/soa',
    label: 'SOA Generator',
    icon: FileCheck,
    description: 'Statement of Applicability'
  },
  {
    path: '/gaps',
    label: 'Gap Analysis',
    icon: AlertTriangle,
    description: 'Recommendations'
  }
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-[calc(100vh-4rem)] fixed top-16 left-0 bg-white/80 backdrop-blur-glass border-r border-gray-200/50 overflow-y-auto">
      <nav className="p-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-start gap-4 p-3 rounded-lg transition-all duration-200 border ${
                isActive
                  ? 'bg-cyan/8 border-cyan/35 text-gray-900 shadow-soft'
                  : 'border-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`flex-shrink-0 mt-0.5 transition-colors ${
                    isActive ? 'text-cyan' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="text-sm font-medium leading-tight">{item.label}</div>
                  <div className="text-xs text-gray-400 leading-tight font-normal">{item.description}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
