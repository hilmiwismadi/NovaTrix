import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="ml-60 mt-16 p-8 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
