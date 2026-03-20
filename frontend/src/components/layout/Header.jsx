import { LogOut, User, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import { useSidebar } from '../../contexts/SidebarContext';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { toggleChat } = useChatStore();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-glass border-b border-gray-200/50">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleSidebar}
            className="flex items-center text-[28px] font-semibold tracking-tight leading-none cursor-pointer hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded px-2 py-1"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="text-gray-900">Skrip</span>
            <span className="text-cyan-600">si</span>
          </button>
          <div className="h-6 w-px bg-gray-300/50" />
          <div className="text-sm text-gray-500 font-normal">
            ISO 27001 Compliance Management System
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <User size={18} className="text-gray-600" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={toggleChat}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg border border-gray-200 hover:border-cyan-200 hover:scale-105 active:scale-95 transition-all duration-200"
            title="AI Assistant"
          >
            <Bot size={18} />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
