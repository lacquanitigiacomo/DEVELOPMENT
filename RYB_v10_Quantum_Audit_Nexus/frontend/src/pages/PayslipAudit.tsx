import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, Clock, Shield, AlertTriangle, Check, ArrowLeft } from 'lucide-react';

export default function PayslipAudit() {
  const navigate = useNavigate();
  const [payslipFile, setPayslipFile] = useState<File | null>(null);
  const [hoursFile, setHoursFile] = useState<File | null>(null);
  const [payslipData, setPayslipData] = useState<any>(null);
  const [hoursData, setHoursData] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ryb_token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handlePayslipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayslipFile(file);
    setLoading(true);
    try {
      const token = localStorage.getItem('ryb_token');
      // Simula upload — in produzione usa FormData con multer
      const res = await axios.post('http://localhost:3001/api/v1/upload/payslip', {
        fileData: 'base64mock',
        month: '05',
        year: '2026',
      }, { headers: { Authorization: `Bearer ${token}` } });
      setPayslipData(res.data.extracted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHoursUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHoursFile(file);
    setLoading(true);
    try {
      const token = localStorage.getItem('ryb_token');
      const res = await axios.post('http://localhost:3001/api/v1/upload/hours', {
        fileData: 'base64mock',
        month: '05',
        year: '2026',
        entries: [
          { date: '2026-05-01', hours: 8 },
          { date: '2026-05-02', hours: 8 },
          { date: '2026-05-03', hours: 6 },
        ],
      }, { headers: { Authorization: `Bearer ${token}` } });
      setHoursData(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runVerification = async () => {
    if (!payslipData || !hoursData) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('ryb_token');
      const res = await axios.post('http://localhost:3001/api/v1/verify/payslip', {
        payslipData,
        hoursData,
        ccnl: 'CCNL-COMMERCIO',
      }, { headers: { Authorization: `Bearer ${token}` } });
      setVerification(res.data.result || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
        <ArrowLeft size={18} /> Torna alla Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold mb-2">🔍 Audit Busta Paga</h1>
        <p className="text-gray-400">Carica busta paga e orari per verificare correttezza e completezza.</p>
      </div>

      {/* Upload Zone */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-ryb-500" />
            <h3 className="font-semibold">Busta Paga</h3>
          </div>
          <label className="block w-full p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-ryb-500/50 cursor-pointer text-center transition">
            <Upload className="mx-auto mb-2 text-gray-500" />
            <span className="text-gray-400 text-sm">{payslipFile ? payslipFile.name : 'Trascina o clicca per caricare PDF/immagine'}</span>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handlePayslipUpload} />
          </label>
          {payslipData && (
            <div className="mt-4 p-3 rounded-lg bg-gray-800 text-sm space-y-1">
              <div className="flex justify-between"><span>Lordo:</span><span className="font-mono">€{payslipData.grossAmount}</span></div>
              <div className="flex justify-between"><span>Netto:</span><span className="font-mono">€{payslipData.netAmount}</span></div>
              <div className="flex justify-between"><span>Orario:</span><span className="font-mono">€{payslipData.hourlyRate}/h</span></div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-blue-500" />
            <h3 className="font-semibold">Orari / Presenze</h3>
          </div>
          <label className="block w-full p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-blue-500/50 cursor-pointer text-center transition">
            <Upload className="mx-auto mb-2 text-gray-500" />
            <span className="text-gray-400 text-sm">{hoursFile ? hoursFile.name : 'Trascina o clicca per caricare orari'}</span>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" className="hidden" onChange={handleHoursUpload} />
          </label>
          {hoursData && (
            <div className="mt-4 p-3 rounded-lg bg-gray-800 text-sm space-y-1">
              <div className="flex justify-between"><span>Ore totali:</span><span className="font-mono">{hoursData.totalHours}h</span></div>
              <div className="flex justify-between"><span>Giorni:</span><span className="font-mono">{hoursData.entries?.length || 0}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Verify Button */}
      {payslipData && hoursData && (
        <button
          onClick={runVerification}
          disabled={loading}
          className="w-full py-4 bg-ryb-600 hover:bg-ryb-700 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Shield size={20} />
          {loading ? 'Analisi in corso...' : 'Avvia Verifica AI'}
        </button>
      )}

      {/* Results */}
      {verification && (
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {verification.verified ? <Check className="text-ryb-500" /> : <AlertTriangle className="text-amber-500" />}
            Risultato Verifica
          </h3>

          {verification.discrepancies?.length > 0 && (
            <div className="space-y-2">
              <div className="text-red-400 font-semibold">⚠️ Discrepanze rilevate:</div>
              {verification.discrepancies.map((d: string, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-red-900/20 border border-red-800/50 text-red-300 text-sm">
                  {d}
                </div>
              ))}
            </div>
          )}

          {verification.verified && (
            <div className="p-4 rounded-lg bg-ryb-900/20 border border-ryb-800/50 text-ryb-300">
              ✅ Nessuna discrepanza rilevata. Busta paga e orari sono coerenti.
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="p-3 rounded-lg bg-gray-800">
              <div className="text-gray-400">Lordo</div>
              <div className="font-mono font-bold">€{verification.payslipSummary?.gross}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800">
              <div className="text-gray-400">Netto</div>
              <div className="font-mono font-bold">€{verification.payslipSummary?.net}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800">
              <div className="text-gray-400">Ore</div>
              <div className="font-mono font-bold">{verification.payslipSummary?.totalHours}h</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
