import { useMemo } from 'react';
import { Calendar } from '../components/Calendar';
import { plannerDefaultTimes, useScriptsStore } from '../features/store/useScriptsStore';
import { nanoid } from 'nanoid';

export function Planner() {
  const { scripts, planner, upsertPlanner, removePlanner, settings } = useScriptsStore();

  const backlog = useMemo(() => scripts.filter((script) => !planner.some((entry) => entry.scriptId === script.id)), [
    scripts,
    planner
  ]);

  const handleDrop = (dateISO: string, scriptId: string) => {
    const script = scripts.find((item) => item.id === scriptId);
    if (!script) return;
    const existing = planner.find((entry) => entry.scriptId === scriptId);
    const entryId = existing?.id ?? nanoid();
    upsertPlanner({
      id: entryId,
      scriptId,
      dateISO,
      platform: existing?.platform ?? settings.defaultPlatform,
      caption: existing?.caption ?? `Legenda baseada em ${script.output.devBullets[0] ?? 'roteiro'}`,
      hashtags: existing?.hashtags ?? ['#viral', '#conteudo'],
      status: existing?.status ?? 'Rascunho',
      suggestedTimes: plannerDefaultTimes[existing?.platform ?? settings.defaultPlatform]
    });
  };

  return (
    <div className="space-y-6">
      <section className="card" aria-labelledby="planner-backlog">
        <header className="flex items-center justify-between">
          <div>
            <h2 id="planner-backlog" className="section-title">
              Roteiros disponíveis para agendar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arraste um roteiro para o dia desejado no calendário.
            </p>
          </div>
          <span className="badge">{backlog.length} prontos</span>
        </header>
        <div className="mt-3 flex flex-wrap gap-2">
          {backlog.map((script) => (
            <div
              key={script.id}
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', script.id)}
              className="flex cursor-grab flex-col gap-1 rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs text-primary shadow-sm transition hover:border-primary dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="font-semibold">{script.title}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{script.objective}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{script.trends.join(', ') || 'Sem trend'}</span>
            </div>
          ))}
          {backlog.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Todos os roteiros já estão agendados. Ótima constância!</p>
          )}
        </div>
      </section>
      <Calendar
        planner={planner}
        scripts={scripts}
        onDrop={handleDrop}
        onUpdate={upsertPlanner}
        onRemove={removePlanner}
      />
    </div>
  );
}
