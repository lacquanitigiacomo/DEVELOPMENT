import { Link } from 'react-router-dom';
import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ryb-500 font-bold text-xl">
          <Wallet size={24} />
          RYB
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
          <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-ryb-600 hover:bg-ryb-700 rounded-lg text-white transition">
            Registrati
          </Link>
        </div>

        <button className="md:hidden text-gray-300" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-800 px-4 py-4 space-y-3 bg-gray-900">
          <Link to="/dashboard" className="block text-gray-300" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/login" className="block text-gray-300" onClick={() => setOpen(false)}>Login</Link>
          <Link to="/register" className="block text-ryb-500" onClick={() => setOpen(false)}>Registrati</Link>
        </div>
      )}
    </nav>
  );
}
