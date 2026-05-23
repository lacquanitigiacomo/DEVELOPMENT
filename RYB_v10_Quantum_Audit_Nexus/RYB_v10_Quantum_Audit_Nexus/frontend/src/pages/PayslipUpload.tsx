import { useState, useCallback } from 'react';
import { Upload, FileText, X, Camera, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function PayslipUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
  });

  const analyze = async () => {
    setAnalyzing(true);
    // Simula analisi — in prod chiama API
    setTimeout(() => {
      setResult({
        valid: true,
        grossSalary: 1850,
        netSalary: 1420,
        hoursWorked: 173,
        ccnl: 'CCNL-PULIZIE',
        issues: [],
        checks: [
          { check: 'Minimo salariale', passed: true },
          { check: 'Ore mensili', passed: true },
        ],
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Carica Buste Paga</h1>
      <p className="text-gray-400 mb-6">Carica le tue buste paga in PDF o foto. L'AI le analizzerà automaticamente.</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer
          ${isDragActive ? 'border-ryb-500 bg-ryb-900/10' : 'border-gray-700 bg-gray-900'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 text-gray-500" size={40} />
        <p className="text-gray-300">{isDragActive ? 'Rilascia qui...' : 'Trascina i file o clicca per selezionare'}</p>
        <p className="text-sm text-gray-500 mt-1">PDF, PNG, JPG — max 10MB</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-ryb-500" />
                <span className="text-sm">{f.name}</span>
              </div>
              <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400">
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={analyze}
            disabled={analyzing}
            className="w-full py-3 bg-ryb-600 hover:bg-ryb-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
          >
            {analyzing ? 'Analisi in corso...' : '🔍 Analizza con AI'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-ryb-500" /> Risultato Analisi
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500">Lordo</div>
              <div className="text-xl font-bold">€ {result.grossSalary}</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500">Netto</div>
              <div className="text-xl font-bold">€ {result.netSalary}</div>
            </div>
          </div>
          <div className="space-y-2">
            {result.checks.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-ryb-500" />
                {c.check}: {c.passed ? '✅ Conforme' : '❌ Problema'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
