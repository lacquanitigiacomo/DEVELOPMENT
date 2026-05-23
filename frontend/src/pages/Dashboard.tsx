import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, Receipt, Target, TrendingDown, Shield, FileText, Clock, AlertCircle } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const mockData = [
  { name: 'Affitto', value: 800 },
  { name: 'Cibo', value: 450 },
  { name: 'Trasporti', value: 120 },
  { name: 'Svago', value: 200 },
  { name: 'Altro', value: 150 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [workProfile, setWorkProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('ryb_token');
    if (!token) { navigate('/login'); return; }
    setUser({ name: 'Utente RYB', email: 'user@ryb.local' });

    // Fetch work profile
    fetch('http://localhost:3001/api/v1/user/work-profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setWorkProfile(data)).catch(() => {});
  }, [navigate]);

  if (!user) return <div className="text-center py-20">Caricamento...</div>;

  const needsOnboarding = !workProfile?.onboardingComplete;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <span className="text-gray-400">Benvenuto, {user.name}</span>
      </div>

      {/* Onboarding Alert */}
      {needsOnboarding && (
        <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-500" />
            <div>
              <div className="font-semibold text-amber-300">Completa il tuo profilo lavorativo</div>
              <div className="text-amber-400/70 text-sm">Serve per verificare la correttezza delle tue buste paga</div>
            </div>
          </div>
          <Link to="/onboarding" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white text-sm font-medium transition">
            Completa ora
          </Link>
        </div>
      )}

      {/* RYB Core: Payslip Audit Card */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-ryb-900/40 to-gray-900 border border-ryb-800/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="text-ryb-500" />
              Audit Buste Paga
            </h2>
            <p className="text-gray-400 text-sm mt-1">Verifica che il tuo datore di lavoro ti paghi correttamente</p>
          </div>
          <Link to="/audit/payslip" className="px-4 py-2 bg-ryb-600 hover:bg-ryb-700 rounded-lg text-white text-sm font-medium transition">
            Avvia Audit
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <FileText size={16} className="text-ryb-500" />
            CCNL: {workProfile?.ccnl ? workProfile.ccnl.replace('CCNL-', '') : '—'}
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Receipt size={16} className="text-ryb-500" />
            Buste paga: {workProfile?.hasPayslips ? '✅' : '❌'}
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={16} className="text-ryb-500" />
            Orari: {workProfile?.hasHours ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Bilancio', value: '€ 1,240', icon: <DollarSign size={20} />, color: 'text-ryb-500' },
          { label: 'Spese Mese', value: '€ 1,720', icon: <Receipt size={20} />, color: 'text-red-400' },
          { label: 'Risparmio', value: '12%', icon: <TrendingDown size={20} />, color: 'text-blue-400' },
          { label: 'Obiettivo', value: '€ 5,000', icon: <Target size={20} />, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Distribuzione Spese</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {mockData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <Link to="/audit/payslip" className="w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-left transition flex items-center gap-2">
              <Shield size={16} className="text-ryb-500" /> Verifica Busta Paga
            </Link>
            <button className="w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-left transition flex items-center gap-2">
              <Receipt size={16} className="text-blue-500" /> Scannerizza Scontrino
            </button>
            <button className="w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-left transition flex items-center gap-2">
              <FileText size={16} className="text-amber-500" /> Genera Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
