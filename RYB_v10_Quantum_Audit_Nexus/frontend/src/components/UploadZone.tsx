import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useRYBStore } from '@/store/agentStore';
import { uploadAPI } from '@/services/api';
import type { AnalysisDepth } from '@/types';
import { Upload, File, X, Shield, Clock, Brain, Atom } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onUploadComplete?: (jobId: string) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const navigate = useNavigate();
  const addJob = useRYBStore((s) => s.addJob);
  const setActiveJob = useRYBStore((s) => s.setActiveJob);

  const [depth, setDepth] = useState<AnalysisDepth>('standard');
  const [files, setFiles] = useState<File[]>([]);
  const [timeSheets, setTimeSheets] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const onDropTimeSheets = useCallback((acceptedFiles: File[]) => {
    setTimeSheets((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.webp'],
    },
    multiple: true,
  });

  const timeSheetDropzone = useDropzone({
    onDrop: onDropTimeSheets,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeTimeSheet = (index: number) => {
    setTimeSheets((prev) => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (files.length === 0) {
      toast.error('Carica almeno un documento');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Avvio analisi multi-agente...');

    try {
      const result = await uploadAPI.uploadDocuments(files, depth, timeSheets);
      toast.success(`Analisi avviata! Job #${result.jobId.slice(0, 8)}`, { id: toastId });

      // Crea job locale per UI
      const newJob = {
        id: result.jobId,
        userId: 'current',
        depth,
        status: 'pending' as const,
        documents: result.documents,
        payrolls: [],
        anomalies: [],
        reconstructed: [],
        agentMessages: [],
        reliabilityScore: 0,
        startedAt: new Date().toISOString(),
      };

      addJob(newJob);
      setActiveJob(newJob);
      onUploadComplete?.(result.jobId);
      navigate(`/job/${result.jobId}`);
    } catch (error) {
      toast.error('Errore avvio analisi', { id: toastId });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const depths: { value: AnalysisDepth; label: string; desc: string; icon: React.ElementType; time: string }[] = [
    { value: 'basic', label: 'Basic', desc: 'Verifica formale e anomalie evidenti', icon: Shield, time: '2-5 min' },
    { value: 'standard', label: 'Standard', desc: 'Incrocio orari/paga e ricostruzione parziale', icon: Clock, time: '10-20 min' },
    { value: 'deep', label: 'Deep Audit', desc: 'Revisione completa con ricostruzione dati mancanti', icon: Brain, time: '30-60 min' },
    { value: 'quantum', label: 'Quantum Nexus', desc: 'Analisi predittiva, federata e notarizzata', icon: Atom, time: '60-90 min' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nuova Analisi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Carica buste paga, orari, foto, PDF. Il sistema agentico farà il resto.
        </p>
      </div>

      {/* Depth Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {depths.map((d) => (
          <button
            key={d.value}
            onClick={() => setDepth(d.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              depth === d.value
                ? 'border-ryb-500 bg-ryb-50 dark:bg-ryb-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <d.icon className={`w-5 h-5 ${depth === d.value ? 'text-ryb-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium text-gray-400">{d.time}</span>
            </div>
            <p className={`font-semibold ${depth === d.value ? 'text-ryb-700' : 'text-gray-700 dark:text-gray-300'}`}>
              {d.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{d.desc}</p>
          </button>
        ))}
      </div>

      {/* Document Dropzone */}
      <div
        {...dropzoneProps.getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dropzoneProps.isDragActive
            ? 'border-ryb-500 bg-ryb-50 dark:bg-ryb-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...dropzoneProps.getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {dropzoneProps.isDragActive ? 'Rilascia i file qui...' : 'Trascina buste paga, foto, PDF'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Supporta scansioni sfocate, foto smartphone, PDF non testuali
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Documenti ({files.length})
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <File className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                  <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Time Sheets Dropzone */}
      <div
        {...timeSheetDropzone.getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          timeSheetDropzone.isDragActive
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...timeSheetDropzone.getInputProps()} />
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Opzionale: carica orari, letture badge, CSV Excel
        </p>
      </div>

      {timeSheets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {timeSheets.map((file, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
              {file.name}
              <button onClick={() => removeTimeSheet(i)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={startAnalysis}
        disabled={uploading || files.length === 0}
        className="w-full py-3 bg-ryb-600 text-white rounded-xl font-semibold hover:bg-ryb-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all quantum-glow"
      >
        {uploading ? 'Avvio Swarm Agentico...' : `Avvia Analisi ${depth.toUpperCase()}`}
      </button>
    </div>
  );
}