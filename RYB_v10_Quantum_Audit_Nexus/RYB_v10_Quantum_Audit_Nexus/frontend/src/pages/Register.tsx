import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/v1/auth/register', { name, email, password });
      localStorage.setItem('ryb_token', res.data.token);
      navigate('/onboarding'); // New users always go to onboarding
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Crea Account</h1>
        <p className="text-gray-400 mt-2">Inizia il tuo audit finanziario con RYB</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-ryb-500 focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-ryb-500 focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-ryb-500 focus:outline-none pr-10" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-gray-500">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-ryb-600 hover:bg-ryb-700 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50">
          {loading ? '...' : <><UserPlus size={18} /> Registrati</>}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-500">
        Hai già un account? <Link to="/login" className="text-ryb-500 hover:underline">Accedi</Link>
      </p>
    </div>
  );
}
