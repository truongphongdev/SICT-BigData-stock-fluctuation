import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';

export default function MainLayout() {
  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar />
      <main className="ml-[240px] min-h-screen flex flex-col">
        <TopHeader />
        <div className="mt-16 p-6 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
