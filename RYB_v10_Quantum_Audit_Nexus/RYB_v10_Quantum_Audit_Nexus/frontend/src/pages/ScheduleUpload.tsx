import { useState } from 'react';
import { Clock, Upload, Check, AlertTriangle } from 'lucide-react';

interface DaySchedule {
  day: string;
  hours: number;
  start?: string;
  end?: string;
}

export default function ScheduleUpload() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: 'Lunedì', hours: 8, start: '09:00', end: '17:00' },
    { day: 'Martedì', hours: 8, start: '09:00', end: '17:00' },
    { day: 'Mercoledì', hours: 8, start: '09:00', end: '17:00' },
    { day: 'Giovedì', hours: 8, start: '09:00', end: '17:00' },
    { day: 'Venerdì', hours: 8, start: '09:00', end: '17:00' },
  ]);
  const [saved, setSaved] = useState(false);

  const updateDay = (index: number, field: keyof DaySchedule, value: any) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const totalHours = schedule.reduce((s, d) => s + d.hours, 0);
  const monthlyHours = Math.round(totalHours * 4.33 * 100) / 100;

  const save = () => {
    // In prod: chiama API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Clock size={24} className="text-ryb-500" /> Orari di Lavoro
      </h1>
      <p className="text-gray-400 mb-6">Inserisci gli orari comunicati dal datore di lavoro. Li confronteremo con la busta paga.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="space-y-4">
          {schedule.map((day, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-center">
              <div className="font-medium text-sm">{day.day}</div>
              <input
                type="time"
                value={day.start}
                onChange={e => updateDay(i, 'start', e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
              />
              <input
                type="time"
                value={day.end}
                onChange={e => updateDay(i, 'end', e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
              />
              <div className="text-right text-sm text-gray-400">{day.hours}h</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Settimanali: <span className="text-white font-semibold">{totalHours}h</span></div>
            <div className="text-sm text-gray-500">Mensili (~): <span className="text-white font-semibold">{monthlyHours}h</span></div>
          </div>
          <button
            onClick={save}
            className="px-4 py-2 bg-ryb-600 hover:bg-ryb-700 rounded-lg text-white text-sm font-semibold transition"
          >
            {saved ? <><Check size={16} /> Salvato</> : 'Salva Orari'}
          </button>
        </div>
      </div>

      <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
          <div className="text-sm text-amber-400">
            <strong>Importante:</strong> Gli orari devono essere <em>comunicati</em> (art. 7 Statuto Lavoratori), non solo concordati verbalmente.
            Se non li hai in forma scritta, richiedili all'HR.
          </div>
        </div>
      </div>
    </div>
  );
}
