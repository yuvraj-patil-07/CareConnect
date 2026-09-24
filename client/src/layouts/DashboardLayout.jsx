import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '@/components/navigation/Sidebar.jsx';
import DashboardNavbar from '@/components/navigation/DashboardNavbar.jsx';
import { setMobileSidebar } from '@/store/slices/uiSlice.js';

export default function DashboardLayout({ role }) {
  const { mobileSidebarOpen, darkMode } = useSelector((s) => s.ui);
  const dispatch = useDispatch();

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-dark-950 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => dispatch(setMobileSidebar(false))}
        />
      )}

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
