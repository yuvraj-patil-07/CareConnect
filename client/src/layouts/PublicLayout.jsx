import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar.jsx';
import Footer from '@/components/navigation/Footer.jsx';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
