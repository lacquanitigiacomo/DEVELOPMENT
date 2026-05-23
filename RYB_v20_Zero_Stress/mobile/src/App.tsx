import { useState } from 'react';
import { Camera, TrendingUp, Wallet, ArrowLeft, Briefcase, FileText, Clock, Gavel, Upload } from 'lucide-react';

type Page = 'home' | 'scan' | 'stats' | 'ccnl' | 'payslip' | 'schedule' | 'audit';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const menuItems = [
    { id: 'scan' as Page, icon: <Camera size={24} />, label: 'Scannerizza', color: 'bg-blue-600' },
    { id: 'stats' as Page, icon: <TrendingUp size={24} />, label: 'Statistiche', color: 'bg-purple-600' },
    { id: 'ccnl' as Page, icon: <Briefcase size={24} />, label: 'Il tuo CCNL', color: 'bg-amber-600' },
    { id: 'payslip' as Page, icon: <FileText size={24} />, label: 'Buste Paga', color: 'bg-emerald-600' },
    { id: 'schedule' as Page, icon: <Clock size={24} />, label: 'Orari', color: 'bg-rose-600' },
    { id: 'audit' as Page, icon: <Gavel size={24} />, label: 'Audit CCNL', color: 'bg-ryb-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 max-w-md mx-auto">
      {page === 'home' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-ryb-600 rounded-xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">RYB Mobile</h1>
              <p className="text-xs text-gray-500">Are You Broke? — Audit Lavoratore</p>
            </div>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="text-sm text-gray-500 mb-1">Bilancio Mensile</div>
            <div className="text-3xl font-bold">€ 1,240</div>
            <div className="text-xs text-ryb-500 mt-1">+12% rispetto al mese scorso</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`${item.color} p-4 rounded-xl flex flex-col items-center gap-2 text-white active:scale-95 transition`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-xl">
            <div className="text-sm text-amber-400 font-medium mb-1">⚠️ Azione richiesta</div>
            <div className="text-xs text-gray-400">Completa il profilo lavoratore per l'audit CCNL</div>
          </div>
        </div>
      )}

      {page !== 'home' && (
        <div className="p-4">
          <button onClick={() => setPage('home')} className="flex items-center gap-2 text-gray-400 mb-4">
            <ArrowLeft size={20} /> Indietro
          </button>

          {page === 'scan' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Scannerizza Scontrino</h2>
              <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-700">
                <Camera size={48} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-500">Punta la fotocamera verso lo scontrino. L'AI estrarrà i dati.</p>
              <button className="w-full py-3 bg-ryb-600 rounded-lg text-white font-semibold">📸 Scatta Foto</button>
            </div>
          )}

          {page === 'stats' && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Statistiche</h2>
              {['Affitto €800', 'Cibo €450', 'Trasporti €120', 'CCNL Deduzioni €0'].map((item, i) => (
                <div key={i} className="p-3 bg-gray-900 rounded-lg flex justify-between">
                  <span className="text-sm">{item.split(' ')[0]}</span>
                  <span className="font-mono font-bold">{item.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          )}

          {page === 'ccnl' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Il tuo CCNL</h2>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <div className="text-sm text-gray-500">Contratto attivo</div>
                <div className="font-bold text-lg">CCNL Pulizie e Multiservizi</div>
                <div className="text-xs text-gray-500 mt-1">Minimo: €1,100/mese | Ore: 40/settimana</div>
              </div>
              <button className="w-full py-3 bg-gray-800 rounded-lg text-sm">🔄 Cambia CCNL</button>
            </div>
          )}

          {page === 'payslip' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Buste Paga</h2>
              <div className="p-6 bg-gray-900 rounded-xl border border-dashed border-gray-700 flex flex-col items-center gap-3">
                <Upload size={32} className="text-gray-500" />
                <p className="text-sm text-gray-400">Carica PDF o foto</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm font-medium">Ultima analisi</div>
                <div className="text-xs text-gray-500">Lordo: €1,850 | Netto: €1,420 | ✅ Conforme CCNL</div>
              </div>
            </div>
          )}

          {page === 'schedule' && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Orari Settimanali</h2>
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven'].map((day, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="text-sm font-medium">{day}</span>
                  <span className="text-sm text-gray-400">09:00 - 17:00</span>
                  <span className="text-sm font-bold">8h</span>
                </div>
              ))}
              <div className="text-center text-sm text-gray-500 pt-2">
                Totale: 40h/sett | ~173h/mese
              </div>
            </div>
          )}

          {page === 'audit' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Audit CCNL</h2>
              <button className="w-full py-4 bg-ryb-600 rounded-xl text-white font-bold">
                🔍 Avvia Audit
              </button>
              <div className="p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
                <div className="text-sm text-amber-400">⚠️ 1 problema rilevato</div>
                <div className="text-xs text-gray-400 mt-1">Nessun rimborso trasporti — verifica art. 14 CCNL</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
