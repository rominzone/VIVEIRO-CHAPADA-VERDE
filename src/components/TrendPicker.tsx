import { useState } from 'react';

interface TrendPickerProps {
  available: string[];
  selected: string[];
  onChange: (trends: string[]) => void;
}

export function TrendPicker({ available, selected, onChange }: TrendPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTrend = (trend: string) => {
    if (selected.includes(trend)) {
      onChange(selected.filter((item) => item !== trend));
    } else {
      onChange([...selected, trend]);
    }
  };

  return (
    <section className="card" aria-labelledby="trend-picker">
      <header className="flex items-center justify-between">
        <h3 id="trend-picker" className="section-title">
          Trends internas
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-expanded={isOpen}
        >
          {isOpen ? 'Fechar' : 'Escolher'}
        </button>
      </header>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Combine uma trend com o seu nicho para reforçar timing.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map((trend) => (
          <span key={trend} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
            {trend}
            <button
              type="button"
              onClick={() => toggleTrend(trend)}
              className="text-[10px] uppercase"
              aria-label={`Remover trend ${trend}`}
            >
              ×
            </button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400">Nenhuma trend selecionada.</span>}
      </div>
      {isOpen && (
        <div className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
          {available.map((trend) => (
            <label key={trend} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-primary/10 dark:hover:bg-primary/20">
              <input
                type="checkbox"
                checked={selected.includes(trend)}
                onChange={() => toggleTrend(trend)}
              />
              <span>{trend}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
