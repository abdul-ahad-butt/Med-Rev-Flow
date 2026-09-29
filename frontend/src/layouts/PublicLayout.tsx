import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
