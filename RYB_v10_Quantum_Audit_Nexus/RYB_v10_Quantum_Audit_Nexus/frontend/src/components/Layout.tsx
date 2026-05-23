import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        RYB v10.0 — Are You Broke? © 2026
      </footer>
    </div>
  );
}
