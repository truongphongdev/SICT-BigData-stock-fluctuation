import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';

export default function MainLayout() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex">
      <Sidebar />
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen bg-slate-50">
        <TopHeader />
        <main className="p-6 mt-14 max-w-7xl w-full mx-auto space-y-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
