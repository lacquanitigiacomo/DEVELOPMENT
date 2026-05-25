import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, FileText, Clock, ArrowRight, Check, AlertCircle } from 'lucide-react';

const CCNL_OPTIONS = [
  { code: 'CCNL-COMMERCIO', name: 'Commercio e Terziario' },
  { code: 'CCNL-EDILIZIA', name: 'Edilizia e Industrie Affini' },
  { code: 'CCNL-METALMECCANICO', name: 'Metalmeccanico e Installazione' },
  { code: 'CCNL-TRASPORTO', name: 'Trasporto e Logistica' },
  { code: 'CCNL-SANITA', name: 'Sanità Privata' },
  { code: 'CCNL-ALBERGHIERO', name: 'Alberghiero e Turismo' },
  { code: 'CCNL-AGRICOLTURA', name: 'Agricoltura' },
  { code: 'CCNL-ARTIGIANATO', name: 'Artigianato' },
  { code: 'CCNL-BANCARIO', name: 'Bancario e Assicurativo' },
  { code: 'ALTRO', name: 'Altro / Non so' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [ccnl, setCcnl] = useState('');
  const [hasPayslips, setHasPayslips] = useState<boolean | null>(null);
  const [hasHours, setHasHours] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ryb_token');
    if (!token) { navigate('/login'); return; }
    // Check if onboarding already done
    axios.get('http://localhost:3001/api/v1/user/work-profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.onboardingComplete) navigate('/dashboard');
    }).catch(() => {});
  }, [navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('ryb_token');
      await axios.post('http://localhost:3001/api/v1/user/work-profile', {
        ccnl, hasPayslips, hasHours,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!ccnl;
    if (step === 2) return hasPayslips !== null;
    if (step === 3) return hasHours !== null;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['CCNL', 'Buste Paga', 'Orari'].map((label, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step > i + 1 ? 'bg-ryb-500 text-white' :
                step === i + 1 ? 'bg-ryb-600 text-white ring-2 ring-ryb-400' :
                'bg-gray-800 text-gray-500'
              }`}>
                {step > i + 1 ? <Check size={18} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 ${step >= i + 1 ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-ryb-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Step 1: CCNL */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-ryb-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-ryb-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Quale CCNL hai a lavoro?</h1>
            <p className="text-gray-400">Il tuo contratto collettivo nazionale ci aiuta a verificare la correttezza della tua retribuzione.</p>
          </div>

          <div className="grid gap-3">
            {CCNL_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => setCcnl(opt.code)}
                className={`p-4 rounded-xl text-left border transition flex items-center justify-between ${
                  ccnl === opt.code
                    ? 'border-ryb-500 bg-ryb-900/20'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <span className="font-medium">{opt.name}</span>
                {ccnl === opt.code && <Check size={18} className="text-ryb-500" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Payslips */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-ryb-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-ryb-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Hai i files delle buste paga?</h1>
            <p className="text-gray-400">Caricale per confrontarle con gli orari e verificare che tutto sia corretto.</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => setHasPayslips(true)}
              className={`p-6 rounded-xl border text-center transition ${
                hasPayslips === true
                  ? 'border-ryb-500 bg-ryb-900/20'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <Check size={28} className="mx-auto mb-3 text-ryb-500" />
              <div className="font-semibold text-lg">Sì, le ho</div>
              <div className="text-gray-400 text-sm mt-1">PDF o immagini delle ultime buste paga</div>
            </button>

            <button
              onClick={() => setHasPayslips(false)}
              className={`p-6 rounded-xl border text-center transition ${
                hasPayslips === false
                  ? 'border-amber-500 bg-amber-900/20'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <AlertCircle size={28} className="mx-auto mb-3 text-amber-500" />
              <div className="font-semibold text-lg">No, non le ho</div>
              <div className="text-gray-400 text-sm mt-1">Ti aiuteremo a richiederle al datore di lavoro</div>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Hours */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-ryb-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-ryb-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Hai degli orari comunicati?</h1>
            <p className="text-gray-400">Cartellini, fogli presenze, orari scritti — qualsiasi traccia delle ore lavorate.</p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => setHasHours(true)}
              className={`p-6 rounded-xl border text-center transition ${
                hasHours === true
                  ? 'border-ryb-500 bg-ryb-900/20'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <Check size={28} className="mx-auto mb-3 text-ryb-500" />
              <div className="font-semibold text-lg">Sì, ce li ho</div>
              <div className="text-gray-400 text-sm mt-1">Cartellini, fogli Excel, foto, qualsiasi formato</div>
            </button>

            <button
              onClick={() => setHasHours(false)}
              className={`p-6 rounded-xl border text-center transition ${
                hasHours === false
                  ? 'border-amber-500 bg-amber-900/20'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <AlertCircle size={28} className="mx-auto mb-3 text-amber-500" />
              <div className="font-semibold text-lg">No, non ce li ho</div>
              <div className="text-gray-400 text-sm mt-1">Ti aiuteremo a ricostruirli o richiederli</div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition">
            Indietro
          </button>
        ) : <div />}

        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep(s => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-3 rounded-lg bg-ryb-600 hover:bg-ryb-700 text-white font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Avanti <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="px-6 py-3 rounded-lg bg-ryb-600 hover:bg-ryb-700 text-white font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? '...' : <><Check size={18} /> Inizia Audit</>}
          </button>
        )}
      </div>
    </div>
  );
}
