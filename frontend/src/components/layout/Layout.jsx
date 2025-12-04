import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import AIChatbot from '../chat/AIChatbot';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

function LayoutContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className={`${isCollapsed ? 'ml-20' : 'ml-60'} mt-16 p-8 min-h-[calc(100vh-4rem)] transition-all duration-300`}>
        <Outlet />
      </main>
      <AIChatbot />
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
