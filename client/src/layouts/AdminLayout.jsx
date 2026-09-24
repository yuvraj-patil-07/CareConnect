import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/navigation/AdminSidebar.jsx';
import DashboardNavbar from '@/components/navigation/DashboardNavbar.jsx';
import { useSelector } from 'react-redux';

export default function AdminLayout() {
  const { darkMode } = useSelector((s) => s.ui);
  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-dark-950 ${darkMode ? 'dark' : ''}`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardNavbar isAdmin />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
