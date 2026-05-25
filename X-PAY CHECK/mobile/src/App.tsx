import { useMemo, useState } from 'react';
import { CheckCircle2, Crown, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

type AuthMode = 'login' | 'register';
type Plan = 'free' | 'pro';

function card(title: string, body: React.ReactNode) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {body}
    </section>
  );
}

function inputClass() {
  return 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500';
}

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [plan, setPlan] = useState<Plan>('free');
  const [googleAuthorized, setGoogleAuthorized] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    ccnl: '',
    contractType: '',
    level: '',
    weeklyHours: '40',
    shiftType: 'Giornaliero',
  });

  const freeFeatures = useMemo(
    () => [
      'Controlli cedolino base (lordo/netto, contributi, coerenze principali)',
      'Archivio buste paga e profilo lavoro',
      'Riepilogo anomalie essenziale',
    ],
    [],
  );

  const proFeatures = useMemo(
    () => [
      'Confronto badge-turni-cedolino',
      'Analisi narrativa avanzata e priorità critiche',
      'Storico intelligente + backup metadati',
      'Supporto multi-mese e trend anomali',
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">X-PAY CHECK</h1>
              <p className="text-sm text-slate-600">
                Controllo cedolino, registrazione profilo lavoro, gestione piani Free/Pro
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">
              piano {plan}
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {card(
            'Accesso account',
            <div className="space-y-4">
              <div className="inline-flex rounded-xl border border-slate-300 p-1">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                    authMode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-700'
                  }`}
                >
                  <LogIn size={16} /> Login
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                    authMode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-700'
                  }`}
                >
                  <UserPlus size={16} /> Registrazione
                </button>
              </div>

              {authMode === 'register' && (
                <input
                  className={inputClass()}
                  placeholder="Nome e cognome"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              )}

              <input
                className={inputClass()}
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />

              <input
                className={inputClass()}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={googleAuthorized}
                  onChange={(e) => setGoogleAuthorized(e.target.checked)}
                />
                Autorizzo accesso rapido con Google
              </label>

              {googleAuthorized && (
                <button className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-sm font-medium text-slate-900">
                  Continua con Google
                </button>
              )}

              <button className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white">
                {authMode === 'login' ? 'Accedi' : 'Crea account'}
              </button>
            </div>,
          )}

          {card(
            'Dati lavoro e contratto',
            <div className="grid gap-3">
              <input
                className={inputClass()}
                placeholder="Azienda"
                value={form.company}
                onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
              />
              <input
                className={inputClass()}
                placeholder="CCNL"
                value={form.ccnl}
                onChange={(e) => setForm((s) => ({ ...s, ccnl: e.target.value }))}
              />
              <input
                className={inputClass()}
                placeholder="Tipo contratto"
                value={form.contractType}
                onChange={(e) => setForm((s) => ({ ...s, contractType: e.target.value }))}
              />
              <input
                className={inputClass()}
                placeholder="Livello"
                value={form.level}
                onChange={(e) => setForm((s) => ({ ...s, level: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass()}
                  placeholder="Ore settimanali"
                  value={form.weeklyHours}
                  onChange={(e) => setForm((s) => ({ ...s, weeklyHours: e.target.value }))}
                />
                <input
                  className={inputClass()}
                  placeholder="Turnazione"
                  value={form.shiftType}
                  onChange={(e) => setForm((s) => ({ ...s, shiftType: e.target.value }))}
                />
              </div>
            </div>,
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {card(
            'Funzionalità Free',
            <ul className="space-y-2 text-sm text-slate-700">
              {freeFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-600" />
                  {item}
                </li>
              ))}
              <button
                onClick={() => setPlan('free')}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-900"
              >
                Seleziona Free
              </button>
            </ul>,
          )}

          {card(
            'Funzionalità Pro',
            <ul className="space-y-2 text-sm text-slate-700">
              {proFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Crown size={16} className="mt-0.5 text-amber-500" />
                  {item}
                </li>
              ))}
              <button
                onClick={() => setPlan('pro')}
                className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white"
              >
                Passa a Pro
              </button>
            </ul>,
          )}
        </section>

        {card(
          'Dashboard iniziale',
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Stato profilo</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Completabile</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Piano attivo</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{plan.toUpperCase()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Audit</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                <LayoutDashboard size={14} /> Pronto
              </p>
            </div>
          </div>,
        )}
      </div>
    </main>
  );
}
