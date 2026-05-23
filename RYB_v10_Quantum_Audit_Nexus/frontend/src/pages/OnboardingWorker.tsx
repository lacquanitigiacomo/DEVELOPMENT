import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Clock, ChevronRight, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface CCNL {
  code: string;
  name: string;
  sector: string;
}

export default function OnboardingWorker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ccnlList, setCcnlList] = useState<CCNL[]>([]);
  const [selectedCCNL, setSelectedCCNL] = useState('');
  const [hasPayslips, setHasPayslips] = useState<boolean | null>(null);
  const [hasSchedule, setHasSchedule] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/v1/payroll/ccnl').then(res => {
      setCcnlList(res.data.ccnl);
    });
  }, []);

  const steps = [
    { title: 'CCNL', icon: <Briefcase size={20} />, desc: 'Quale contratto hai a lavoro?' },
    { title: 'Buste Paga', icon: <FileText size={20} />, desc: 'Hai i file delle buste paga?' },
    { title: 'Orari', icon: <Clock size={20} />, desc: 'Hai gli orari comunicati?' },
  ];

  const handleNext = async () => {
    if (step === 2) {
      setLoading(true);
      try {
        const token = localStorage.getItem('ryb_token');
        await axios.post('http://localhost:3001/api/v1/payroll/profile/work', {
          ccnlCode: selectedCCNL,
          hasPayslips,
          hasSchedule,
        }, { headers: { Authorization: `Bearer ${token}` } });
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Errore nel salvataggio');
      } finally {
        setLoading(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!selectedCCNL;
    if (step === 1) return hasPayslips !== null;
    if (step === 2) return hasSchedule !== null;
    return false;
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition
              ${i < step ? 'bg-ryb-600 text-white' : i === step ? 'bg-ryb-500 text-white ring-2 ring-ryb-300' : 'bg-gray-800 text-gray-500'}`}>
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <span className="text-xs mt-2 text-gray-400 hidden sm:block">{s.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4 text-ryb-500">
          {steps[step].icon}
          <h2 className="text-xl font-bold">{steps[step].title}</h2>
        </div>
        <p className="text-gray-400 mb-6">{steps[step].desc}</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Step 0: CCNL */}
        {step === 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {ccnlList.map(ccnl => (
              <button
                key={ccnl.code}
                onClick={() => setSelectedCCNL(ccnl.code)}
                className={`w-full p-4 rounded-xl text-left transition border
                  ${selectedCCNL === ccnl.code 
                    ? 'border-ryb-500 bg-ryb-900/20' 
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
              >
                <div className="font-semibold">{ccnl.name}</div>
                <div className="text-sm text-gray-500">{ccnl.sector}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Buste Paga */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Le buste paga servono per verificare che il tuo stipendio rispetti il CCNL selezionato.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHasPayslips(true)}
                className={`p-4 rounded-xl border transition ${hasPayslips === true ? 'border-ryb-500 bg-ryb-900/20' : 'border-gray-700 bg-gray-800'}`}
              >
                <Check className="mx-auto mb-2 text-ryb-500" />
                <div className="font-medium">Sì, le ho</div>
                <div className="text-xs text-gray-500 mt-1">Cartacee o PDF</div>
              </button>
              <button
                onClick={() => setHasPayslips(false)}
                className={`p-4 rounded-xl border transition ${hasPayslips === false ? 'border-ryb-500 bg-ryb-900/20' : 'border-gray-700 bg-gray-800'}`}
              >
                <AlertTriangle className="mx-auto mb-2 text-amber-500" />
                <div className="font-medium">No, non le ho</div>
                <div className="text-xs text-gray-500 mt-1">Te le aiuteremo a richiedere</div>
              </button>
            </div>
            {hasPayslips === false && (
              <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800 text-amber-400 text-sm">
                💡 Ti aiuteremo a richiedere le buste paga all'HR. Puoi anche caricarle in seguito.
              </div>
            )}
          </div>
        )}

        {/* Step 2: Orari */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Gli orari comunicati (firmati o via mail) servono per confrontarli con le ore in busta paga.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHasSchedule(true)}
                className={`p-4 rounded-xl border transition ${hasSchedule === true ? 'border-ryb-500 bg-ryb-900/20' : 'border-gray-700 bg-gray-800'}`}
              >
                <Check className="mx-auto mb-2 text-ryb-500" />
                <div className="font-medium">Sì, li ho</div>
                <div className="text-xs text-gray-500 mt-1">Cartacei o digitali</div>
              </button>
              <button
                onClick={() => setHasSchedule(false)}
                className={`p-4 rounded-xl border transition ${hasSchedule === false ? 'border-ryb-500 bg-ryb-900/20' : 'border-gray-700 bg-gray-800'}`}
              >
                <AlertTriangle className="mx-auto mb-2 text-amber-500" />
                <div className="font-medium">No, non li ho</div>
                <div className="text-xs text-gray-500 mt-1">Te li aiuteremo a ottenere</div>
              </button>
            </div>
            {hasSchedule === false && (
              <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800 text-amber-400 text-sm">
                💡 Richiedi gli orari firmati al datore di lavoro. È un tuo diritto (art. 7 Statuto Lavoratori).
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronLeft size={18} /> Indietro
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2 px-6 py-2 bg-ryb-600 hover:bg-ryb-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? '...' : step === 2 ? 'Completa' : 'Avanti'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
