import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { useMemo, useState } from 'react';
import type { PlannerEntry, Script } from '../features/store/useScriptsStore';
import { plannerDefaultTimes } from '../features/store/useScriptsStore';

interface CalendarProps {
  planner: PlannerEntry[];
  scripts: Script[];
  onDrop: (dateISO: string, scriptId: string) => void;
  onUpdate: (entry: PlannerEntry) => void;
  onRemove: (id: string) => void;
}

const statusColors: Record<PlannerEntry['status'], string> = {
  Rascunho: 'bg-slate-200 text-slate-700',
  Aprovado: 'bg-emerald-200 text-emerald-800',
  Agendado: 'bg-amber-200 text-amber-800',
  Publicado: 'bg-blue-200 text-blue-800'
};

export function Calendar({ planner, scripts, onDrop, onUpdate, onRemove }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, date: Date) => {
    event.preventDefault();
    const scriptId = event.dataTransfer.getData('text/plain');
    if (scriptId) {
      onDrop(format(date, 'yyyy-MM-dd'), scriptId);
    }
  };

  const getEntriesForDay = (day: Date) => planner.filter((entry) => isSameDay(new Date(entry.dateISO), day));

  return (
    <section className="card" aria-labelledby="calendar">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="calendar" className="section-title">
            Planner de Postagens
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Arraste roteiros para as datas desejadas.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth((date) => subMonths(date, 1))}
            className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
          >
            Mês anterior
          </button>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button
            onClick={() => setCurrentMonth((date) => addMonths(date, 1))}
            className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
          >
            Próximo mês
          </button>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-semibold text-slate-500 dark:text-slate-400">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const entries = getEntriesForDay(day);
          return (
            <div
              key={day.toISOString()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, day)}
              className={`min-h-[140px] rounded-lg border p-2 transition ${
                isSameMonth(day, currentMonth)
                  ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                  : 'border-slate-100 bg-slate-100/60 text-slate-400 dark:border-slate-800/60 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">{format(day, 'd')}</span>
                {entries.length === 0 && isSameMonth(day, currentMonth) && (
                  <span className="text-[10px] text-slate-400">Arraste aqui</span>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {entries.map((entry) => {
                  const script = scripts.find((item) => item.id === entry.scriptId);
                  return (
                    <div key={entry.id} className="rounded-md border border-primary/20 bg-primary/5 p-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-primary">{script?.title ?? 'Roteiro removido'}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[entry.status]}`}>
                          {entry.status}
                        </span>
                      </div>
                      <label className="mt-2 block text-[11px] text-slate-500 dark:text-slate-300">
                        Plataforma
                        <select
                          value={entry.platform}
                          onChange={(event) => onUpdate({ ...entry, platform: event.target.value })}
                          className="mt-1"
                        >
                          {['Reels', 'TikTok', 'Shorts', 'Kwai'].map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="mt-2 block text-[11px] text-slate-500 dark:text-slate-300">
                        Legenda
                        <textarea
                          value={entry.caption}
                          onChange={(event) => onUpdate({ ...entry, caption: event.target.value })}
                          rows={2}
                          className="mt-1"
                        />
                      </label>
                      <label className="mt-2 block text-[11px] text-slate-500 dark:text-slate-300">
                        Hashtags
                        <input
                          value={entry.hashtags.join(', ')}
                          onChange={(event) => onUpdate({ ...entry, hashtags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
                          className="mt-1"
                          placeholder="#viral, #conteudo"
                        />
                      </label>
                      <label className="mt-2 block text-[11px] text-slate-500 dark:text-slate-300">
                        Status
                        <select
                          value={entry.status}
                          onChange={(event) => onUpdate({ ...entry, status: event.target.value as PlannerEntry['status'] })}
                          className="mt-1"
                        >
                          {(['Rascunho', 'Aprovado', 'Agendado', 'Publicado'] as PlannerEntry['status'][]).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                      {(() => {
                        const times = entry.suggestedTimes ?? plannerDefaultTimes[entry.platform] ?? [];
                        if (!times.length) return null;
                        return (
                          <p className="mt-2 text-[11px] text-primary">
                            Sugestão de horário: {times.join(' ou ')}
                          </p>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => onRemove(entry.id)}
                        className="mt-2 rounded-full border border-rose-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
