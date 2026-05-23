import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-ryb-400 to-emerald-300 bg-clip-text text-transparent">
          Are You Broke?
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          L'audit finanziario potenziato dall'AI. Scopri dove finiscono i tuoi soldi e come risparmiare.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-ryb-600 hover:bg-ryb-700 rounded-xl text-white font-semibold text-lg transition"
        >
          Inizia Gratis <ArrowRight size={20} />
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <TrendingUp size={32} />, title: 'Analisi AI', desc: 'Algoritmi avanzati per analizzare le tue spese e trovare risparmi nascosti.' },
          { icon: <Shield size={32} />, title: 'Sicuro & Privato', desc: 'I tuoi dati finanziari restano locali. Crittografia end-to-end.' },
          { icon: <Zap size={32} />, title: 'Zero Cash APIs', desc: 'Usiamo solo API gratuite o self-hosted. Nessun costo nascosto.' },
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-ryb-600/50 transition">
            <div className="text-ryb-500 mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
