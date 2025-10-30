import { useMemo, useState } from 'react';
import type { Script } from '../features/store/useScriptsStore';

interface SidebarProps {
  scripts: Script[];
  onSelect: (script: Script) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ scripts, onSelect, onDuplicate, onDelete }: SidebarProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return scripts;
    return scripts.filter((script) =>
      script.title.toLowerCase().includes(normalized) || script.briefing.toLowerCase().includes(normalized)
    );
  }, [query, scripts]);

  return (
    <aside className="hidden w-full max-w-xs flex-col gap-3 border-r border-slate-200 bg-slate-100/60 p-4 dark:border-slate-800 dark:bg-slate-900/60 lg:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Roteiros salvos</h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{scripts.length}</span>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        placeholder="Buscar por título ou briefing"
        aria-label="Buscar roteiros salvos"
      />
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum roteiro encontrado.</p>
        )}
        {filtered.map((script) => (
          <article
            key={script.id}
            className="group rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm transition hover:border-primary dark:border-slate-700 dark:bg-slate-800"
          >
            <header className="flex items-center justify-between">
              <button
                onClick={() => onSelect(script)}
                className="text-left text-sm font-semibold text-slate-800 underline-offset-2 transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-slate-100"
              >
                {script.title}
              </button>
              <span className="badge">{script.status}</span>
            </header>
            <p className="mt-2 max-h-16 overflow-hidden text-ellipsis text-slate-500 dark:text-slate-400">
              {script.briefing || 'Sem briefing salvo'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDuplicate(script.id)}
                className="rounded-full border border-primary/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Duplicar
              </button>
              <button
                type="button"
                onClick={() => onDelete(script.id)}
                className="rounded-full border border-rose-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-500 transition hover:border-rose-400 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                Remover
              </button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
